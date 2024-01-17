import { Component, useMemo, useState } from 'react';
import { DefaultStateType } from '../types';
import { connect } from 'react-redux';
import { getPlayerTitles, getTitleText } from '../utils/GameStateUtils';
import PlayerChatPresenter from './PlayerChatPresenter';
import UserInputPresenter from './UserInputPresenter';
import loadingSpinner from "../imgs/loading-spinner.gif";
import React from 'react';
import "../styles/icons.css";
import LoadingPresenter from './LoadingPresenter';
import GameStatsView from '../view/GameStatsView';
import GameHeaderPresenter from './GameHeaderPresenter';

const mapStateToProps = (state: DefaultStateType) => {
  return {
    roleType: state.role.type,
    isGuessing: state.isGuessing,
    guessOutcome: state.guessOutcome,
    waitingForGuessOutcome: state.waitingFor.guessOutcome,
    waitingForGameStats: state.waitingFor.gameStats
  }
}

function TestChamberPresenterComp(props: {roleType: "loading" | "p1" | "p2" | "guesser",
                                          isGuessing: boolean,
                                          guessOutcome: "undecided" | "correct" | "incorrect",
                                          waitingForGuessOutcome: boolean,
                                          waitingForGameStats: boolean}) {

  if (props.roleType === "loading") {
    return <LoadingPresenter/>;

  } else {
    const playerTitles = getPlayerTitles(props.roleType);
    const p1Title = playerTitles[0];
    const p2Title = playerTitles[1];

    return (
      <div className={"game-container"}>
        <GameHeaderPresenter roleType={props.roleType}
                             isGuessing={props.isGuessing}
                             guessOutcome={props.guessOutcome}/>
        <div className={"chat" + ((props.isGuessing) ? " is-guessing" : "")}>
          <PlayerChatPresenter player={"p1"} title={p1Title}/>
          <PlayerChatPresenter player={"p2"} title={p2Title}/>
        </div>
        <UserInputPresenter/>
        {/* display loading spinner if we're waiting for stats or the outcome */}
        {props.waitingForGameStats || props.waitingForGuessOutcome &&
        <img src={loadingSpinner} width={100}/>}
        {props.guessOutcome !== "undecided" &&
        <GameStatsView/>}
      </div>
    );
  }
}

const TestChamberPresenter = React.memo(TestChamberPresenterComp);
export default connect(mapStateToProps)(TestChamberPresenter);