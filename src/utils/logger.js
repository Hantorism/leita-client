const Logger = {
    print: (...args) => {
        if (process.env.REACT_APP_ENV === 'local') {
            console.log(...args);
        }
    },
};

export default Logger;
