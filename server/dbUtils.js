import mysql from 'mysql2';
import moment from 'moment';
import { setServerErrCode } from './server.js';

const DB_CONN_ERR_CODE = 503;
const DB_CONN_ERR_TEXT = "Cannot connect to database. Service may be unavailable.";
const DB_QRY_ERR_CODE = 500;
const DB_QRY_ERR_TEXT = "Bad database query";

const ADD_USER_QRY = "INSERT INTO users (id, player, connectionDatetime) VALUES (?, ?, ?)";
const ADD_MESSAGE_QRY = "INSERT INTO messages (id, player, text, messageNum, datetime) \
                         VALUES (?, ?, ?, ?, ?);";
const ADD_GUESS_QRY = "INSERT INTO guesses (id, guess, outcome, datetime) VALUES (?, ?, ?, ?)";
const GET_MESSAGES_QRY = "SELECT text FROM messages WHERE id = ? ORDER BY datetime DESC";

// Connect to our local MySQL server
export async function getDBConnection() {
  return new Promise(function(resolve, reject) {
    let connection = mysql.createConnection({
      host: "localhost",
      user: "ttcserver",
      password: "",
      database: "ttcdb"
    });
    connection.connect();
    resolve(connection);
  }).catch(() => {
    setServerErrCode(DB_CONN_ERR_CODE);
    throw DB_CONN_ERR_TEXT;
  });
}

export function closeDB(con) {
  con.end();
}

function resolveQry(resolve, error, results) {
  if (error) {
    setServerErrCode(DB_QRY_ERR_CODE);
    throw DB_QRY_ERR_TEXT;
  }
  resolve(results);
}

export function createTable(con, tableName, columns) {
  return new Promise(function(resolve, reject) {
    // don't really need to escape these since only the server uses this
    let qry = "CREATE TABLE IF NOT EXISTS " + tableName + " (" + columns + ")";
    con.query(qry, (error, results, fields) => resolveQry(resolve, error, results));
  });
}

export async function setupDB() {
  let con = await getDBConnection();
  await createTable(con, "users", "id VARCHAR(256), player VARCHAR(64), \
                                   connectionDatetime DATETIME");
  await createTable(con, "messages", "id VARCHAR(256), player VARCHAR(64), text VARCHAR(4096), \
                                      messageNum INT, datetime DATETIME");
  await createTable(con, "guesses", "id VARCHAR(256), guess VARCHAR(16), outcome VARCHAR(64), \
                                     datetime DATETIME");
  return con
}

export function storeMessage(con, id, player, text, messageNum) {
  return new Promise(function(resolve, reject) {
    let datetime = moment().utc().toDate();
    con.query(ADD_MESSAGE_QRY, [id, player, text, messageNum, datetime],
      (error, results, fields) => resolveQry(resolve, error, results));
  });
}

export function storeUser(con, id, player) {
  return new Promise(function(resolve, reject) {
    let datetime = moment().utc().toDate();
    con.query(ADD_USER_QRY, [id, player, datetime],
      (error, results, fields) => resolveQry(resolve, error, results));
  });
}

export function storeGuess(con, id, player, outcome) {
  return new Promise(function(resolve, reject) {
    let datetime = moment().utc().toDate();
    con.query(ADD_GUESS_QRY, [id, player, outcome, datetime],
      (error, results, fields) => resolveQry(resolve, error, results));
  });
}

export function getLatestMessages(con, id) {
  return new Promise(function(resolve, reject) {
    con.query(GET_MESSAGES_QRY, [id],
      (error, results, fields) => resolveQry(resolve, error, results));
  });
}

function getMessageStats(con, id) {
  return new Promise(function(resolve, reject) {
    con.query("SELECT text, datetime, messageNum FROM messages WHERE id = ? \
               ORDER BY messageNum ASC", [id],
      (error, results, fields) => resolveQry(resolve, error, results));
  });
}

function getGlobalGuessStats(con) {
  return new Promise(function(resolve, reject) {
    con.query("SELECT \
                SUM(guess = ?) AS p1Guess, \
                SUM(guess = ?) AS p2Guess, \
                SUM(outcome = ?) AS numCorrect, \
                SUM(outcome = ?) AS numIncorrect \
              FROM guesses",
      ["p1", "p2", "correct", "incorrect"],
      (error, results, fields) => resolveQry(resolve, error, results));
  });
}

export async function getGameStats(con, guesserID, trickerID, gpt3ID) {
  return Promise.all([getMessageStats(con, guesserID),
                      getMessageStats(con, trickerID),
                      getMessageStats(con, gpt3ID),
                      getGlobalGuessStats(con)])
    .then(([guesserStats, trickerStats, gpt3Stats, globalGuessStats]) => {
      return ({
        messageStats: {
          guesser: guesserStats,
          tricker: trickerStats,
          gpt3: gpt3Stats
        },
        guessStats: globalGuessStats[0]
      });
    })
    .catch(() => {
      setServerErrCode(DB_QRY_ERR_CODE);
      throw DB_QRY_ERR_TEXT;
    });
}