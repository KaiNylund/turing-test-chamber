import React from 'react';
import { PureComponent } from 'react';

class PlayerTitleViewComp extends PureComponent<{title: string}, {}> {
  render() {
    return (
      <h2>{this.props.title}</h2>
    );
  }
}

const PlayerTitleView = React.memo(PlayerTitleViewComp);
export default PlayerTitleView;