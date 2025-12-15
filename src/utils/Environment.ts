const getEnvVar = (name: string): string => {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Environment variable ${name} is not set. Check .env file.`);
	}
	return value;
};

const Environment = {
	GOOGLE_AUTH_CLIENT_ID: getEnvVar('REACT_APP_GOOGLE_AUTH_CLIENT_ID'),
	API_BASE_URL:          getEnvVar('REACT_APP_API_BASE_URL'),
	PROFILE:               getEnvVar('REACT_APP_PROFILE'),
};

export default Environment;
