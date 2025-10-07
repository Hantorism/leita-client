const Logger = {
  print: (...args: any[]) => {
    if (process.env.REACT_APP_ENV === 'local') {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.REACT_APP_ENV === 'local') {
      console.error(...args);
    }
  }
};

export default Logger;