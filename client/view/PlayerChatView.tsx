import React from 'react';
import { PureComponent } from 'react';

class PlayerChatView extends PureComponent<{messages: string[], replies: string[], player: string,
                                            waitingFor: "none" | "message" | "reply",
                                            onMouseOver:  (e: any) => any,
                                            onMouseLeave: (e: any) => any,
                                            onClick:      (e: any) => any}, {}> {
  render() {
    let lis = [];
    for (let i = 0; i < this.props.messages.length; i++) {
      let curMessage = this.props.messages[i];
      lis.push(<li className={"guesser-text"} key={"message-" + i}>{curMessage}</li>)

      if (i < this.props.replies.length) {
        let curReply = this.props.replies[i];
        lis.push(<li className={this.props.player + "-text"} key={"reply-" + i}>{curReply}</li>)
      }
    }

    let threeDots = (
      <div className="three-dots">
        <div className="bounce1"></div>
        <div className="bounce2"></div>
        <div className="bounce3"></div>
      </div>);

    if (this.props.waitingFor === "message") {
      lis.push(<li className={"guesser-text"} key={"waiting-message"}>{threeDots}</li>);
    } else if (this.props.waitingFor === "reply") {
      lis.push(<li className={this.props.player + "-text"} key={"waiting-message"}>{threeDots}</li>);
    }

    return (
      <ul onMouseOver={this.props.onMouseOver.bind(this)}
          onMouseLeave={this.props.onMouseLeave.bind(this)}
          onClick={this.props.onClick.bind(this)}>
        {lis}
      </ul>
    );
  }
}

export default PlayerChatView;