const getEnvVar = (name: string): string => {
	const value = import.meta.env[name];
	if (!value) {
		throw new Error(`Environment variable ${name} is not set. Check .env file.`);
	}
	return value;
};

export const Environment = {
	GOOGLE_AUTH_CLIENT_ID: getEnvVar('VITE_GOOGLE_AUTH_CLIENT_ID'),
	API_URL: getEnvVar('VITE_API_URL'),
	PROFILE: getEnvVar('VITE_PROFILE'),
};
