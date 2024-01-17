import moment from 'moment';
import { combineReducers } from '@reduxjs/toolkit'
import { TextAction, PlayerAction, MessageAction, IsGuessingAction,
         GuessOutcomeAction } from "../types";

// safe version of structuredClone for node versions < 17
const structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj))

export const defaultState = {
  messages: {
    p1: [],
    p2: [],
    guesser: []
  },
  // can be waiting for multiple things at once, so can't store waiting state as just a string
  // This way we can also subscribe to specific waiting conditions instead of checking whenever
  // a single waiting state changes.
  waitingFor: {
    serverCon: true,
    databaseCon: false,
    secondPlayer: false,
    role: false,
    playerMessage: false,
    gpt3Message: false,
    guessOutcome: false,
    gameStats: false
  },
  role: {
    type: "loading",
    assignedTime: ""
  },
  isGuessing: false,
  guessOutcome: "undecided",
  inputText: "",
  gameStats: null
};

function waitingReducer(state = defaultState.waitingFor,
                        action: {type: string, forEvent: "serverCon" | "databaseCon" | "role" |
                                                         "playerMessage" | "guessOutcome" |
                                                         "gameStats" | "gpt3Message",
                                 value: boolean}) {
  switch (action.type) {
    case "waiting":
      if (action.forEvent in state) {
        let stateCopy = structuredClone(state);
        stateCopy[action.forEvent] = action.value;
        return stateCopy;
      } else {
        return state;
      }
    case "waiting/clear":
      return {
        serverCon: false,
        databaseCon: false,
        secondPlayer: false,
        role: false,
        playerMessage: false,
        gpt3Message: false,
        guessOutcome: false,
        gameStats: false
      }
    default:
      return state;
  }
}

function guessOutcomeReducer(state = defaultState.guessOutcome, action: GuessOutcomeAction) {
  switch (action.type) {
    case "guess/outcome":
      return action.guessOutcome;
    default:
      return state
  }
}

function isGuessingReducer(state = defaultState.isGuessing, action: IsGuessingAction) {
  switch (action.type) {
    case "guess/isGuessing":
      return action.isGuessing;
    default:
      return state
  }
}

function inputTextReducer(state = defaultState.inputText, action: TextAction) {
  switch (action.type) {
    case "input/textUpdate":
      return action.message;
    default:
      return state
  }
}

function roleReducer(state = defaultState.role, action: PlayerAction) {
  switch (action.type) {
    case "role/assign":
      return {type: action.player, assignedTime: moment().utc().format()};
    default:
      return state;
  }
}

function messageReducer(state = defaultState.messages, action: MessageAction) {
  switch (action.type) {
    case "message/add":
      let stateCopy = structuredClone(state);
      if (action.player !== "loading") {
        let playerMessages: string[] = stateCopy[action.player];
        playerMessages.push(action.message);
      }
      return stateCopy;
    default:
      return state
  }
}

function gameStatsReducer(state = defaultState.gameStats, action: {type: string, gameStats: object}) {
  switch (action.type) {
    case "gameStats/update":
      return action.gameStats;
    default:
      return state;
  }
}

const appReducer = combineReducers({
  messages: messageReducer,
  role: roleReducer,
  inputText: inputTextReducer,
  waitingFor: waitingReducer,
  isGuessing: isGuessingReducer,
  guessOutcome: guessOutcomeReducer,
  gameStats: gameStatsReducer
});

export function rootReducer(state: any, action: any) {
  if (action.type === "reset") {
    return defaultState;
  }
  return appReducer(state, action);
}