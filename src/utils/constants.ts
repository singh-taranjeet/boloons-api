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

export const GameConstants = {
  gameKeys: {
    gameSession: 'game:session',
  },
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
