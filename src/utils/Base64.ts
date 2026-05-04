export const EncodeBase64 = (str: string): string => {
  const utf8Bytes = new TextEncoder().encode(str);
  const binary = Array.from(utf8Bytes)
    .map((byte) => String.fromCharCode(byte))
    .join('');
  return btoa(binary);
};

export const DecodeBase64 = (str: string): string => {
  const binaryString = atob(str);
  const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};
