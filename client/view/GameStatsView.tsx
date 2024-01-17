import React from 'react';
import { useSpring, animated } from 'react-spring';
import GameStatsPresenter from '../presenter/GameStatsPresenter';

function GameStatsView() {

  const styleProps = useSpring({
    opacity: 1,
    transform: "translateY(0px)",
    from: { opacity: 0, transform: "translateY(-20px)" }
  });

  return(
      <animated.div id="game-charts-container" style={styleProps}>
        <div>
          <div id="grouped-bar-chart">
            <div>
              <h2>Time per text</h2>
              <div id="bar-chart-legend">
                <div>
                  <span>Guesser</span>
                  <div></div>
                </div>
                <div>
                  <span>Tricker</span>
                  <div></div>
                </div>
                <div>
                  <span>GPT-3</span>
                  <div></div>
                </div>
              </div>
            </div>
            <svg></svg>
          </div>
          <div id="bubble-charts">
            <h2>Global guessing statistics</h2>
            <svg id="guess-bubbles"></svg>
            <svg id="guess-outcome-bubbles"></svg>
          </div>
          {/* Need to have the presenter inside the view because the svgs placeholders must be
              rendered before the graphs can be created */}
          <GameStatsPresenter/>
        </div>
      </animated.div>
    );
}

export default GameStatsView;