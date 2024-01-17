import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import store from '../model/store';
import PlayerChatPresenter from '../presenter/PlayerChatPresenter';
import { startGuessing } from '../model/actions';

const component = renderer.create(
  <Provider store={store}>
    <PlayerChatPresenter title={'p1'} player={'p1'}/>
  </Provider>
);

// Set the isGuessing flag to true so the playerChat's mouseOver and onClick functions will
// do something
store.dispatch({type: "guess/isGuessing", isGuessing: true});
let tree: any = component.toJSON();
let playerChatComp = tree.children.find((e: { type: string; }) => e.type === "ul");

// Test interactions with player chat when guessing
it('player chat hover and click effects work', async () => {
  expect(tree).toMatchSnapshot();

  // mouse over
  renderer.act(() => {
    playerChatComp.props.onMouseOver();
  });
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  // mouse leave
  renderer.act(() => {
    playerChatComp.props.onMouseLeave();
  });
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  // click
  renderer.act(() => {
    playerChatComp.props.onClick();
  });
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});