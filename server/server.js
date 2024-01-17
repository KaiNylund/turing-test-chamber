import { WebSocketServer } from 'ws';
import { getGPT3Response } from "./APICalls.js";
import { setupDB, storeMessage, storeUser, getLatestMessages,
         closeDB, getGameStats, storeGuess } from "./dbUtils.js";
import { truncateGPT3Text, createNewGPT3Prompt, getUniqueID } from './serverUtils.js';

import Debug from "debug";
const debug = Debug("server");

const MSG_ROUTING_ERR_CODE = 400;
const MSG_ROUTING_ERR_TEXT = "Invalid route";
const MSG_CONTENT_ERR_TEXT = "Bad message content";
const GEN_SERVER_ERR_CODE = 500;
let CUR_ERR_CODE = 100;

const wss = new WebSocketServer({port: 2643, clientTracking: true});
let con = null; // Connection to local MySQL server

let playerIDs = [];
let idToSocket = {};
let gpt3ID = "";
let guesserID = "";
let trickerID = "";
let trickerRole = ""; // "p1" or "p2"
let gpt3Role = ""; // "p1" or "p2"
let curMessageNum = 0;

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function setServerErrCode(code) {
  CUR_ERR_CODE = code;
}

async function newGuesserMessage(data) {
  let guesserMessage = JSON.parse(data);
  try {
    switch (guesserMessage.route.trim()) {
      case "player/message":
        // store in local SQL server
        await storeMessage(con, guesserID, guesserMessage.player,
                           guesserMessage.message, curMessageNum)
        // Send the guesser's message to the tricker immediately
        idToSocket[trickerID].send(JSON.stringify(guesserMessage));
        // Also send them a message here to say they should start waiting for gpt3
        idToSocket[trickerID].send(JSON.stringify({route: "state/wait",
                                                   forEvent: "gpt3Message", value: true}));
        let gpt3Input = await createNewGPT3Prompt(con, guesserMessage.message, guesserID, gpt3ID);
        let gpt3Response = await getGPT3Response(gpt3Input);

        // store in local SQL server
        await storeMessage(con, gpt3ID, gpt3Role, gpt3Response, curMessageNum);
        // Send a truncated version of gpt3's response to the tricker first so they have a chance
        // to copy part of it
        idToSocket[trickerID].send(JSON.stringify({route: "state/wait", forEvent: "gpt3Message",
                                                   value: false}));
        idToSocket[trickerID].send(JSON.stringify({route: "player/message",
                                                   message: truncateGPT3Text(gpt3Response),
                                                   player: gpt3Role}));
        break

      case "player/guess":
        let guessOutcome = (guesserMessage.guess === gpt3Role) ? "correct" : "incorrect";
        idToSocket[guesserID].send(JSON.stringify({route: "state/guessOutcome",
                                                   guessOutcome: guessOutcome}));
        idToSocket[trickerID].send(JSON.stringify({route: "state/guessOutcome",
                                                   guessOutcome: guessOutcome}));

        await storeGuess(con, guesserID, guesserMessage.guess, guessOutcome);
        let gameStats = await getGameStats(con, guesserID, trickerID, gpt3ID);
        idToSocket[guesserID].send(JSON.stringify({route: "gameStats", stats: gameStats}));
        idToSocket[trickerID].send(JSON.stringify({route: "gameStats", stats: gameStats}));
        break

      default:
        setServerErrCode(MSG_ROUTING_ERR_CODE);
        throw MSG_ROUTING_ERR_TEXT;
    }
  } catch (err) {
    setServerErrCode(MSG_ROUTING_ERR_CODE);
    throw MSG_CONTENT_ERR_TEXT;
  }
}

async function newTrickerMessage(data) {
  let lastGPT3Messages = await getLatestMessages(con, gpt3ID);
  if (lastGPT3Messages.length > 0) {
    try {
      let trickerMessage = JSON.parse(data);
      switch(trickerMessage.route.trim()) {
        case "player/message":
          await storeMessage(con, trickerID, trickerMessage.player,
                             trickerMessage.message, curMessageNum);
          curMessageNum += 1;
          // Send the tricker's message and latest gpt3 message to the guesser at the same
          // time once they are received.
          idToSocket[guesserID].send(JSON.stringify({route: "player/message",
                                                    message: trickerMessage.message,
                                                    player: trickerRole}));
          idToSocket[guesserID].send(JSON.stringify({route: "player/message",
                                                    message: lastGPT3Messages[0].text,
                                                    player: gpt3Role}));
          break
        default:
          setServerErrCode(MSG_ROUTING_ERR_CODE);
          throw MSG_ROUTING_ERR_TEXT;
      }
    } catch (err) {
      setServerErrCode(MSG_ROUTING_ERR_CODE);
      throw MSG_CONTENT_ERR_TEXT;
    }
  }
}

