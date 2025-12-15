import Profile from './Profile';

const Logger = {
	print: (...args: any[]) => {
		if (Profile.isLocal() || Profile.isDev()) {
			console.log(...args);
		}
	},
	error: (...args: any[]) => {
		if (Profile.isLocal() || Profile.isDev()) {
			console.error(...args);
		}
	},
};

export default Logger;
