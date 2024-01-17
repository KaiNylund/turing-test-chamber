import { Component, useState } from 'react';
import store from '../model/store';
import PlayerChatView from '../view/PlayerChatView';
import PlayerTitleView from '../view/PlayerTitleView';
import { DefaultStateType } from '../types';
import { connect } from 'react-redux';
import React from 'react';
import { guessPlayer } from '../model/actions';
import { animated, useSpring } from 'react-spring';

import Debug from "debug";
const debug = Debug("playerChatPresenter");

const mapStateToProps = (state: DefaultStateType) => {
  return {
    messages: state.messages,
    waitingForPlayerMessage: state.waitingFor.playerMessage,
    waitingForGpt3Message: state.waitingFor.gpt3Message
  }
}

const mapDispatchToProps = {
  guessPlayer
}

function PlayerChatPresenter(props: {player: "p1" | "p2",
                                     title: string,
                                     waitingForPlayerMessage: boolean,
                                     waitingForGpt3Message: boolean,
                                     messages: {p1: string[],
                                                p2: string[],
                                                guesser: string[]},
                                     guessPlayer: (player: "p1" | "p2") => void}) {
  const [title, setTitle] = useState(props.title);

  function onMouseOver() {
    if (store.getState().isGuessing) {
      setTitle(props.title + " is the machine");
    }
  }

  function onMouseLeave() {
    if (store.getState().isGuessing) {
      setTitle(props.title);
    }
  }

  function onClick() {
    let curState = store.getState();
    if (curState.isGuessing && curState.guessOutcome === "undecided") {
      debug("sending guess to server: " + props.player);
      props.guessPlayer(props.player);
      setTitle(props.title);
    }
  }

  let waitingForMessage: "none" | "message" | "reply" = "none";
  let role = store.getState().role.type;
  if (props.waitingForPlayerMessage && role === "guesser") {
    waitingForMessage = "reply";
  } else if (props.waitingForPlayerMessage && role !== "guesser") {
    waitingForMessage = "message";
  // If we're waiting for the gpt3 reply, and we're the tricker, and this is the gpt3 window
  // then add a waiting bubble on the reply side
  } else if (props.waitingForGpt3Message &&
             (role === "p1" || role === "p1") &&
             (role !== props.player)) {
    waitingForMessage = "reply";
  }

  const styleProps = useSpring({
    opacity: 1,
    transform: "translateY(0px)",
    from: { opacity: 0, transform: "translateY(-20px)" }
  });

  return (
    <animated.div className={"chat-window"} style={styleProps}>
      <PlayerTitleView title={title}/>
      <PlayerChatView messages={props.messages.guesser}
                      replies={props.messages[props.player]}
                      player={props.player}
                      waitingFor={waitingForMessage}
                      onMouseOver={onMouseOver}
                      onMouseLeave={onMouseLeave}
                      onClick={onClick}/>
    </animated.div>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayerChatPresenter);