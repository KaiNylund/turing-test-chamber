import { Component } from "react";
import GuessButtonView from "../view/GuessButtonView";
import GuesserInputBarView from "../view/GuesserInputBarView";
import { DefaultStateType } from "../types";
import { connect } from "react-redux";
import store from "../model/store";
import React from "react";
import { inputTextChange, submitMessage, startGuessing } from "../model/actions";

const mapStateToProps = (state: DefaultStateType) => {
  return {
    inputText: state.inputText,
    isGuessing: state.isGuessing,
    waitingForPlayerMessage: state.waitingFor.playerMessage,
    waitingForGuessOutcome: state.waitingFor.guessOutcome,
    guessOutcome: state.guessOutcome
  }
}

const mapDispatchToProps = {
  submitMessage,
  inputTextChange,
  startGuessing
}

class UserInputPresenter extends Component<{inputText: string,
                                            isGuessing: boolean,
                                            waitingForPlayerMessage: boolean,
                                            waitingForGuessOutcome: boolean,
                                            guessOutcome: "undecided" | "correct" | "incorrect",
                                            submitMessage: (e: any) => any,
                                            inputTextChange: (e: any) => any,
                                            startGuessing: (e: any) => any}, {}> {
  render() {
    return (
      <div className={"guessing-inputs" + ((this.props.isGuessing) ? " is-guessing" : "")}>
        <GuesserInputBarView onGuesserTextChange={this.props.inputTextChange}
                             onGuesserSubmit={this.props.submitMessage}
                             inputText={this.props.inputText}
                             disabled={this.props.isGuessing ||
                                       this.props.waitingForPlayerMessage ||
                                       this.props.waitingForGuessOutcome ||
                                       this.props.guessOutcome !== "undecided"}/>
        {store.getState().role.type === "guesser" &&
        <GuessButtonView startGuessing={this.props.startGuessing}
                         disabled={this.props.isGuessing ||
                                   this.props.guessOutcome !== "undecided"}/>}
      </div>
    )
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(UserInputPresenter);