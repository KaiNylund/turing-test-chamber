import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RoleType } from "../types";
import { sendGuessToServer, sendMessageToServer } from "../utils/ServerInteractionUtils";

export function guessPlayer(player: "p1" | "p2") {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    dispatch({type: "guess/isGuessing", isGuessing: false});
    dispatch({type: "waiting", forEvent: "guessOutcome", value: true});
    dispatch({type: "waiting", forEvent: "gameStats", value: true});
    sendGuessToServer(player);
  }
}

export function inputTextChange(e: { target: { value: string; }; }) {
  let text = e.target.value;
  return (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    dispatch({type: "input/textUpdate", message: text});
  }
}

export function submitMessage() {
  return async (dispatch: ThunkDispatch<{role: RoleType, inputText: string}, {}, AnyAction>,
                getState: () => {role: RoleType, inputText: string}) => {
    let curState = getState();
    let roleType = curState.role.type;
    let messageText = curState.inputText;
    // When we submit a new message, add it to the global state, and clear + disable the input
    // until we get a reply back.
    dispatch({type: "message/add", message: messageText, player: roleType});
    dispatch({type: "input/textUpdate", message: ""});
    dispatch({type: "waiting", forEvent: "playerMessage", value: true});
    sendMessageToServer(messageText, roleType);
  }
}

export function startGuessing() {
  return (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    dispatch({type: "guess/isGuessing", isGuessing: true});
  }
}