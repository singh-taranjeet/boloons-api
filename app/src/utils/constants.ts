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
