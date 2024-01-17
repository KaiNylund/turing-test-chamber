import React from 'react';
import renderer from 'react-test-renderer';
import GameHeaderPresenter from '../presenter/GameHeaderPresenter';
import { JSDOM } from "jsdom";

const dom = new JSDOM()
global.document = dom.window.document

function storageMock() {
  let storage: any = {"returningUser": "false"};

  return {
    clear: () => {
      storage = {};
    },
    setItem: function(key: string | number, value: string) {
      storage[key] = value || '';
    },
    getItem: function(key: string) {
      return key in storage ? storage[key] : null;
    },
    removeItem: function(key: string | number) {
      delete storage[key];
    },
    get length() {
      return Object.keys(storage).length;
    },
    key: function(i: number) {
      const keys = Object.keys(storage);
      return keys[i] || null;
    }
  };
}

global.localStorage = storageMock();

const component = renderer.create(
  <GameHeaderPresenter
    roleType={'guesser'}
    isGuessing={false}
    guessOutcome={'undecided'}/>
);
let tree: any = component.toJSON();
let headerChildren = tree.children[0].children;
let gameInfoPage = tree.children[1].children

// Test game info toggle
it('gameInfo close works', async () => {
  let closeImgComp = gameInfoPage.find((e: { type: string; }) => e.type === "header").children[1];
  expect(tree).toMatchSnapshot();

  await renderer.act(async () => {
    closeImgComp.props.onMouseDown();
  });

  // re-rendering
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});


// Test dark mode toggle
it('dark mode toggle works', async () => {
  let darkModeComp = headerChildren.find((e: { type: string; }) => e.type === "div");
  expect(tree).toMatchSnapshot();

  await renderer.act(async () => {
    darkModeComp.props.onMouseDown();
  });

  // re-rendering
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

// Test game info toggle
it('dark mode toggle works', async () => {
  let imgToggleComp = headerChildren.find((e: { type: string; }) => e.type === "img");
  expect(tree).toMatchSnapshot();

  await renderer.act(async () => {
    imgToggleComp.props.onMouseDown();
  });

  // re-rendering
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});