import React, {PureComponent} from 'react';
import { GuessButtonProp } from '../types';

class GuessButtonView extends PureComponent<GuessButtonProp, {}> {
  render(): React.ReactNode {
    return (
      <button className="guess-button"
              tabIndex={-1}
              onClick={this.props.startGuessing.bind(this)}
              disabled={this.props.disabled}>
        Guess!
      </button>
    );
  }
}

export default GuessButtonView;