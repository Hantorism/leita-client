const EncodeBase64 = (str: string): string => {
	const trimmed = str.trimEnd();
	const utf8Bytes = new TextEncoder().encode(trimmed);
	const binary = Array.from(utf8Bytes)
		.map(byte => String.fromCharCode(byte))
		.join('');
	return btoa(binary);
};

const DecodeBase64 = (str: string): string => {
	const binaryString = atob(str);
	const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
	return new TextDecoder().decode(bytes);
};

export { EncodeBase64, DecodeBase64 };
