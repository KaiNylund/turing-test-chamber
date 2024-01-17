import { DefaultStateType, GameStats } from '../types';
import { connect } from 'react-redux';
import "../styles/icons.css";
import { formatMessageStats, groupedBarChart, twoCirclesChart } from "../utils/VisualizationUtils";

const mapStateToProps = (state: DefaultStateType) => {
  return {
    gameStats: state.gameStats
  }
}

let colorScheme = ["#a6cee3", "#1f78b4", "#b2df8a"];

function GameStatsPresenter(props: {gameStats: GameStats}) {
  if (props.gameStats !== null) {
    let formattedStats = formatMessageStats(props.gameStats.messageStats);
		// If there are no messages from the tricker, then update our colorscheme
		if (formattedStats.find((x) => (x.player === "tricker")) === undefined) {
			colorScheme = [colorScheme[0], colorScheme[2]];
		}
		// x is group -- messageNum
		// y is height -- time message took
		// z is color -- player
		groupedBarChart(formattedStats, {
			x: d => d.messageNum + 1,
			y: d => d.timeDiff,
			z: d => d.player,
			chartTitle: "",
			yLabel: "Seconds",
			xLabel: "Message #",
			colors: colorScheme,
			width: 600,
			height: 300
		});

		let guessStats = props.gameStats.guessStats;
		twoCirclesChart("#guess-bubbles", 300, 150, parseInt(guessStats.p1Guess),
										parseInt(guessStats.p2Guess), "p1 guessed", "p2 guessed",
										"rgba(207, 144, 238, 0.866)", "rgba(216, 201, 101, 0.877)");
		twoCirclesChart("#guess-outcome-bubbles", 300, 150, parseInt(guessStats.numCorrect),
										parseInt(guessStats.numIncorrect), "Correct", "Incorrect",
										"rgba(144, 238, 144, 0.866)", "rgba(216, 101, 101, 0.877)");
  }
  return null;
}

export default connect(mapStateToProps)(GameStatsPresenter);