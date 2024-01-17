import React from 'react';
import renderer from 'react-test-renderer';
import UserInputPresenter from '../presenter/UserInputPresenter';
import { Provider } from 'react-redux';
import store from '../model/store';

// NOTE: need to recreate component in each call becasue we're updating the store each time
// (e.g. disabling after a submit should not affect the next time we test submitting)

// Test input
it('input text updates', async () => {
  const component = renderer.create(
    <Provider store={store}>
      <UserInputPresenter/>
    </Provider>
  );
  let tree: any = component.toJSON();
  let formComponent = tree.children[0];
  let inputComponent = formComponent.children.find((e: { type: string; }) => e.type === "input");
  expect(tree).toMatchSnapshot();

  // NOTE: There's a bug in Formik that throws a warning saying we aren't using .act() unless
  // we wrap our expect calls in waitFor.
  await renderer.act(async () => {
    inputComponent.props.onChange({target: { value: "testing again..."}});
  });

  // re-rendering
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});


// Test submit updates
it('input and button disabled on submit', async () => {
  const component = renderer.create(
    <Provider store={store}>
      <UserInputPresenter/>
    </Provider>
  );

  let tree: any = component.toJSON();
  let formComponent = tree.children[0];
  let inputComponent = formComponent.children.find((e: { type: string; }) => e.type === "input");
  expect(tree).toMatchSnapshot();

  // NOTE: There's a bug in Formik that throws a warning saying we aren't using .act() unless
  // we wrap our expect calls in waitFor.
  await renderer.act(async () => {
    inputComponent.props.onChange({target: { value: "testing..."}});
  });

  // General submit
  await renderer.act(async () => {
    formComponent.props.onSubmit();
  });

  // re-rendering
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});


// Test submit button
it('submit button works', async () => {
  const component = renderer.create(
    <Provider store={store}>
      <UserInputPresenter/>
    </Provider>
  );

  let tree: any = component.toJSON();
  let formComponent = tree.children[0];
  let inputComponent = formComponent.children.find((e: { type: string; }) => e.type === "input");
  let submitButton = formComponent.children.find((e: { type: string; }) => e.type === "button");
  expect(tree).toMatchSnapshot();

  await renderer.act(async () => {
    inputComponent.props.onChange({target: { value: "testing..."}});
  });

  // Submit by clicking on the "submit button"
  await renderer.act(async () => {
    submitButton.props.onClick();
  });

  // re-rendering
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});