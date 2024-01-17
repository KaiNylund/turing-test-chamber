import React from 'react';
import { PureComponent } from 'react';
import loadingSpinner from "../imgs/loading-spinner.gif";
import "../styles/icons.css";

class LoadingBarViewComp extends PureComponent<{loadingText: string, loadingPercent: number}, {}> {
  render() {
    return(
      <div className="finding-players">
        <img src={loadingSpinner} width={100}/>
        <div className="loading-bar-container">
          <div className={"loading-bar-value " + "w-" + this.props.loadingPercent.toString() + "p"}></div>
        </div>
        <p>{this.props.loadingText}</p>
      </div>
    );
  }
}

const LoadingBarView = React.memo(LoadingBarViewComp);
export default LoadingBarView;