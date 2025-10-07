const EncodeBase64 = (str: string): string => {
	const trimmed = str.trimEnd();
	const utf8Bytes = new TextEncoder().encode(trimmed);
	const binary = Array.from(utf8Bytes)
		.map(byte => String.fromCharCode(byte))
		.join('');
	return btoa(binary);
};

export default EncodeBase64;
