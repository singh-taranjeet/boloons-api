export function appConfig() {
  if (process.env.NODE_ENV === 'development') {
    return {
      url: 'http://localhost:3000',
    };
  } else {
    return {
      url: 'https://boloons-ui.vercel.app/',
    };
  }
}
