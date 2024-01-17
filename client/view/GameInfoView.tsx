import React from "react";
import CloseIcon from "../imgs/close.png";

function GameInfoView(props: {hidden: boolean, toggleInfo: any}) {
  if (props.hidden) {
    return null;
  } else {
    return (
      <div id="game-info">
        <header>
          <h1>How to play</h1>
          {/* Icon from: https://www.flaticon.com/free-icon/close_1828778 */}
          <img src={CloseIcon} onMouseDown={props.toggleInfo} width={20}/>
        </header>
        <p>
          This game is based on the Turing test, where a player (our "guesser") has to figure out
          which of two other players (our "tricker" and GPT-3 model) is a computer using only
          their responses to written questions.
        </p>
        <section>
          <h2>Guesser</h2>
          <p>
            If you are the guesser, then it's your job to figure out whether p1 or p2
            is the computer. Start by sending a text to both players using the input bar and see if
            you can tell from their responses. After you've exchanged a few texts and you're
            ready to make your guess, click the "Guess!" button and select the player you
            think is the computer.
          </p>
        </section>
        <section>
          <h2>Tricker</h2>
          <p>
            If you are trying to trick the guesser, then it's your job to make them think
            you are the computer. GPT-3 isn't great for these kinds
            of tasks, so we've given you the advantage of seeing the first part of its response.
            It's up to you if you want to imitate what GPT-3 is saying, or come up with your own
            answers.
          </p>
        </section>
        <p>
          Once the guesser has made their guess, both players will be able to see the results
          and statistics about their game. Good luck!
        </p>
      </div>
    );
  }
}

export default GameInfoView