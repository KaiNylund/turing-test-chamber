import { Component } from 'react';
import { DefaultStateType } from '../types';
import { connect } from 'react-redux';
import React from 'react';
import "../styles/icons.css";
import LoadingBarView from '../view/LoadingBarView';

const mapStateToProps = (state: DefaultStateType) => {
  return {
    waitingFor: state.waitingFor
  }
}

class LoadingPresenter extends Component<{waitingFor: {
                                            serverCon: boolean,
                                            databaseCon: boolean,
                                            secondPlayer: boolean,
                                            role: boolean,
                                            playerMessage: boolean,
                                            gpt3Message: boolean,
                                            guessOutcome: boolean,
                                            gameStats: boolean
                                          }}, {}> {
  render() {
    let loadingPercent = 0;
    let loadingText = "";
    if (this.props.waitingFor.serverCon) {
      loadingText = "Connecting to server...";
    } else if (this.props.waitingFor.databaseCon) {
      loadingPercent = 25;
      loadingText = "Connecting to database...";
    } else if (this.props.waitingFor.secondPlayer) {
      loadingPercent = 50;
      loadingText = "Searching for players...";
    } else if (this.props.waitingFor.role) {
      loadingPercent = 75;
      loadingText = "Waiting for role...";
    } else {
      loadingText = "Done!";
      loadingPercent = 100;
    }

    return <LoadingBarView loadingPercent={loadingPercent}
                           loadingText={loadingText}/>;
  }
}

export default connect(mapStateToProps)(LoadingPresenter);