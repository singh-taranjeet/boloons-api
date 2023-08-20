export const AppConstants = {
  response: {
    successResponse: (data?: object | string) => {
      return {
        success: true,
        data,
      };
    },
  },
  cookies: {
    playerName: 'playerName',
    playerId: 'playerId',
  },
} as const;

export const RedisKeys = {
  usersOnline: 'users:online',
  gameSession: 'game:session',
  players: 'players',
  socket: 'socket',
  player: 'player',
} as const;

export const GameConstants = {
  step: {
    Waitingplayers: 'Waiting Players',
    Started: 'Started',
    Stopped: 'Stopped',
  },
  type: {
    MultiPlayer: 'MultiPlayer',
    SinglePlayer: 'SinglePlayer',
  },
  family: {
    SumAddict: 'SumAddict',
  },
} as const;
