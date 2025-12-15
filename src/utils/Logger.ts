import Profile from './Profile';

const Logger = {
	print: (...args: any[]) => {
		if (Profile.isNotProd()) {
			console.log(...args);
		}
	},
	error: (...args: any[]) => {
		if (Profile.isNotProd()) {
			console.error(...args);
		}
	},
};

export default Logger;
