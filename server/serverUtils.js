import { getLatestMessages } from "./dbUtils.js";
import { setServerErrCode } from "./server.js";


const GPT3_PROMPT_ERR_CODE = 500;
const GPT3_PROMPT_ERR_TEXT = "Failed while generating prompt to GPT-3";

// Given array of json objects
function extractValList(jsonArray, key) {
  let vals = [];
  for (let json of jsonArray) {
    vals.push(json[key]);
  }
  return vals;
}

function interleave(a1, a2) {
  let result = [];
  let a1copy = a1.slice();
  let a2copy = a2.slice();
  while (a1copy.length > 0 && a2copy.length > 0) {
    result.push(a1copy.shift());
    result.push(a2copy.shift());
  }
  while(a1copy.length > 0) {
    result.push(a1copy.shift());
  }
  while(a2copy.length > 0) {
    result.push(a2copy.shift());
  }
  return result;
}


export function getUniqueID() {
  function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4();
};


export function truncateGPT3Text(gpt3Text, maxLength=12, maxTokens=3) {
  let tokens = gpt3Text.split("\s");
  let joinedTokens = tokens.slice(0, maxTokens).join(" ");
  if (joinedTokens.length > maxLength) {
    return gpt3Text.substring(0, maxLength) + "...";
  }
  return joinedTokens + "...";
}

// Use the last 4 messages in the chat with gpt-3 as its next input
// Concat the current message with the last from the db since it isn't guarenteed
// to update in time if we call storeMessage first.
export async function createNewGPT3Prompt(con, curGuesserMessage, guesserID, gpt3ID) {
  return Promise.all([getLatestMessages(con, guesserID),
                      getLatestMessages(con, gpt3ID)])
    .then((latestRespMessages) => {
      let lastGuesserMessages = latestRespMessages[0];
      let lastGPT3Messages = latestRespMessages[1];
      lastGuesserMessages = extractValList(lastGuesserMessages.slice(0, 2), "text").reverse();
      lastGPT3Messages = extractValList(lastGPT3Messages.slice(0, 2), "text").reverse();
      return interleave(lastGuesserMessages, lastGPT3Messages).join("\n");
    })
    .catch((err) => {
      setServerErrCode(GPT3_PROMPT_ERR_CODE);
      throw GPT3_PROMPT_ERR_TEXT + ": " + err.toString();
    });
}