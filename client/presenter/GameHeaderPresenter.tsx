import React, { useState } from "react";
import { getTitleText } from "../utils/GameStateUtils";
import GameHeaderView from "../view/GameHeaderView";
import GameInfoView from "../view/GameInfoView";

function GameHeaderPresenter(props: {roleType: "loading" | "p1" | "p2" | "guesser",
                                     isGuessing: boolean,
                                     guessOutcome: "undecided" | "correct" | "incorrect"}) {
  const [darkMode, setDarkMode] = useState(localStorage.getItem("isDarkmode") === "true");
  const [showInfo, setShowInfo] = useState(localStorage.getItem("returningUser") === "true");

  localStorage.setItem("returningUser", "true");

  function toggleDarkMode() {
    let toggleMode = !darkMode;
    setDarkMode(toggleMode)
    localStorage.setItem("isDarkmode", toggleMode.toString());
  }

  function toggleGameInfo() {
    setShowInfo(!showInfo);
  }

  const titleText = getTitleText(props.isGuessing,
                                 props.guessOutcome,
                                 props.roleType);

    if (darkMode) {
      document.getElementById("root")?.classList.add("dark");
    } else {
      document.getElementById("root")?.classList.remove("dark");
    }

  return (
    <div>
      <GameHeaderView titleText={titleText}
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                    toggleGameInfo={toggleGameInfo}/>
      <GameInfoView hidden={showInfo}
                    toggleInfo={toggleGameInfo}/>
    </div>
  );
}

export default GameHeaderPresenter;