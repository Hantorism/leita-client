const DecodeBase64 = (str: string): string => {
	const binaryString = atob(str);
	const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
	return new TextDecoder().decode(bytes);
};

export default DecodeBase64;
