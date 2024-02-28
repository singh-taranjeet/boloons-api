export const RedisKeys = {
  usersOnline: 'users:online',
  gameSession: 'game:session',
  players: 'players',
  socket: 'socket',
  player: 'player',
} as const;

export const GameConstants = {
  step: {
    Waitingplayers: 'Waitingplayers',
    Started: 'Started',
    Stopped: 'Stopped',
  },
  type: {
    MultiPlayer: 'MultiPlayer',
    SinglePlayer: 'SinglePlayer',
  },
  family: {
    SumAddict: 'SumAddict',
    Sharp: 'Sharp',
  },
} as const;

export const Events = {
  connect: {
    login: 'login',
    disconnect: 'disconnect',
    connection: 'connection',
  },
  game: {
    events: {
      // createSession: 'createSession',
      // playerJoined: 'playerJoined',
      gameStarted: 'gameStarted',
      gameScored: 'gameScored',
    },
    eventMessageType: {
      gameStartedMsg: 'gameStartedMsg',
      playerJoinedMsg: 'playerJoinedMsg',
      gameScoredMsg: 'gameScoredMsg',
    },
  },
} as const;

export const GameMessages = {
  playerJoined: {
    playerAlreadyJoined: 'Player has already joined',
    gameNotWaiting: 'Cannot join now',
  },
} as const;
