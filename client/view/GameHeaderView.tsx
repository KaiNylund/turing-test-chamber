import React from 'react';
import { PureComponent } from 'react';
import InfoIcon from "../imgs/info.png";

class GameHeaderViewComp extends PureComponent<{titleText: string,
                                        darkMode: boolean,
                                        toggleDarkMode: any,
                                        toggleGameInfo: any}, {}> {
  render() {
    return(
      <header>
        {/* Logo from: https://www.flaticon.com/free-icon/information_545674 */}
        <img src={InfoIcon} onMouseDown={this.props.toggleGameInfo} width={23}></img>
        <h1>{this.props.titleText}</h1>
        <div className={"battery " + ((this.props.darkMode) ? "dark" : "light")}
             onMouseDown={this.props.toggleDarkMode}></div>
      </header>
    );
  }
}

const GameHeaderView = React.memo(GameHeaderViewComp);
export default GameHeaderView;