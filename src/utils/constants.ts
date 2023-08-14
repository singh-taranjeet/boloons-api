export const AppConstants = {
  response: {
    successResponse: (payload?: object) => {
      return {
        success: true,
        payload,
      };
    },
  },
};
