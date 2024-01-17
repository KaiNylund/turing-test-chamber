export type PlayerMessage = {
  player: string,
  text: string
}

export type StateType = {
  inputText: string,
  messages: PlayerMessage[]
}

export type GuessInputProp = {
  inputText: string,
  disabled: boolean,
  // TODO: Replace all anys
  onGuesserTextChange: (e: any) => any,
  onGuesserSubmit: (e: any) => any
}

export type GuessButtonProp = {
  disabled: boolean,
  startGuessing: (e: any) => any
}

export type ServerRoleMessage = {
  role: "p1" | "p2" | "guesser"
}

export type Action = {
  type: string
}

export type IsGuessingAction = Action & {
  isGuessing: boolean
}

export type GuessOutcomeAction = Action & {
  guessOutcome: "undecided" | "correct" | "false"
}

export type TextAction = Action & {
  message: string
}

export type PlayerAction = Action & {
  player: "p1" | "p2" | "guesser",
}

export type MessageAction = TextAction & {
  player: "p1" | "p2" | "guesser" | "loading",
}

export type RoleType = {
  type: "loading" | "p1" | "p2" | "guesser",
  assignedTime: string
}


export type DefaultStateType = {
  messages: {
    p1: string[],
    p2: string[],
    guesser: string[]
  },
  isGuessing: boolean,
  waitingFor: {
    serverCon: boolean,
    databaseCon: boolean,
    secondPlayer: boolean,
    role: boolean,
    playerMessage: boolean,
    gpt3Message: boolean,
    guessOutcome: boolean,
    gameStats: boolean
  },
  guessOutcome: "undecided" | "correct" | "incorrect",
  role: RoleType,
  inputText: string,
  gameStats: GameStats
}

export type GameStats = {
  messageStats: MessageStats,
  guessStats: GuessStats
}

export type MessageStat = {
  text: string,
  datetime: string,
  messageNum: number
}

export type MessageStats = {
  guesser: MessageStat[],
  tricker: MessageStat[],
  gpt3: MessageStat[]
}

export type GuessStats = {
  p1Guess: string,
  p2Guess: string,
  numCorrect: string,
  numIncorrect: string
}