import Environment from './Environment';

const RUNTIME = Environment.RUNTIME;

const Logger = {
	print: (...args: any[]) => {
		if (RUNTIME === 'local') {
			console.log(...args);
		}
	},
	error: (...args: any[]) => {
		if (RUNTIME === 'local') {
			console.error(...args);
		}
	},
};

export default Logger;
