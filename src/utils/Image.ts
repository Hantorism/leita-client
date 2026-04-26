import imageCompression from 'browser-image-compression';

/**
 * 이미지 파일을 압축합니다.
 * @param file 압축할 이미지 파일
 * @param maxSizeMB 최대 용량 (MB, 기본값 1MB)
 * @returns 압축된 이미지 파일
 */
export const compressImage = async (file: File, maxSizeMB = 1): Promise<File> => {
  const options = {
    maxSizeMB,
    useWebWorker: true,
  };
  
  try {
    return await imageCompression(file, options);
  } catch (error) {
    throw error;
  }
};
