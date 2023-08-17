export const AppConstants = {
  response: {
    successResponse: (data?: object) => {
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
};
