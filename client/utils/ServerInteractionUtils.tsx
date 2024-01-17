import store from "../model/store";

import Debug from "debug";
const debug = Debug("server");

const URL = 'ws://127.0.0.1:2643';
let ws: WebSocket | undefined = undefined;

export function connectToServer(): void {
	ws = new WebSocket(URL);

	ws.addEventListener('open', (event) => {
		debug("Connected to server!");
	});

	ws.addEventListener('message', async (event) => {
		let resp = JSON.parse(event.data);
		routeServerMessages(resp);
	});

	ws.addEventListener("close", (event) => {
		debug("Connection to server closed with event: " + event);
		store.dispatch({type: "reset"});
	})
}


function routeServerMessages(resp: any) {
	switch (resp.route) {
		case "state/role":
			store.dispatch({type: "role/assign", player: resp.role});
			if (resp.role !== "guesser") {
				store.dispatch({type: "waiting", forEvent: "playerMessage", value: true});
			}
			break

		case "player/message":
			// If we received a message, add it to the list in the global state and enable our
			// text input so we can reply
			store.dispatch({type: "message/add", message: resp.message, player: resp.player});
			store.dispatch({type: "waiting", forEvent: "playerMessage", value: false});
			break

		case "state/guessOutcome":
			store.dispatch({type: "guess/outcome", guessOutcome: resp.guessOutcome});
			store.dispatch({type: "waiting", forEvent: "guessOutcome", value: false});
			break

		case "state/wait":
			store.dispatch({type: "waiting", forEvent: resp.forEvent, value: resp.value});
			break

		case "gameStats":
			store.dispatch({type: "gameStats/update", gameStats: resp.stats});
			store.dispatch({type: "waiting", forEvent: "gameStats", value: false});
			break

		case "otherPlayerDC":
			store.dispatch({type: "reset"});
			store.dispatch({type: "waiting", forEvent: "secondPlayer", value: true});
			store.dispatch({type: "waiting", forEvent: "serverCon", value: false});
			break
	}
}


export function sendToServer(json: {}) {
	if (ws !== undefined) {
		ws.send(JSON.stringify(json));
	}
}

export function sendGuessToServer(guess: "p1" | "p2") {
	sendToServer({route: "player/guess", guess: guess});
}

export function sendMessageToServer(message: string, player: string) {
	sendToServer({route: "player/message", message: message, player: player});
}