import { Profile } from '@utils/Profile';
export const Logger = {
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
