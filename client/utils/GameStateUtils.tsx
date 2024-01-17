
export function getPlayerTitles(role: "loading" | "guesser" | "p1" | "p2") {
  let p1Title = "p1";
  let p2Title = "p2";
  if (role === "p1") {
    p1Title = "you";
    p2Title = "GPT-3";
  } else if (role === "p2") {
    p1Title = "GPT-3";
    p2Title = "you";
  }
  return [p1Title, p2Title];
}

export function getTitleText(isGuessing: boolean,
                             guessOutcome: "undecided" | "correct" | "incorrect",
                             role: "loading" | "guesser" | "p1" | "p2") {
  let titleText = "";
  if (isGuessing && guessOutcome === "undecided") {
    titleText = "Who is the machine?";
  } else if (role === "guesser") {
    switch (guessOutcome) {
      case "correct":
        titleText = "Correct!";
        break
      case "incorrect":
        titleText = "Incorrect!";
        break
      default:
        titleText = "You are the guesser";
    }
  } else {
    switch (guessOutcome) {
      case "correct":
        titleText = "The guesser figured you out!";
        break
      case "incorrect":
        titleText = "You won! The guesser thought you were the machine";
        break
      default:
        titleText = "Try to trick the guesser";
    }
  }
  return titleText;
}
