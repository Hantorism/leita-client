import { Modal } from '@components';
import { useAlert } from '@contexts';
import { Icon } from '@iconify/react';
import { Logger, compressImage } from '@utils';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
}

const ImageModal = ({ isOpen, onClose, onInsert }: ImageModalProps) => {
  const { showAlert } = useAlert();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedImage(null);
      setUploadedUrl(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const rawFile = event.target.files?.[0];
    if (!rawFile) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(rawFile.type)) {
      showAlert('info', 'PNG, JPG, JPEG 파일만 업로드할 수 있습니다.');
      return;
    }

    setIsCompressing(true);
    try {
      const oneMB = 1024 * 1024;
      const file = rawFile.size > oneMB ? await compressImage(rawFile) : rawFile;

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage((e.target?.result as string) || null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      Logger.error('Image processing failed:', error);
      showAlert('error', '이미지 처리 중 오류가 발생했습니다.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handlePlusButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    setTimeout(() => {
      setUploadedUrl(
        'https://ecimg.cafe24img.com/pg725b28316328009/rediettkr/web/product/extra/small/20241224/083a51d8f6124e463274b4bc0e14b012.jpg',
      );
      showAlert('success', '이미지가 성공적으로 업로드되었습니다!');
    }, 1000);
  };

  return (
    <Modal
      title="Insert Image"
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-500 rounded-lg min-h-[100px] overflow-hidden">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full max-w-full max-h-96 object-contain"
            />
          ) : isCompressing ? (
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <button
              onClick={handlePlusButtonClick}
              className="flex items-center gap-2 p-8 text-gray-400 hover:text-white transition"
              type="button"
            >
              <Icon
                icon="material-symbols-light:add-circle-outline"
                className="w-6 h-6"
              />
              <span>Add</span>
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*"
          />
        </div>

        <div className="flex justify-end gap-2">
          {selectedImage && !uploadedUrl && (
            <button
              onClick={handleUpload}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md w-32 hover:bg-gray-500 transition"
              type="button"
            >
              <Icon
                icon="material-symbols-light:upload-rounded"
                className="w-6 h-6"
              />
              <span>Upload</span>
            </button>
          )}
          {uploadedUrl && (
            <button
              onClick={() => onInsert(uploadedUrl)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-brand)] text-black rounded-md w-32 hover:bg-[#d8ff5b] transition"
              type="button"
            >
              <Icon
                icon="material-symbols-light:upload-file-outline"
                className="w-6 h-6"
              />
              <span>Insert</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ImageModal;