function playerClose(playerID) {
  debug("connection to " + playerID + " closed");
  for (let [id, socket] of Object.entries(idToSocket)) {
    debug("removing listeners from: " + id);
    socket.removeListener('message', newGuesserMessage);
    socket.removeListener('message', newTrickerMessage);
  }
  delete idToSocket[playerID];

  // Make sure remaining connections go back into the "loading" state
  for (let socket of Object.values(idToSocket)) {
    socket.send(JSON.stringify({route: "otherPlayerDC"}));
  }
  playerIDs.splice(playerIDs.indexOf(playerID), 1);
  guesserID = "";
  trickerID = "";
  gpt3ID = "";
  trickerRole = "";
  gpt3Role = "";
  curMessageNum = 0;
}


async function assignPlayerRoles() {
  try {
    // First coin flip for who's guessing and who's trying to trick the guesser
    guesserID = playerIDs[0];
    trickerID = playerIDs[1];
    if (Math.random() > 0.5) {
      guesserID = playerIDs[1];
      trickerID = playerIDs[0];
    }
    gpt3ID = "gpt-3-" + guesserID;
    // Second coin flip to determine if tricker is p1 or p2
    gpt3Role = "p2";
    trickerRole = "p1";
    if (Math.random() > 0.5) {
      gpt3Role = "p1";
      trickerRole = "p2";
    }
    idToSocket[guesserID].send(JSON.stringify({route: "state/role", role: "guesser"}));
    idToSocket[trickerID].send(JSON.stringify({route: "state/role", role: trickerRole}));
    //debug("guesserID: " + guesserID);
    //debug("trickerID: " + trickerID);

    idToSocket[guesserID].on("message", newGuesserMessage);
    idToSocket[trickerID].on("message", newTrickerMessage);
    await storeUser(con, guesserID, "guesser");
    await storeUser(con, trickerID, trickerRole);

  } catch (err) {
    setServerErrCode(GEN_SERVER_ERR_CODE);
    throw "Could not assign player roles: " + err.toString();
  }
}

wss.on("listening", () => {
  debug("Server is listening at port 2643");
})

// Everything loads pretty much instantly since this is all run locally, so we add some
// sneaky setTimeout calls to simulate how the loading bar might look if this was
// deployed
wss.on("connection", async (ws) => {
  try {
    await timeout(250);
    ws.send(JSON.stringify({route: "state/wait", forEvent: "databaseCon", value: true}));
    ws.send(JSON.stringify({route: "state/wait", forEvent: "serverCon", value: false}));

    // If this is the first player we're seeing, then setup the connection to the db
    if (con === null) {
      await timeout(500);
      con = await setupDB();
    }
    ws.send(JSON.stringify({route: "state/wait", forEvent: "databaseCon", value: false}));

    if (playerIDs.length < 2) {
      let connectionID = getUniqueID();
      debug("New connection with ID: " + connectionID);
      idToSocket[connectionID] = ws;
      playerIDs.push(connectionID);
      ws.on("close", () => playerClose(connectionID));

      if (playerIDs.length === 1) {
        ws.send(JSON.stringify({route: "state/wait", forEvent: "secondPlayer", value: true}));
      } else { // playerIDs.length === 2
        idToSocket[playerIDs[0]].send(JSON.stringify({route: "state/wait",
                                                      forEvent: "role", value: true}));
        idToSocket[playerIDs[1]].send(JSON.stringify({route: "state/wait",
                                                      forEvent: "role", value: true}));
        idToSocket[playerIDs[0]].send(JSON.stringify({route: "state/wait",
                                                      forEvent: "secondPlayer", value: false}));
        await timeout(250);
        assignPlayerRoles();
        idToSocket[playerIDs[0]].send(JSON.stringify({route: "state/wait",
                                                      forEvent: "role", value: false}));
        idToSocket[playerIDs[1]].send(JSON.stringify({route: "state/wait",
                                                      forEvent: "role", value: false}));
      }
    }
  } catch (err) {
    setServerErrCode(GEN_SERVER_ERR_CODE);
    throw "Error occurred while accepting new connection: " + err.toString();
  }
});


wss.on("error", (err) => {
  for (const socket of Object.values(idToSocket)) {
    socket.close(CUR_ERR_CODE, err.toString());
  }
  debug("Error occurred... " + err.toString());
  closeDB(con);
})


wss.on("close", () => {
  debug("Closing server...");
  closeDB(con);
})
