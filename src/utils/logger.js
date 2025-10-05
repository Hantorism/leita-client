const Logger = {
    print: (...args) => {
        if (process.env.REACT_APP_ENV === 'local') {
            console.log(...args);
        }
    },
    error: (...args) => {
        if (process.env.REACT_APP_ENV === 'local') {
            console.error(...args);
        }
    },
};

export default Logger;
