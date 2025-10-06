import React, { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import Logger from '../../utils/logger'
import { IconAdd, IconUpload, IconInsert } from '../../assets/images/export';

const ImageModal = ({ isOpen, onClose, onInsert }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setSelectedImage(null);
            setUploadedUrl(null);
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const compressFile = async (file: File): Promise<File> => {
        const options = {
            maxSizeMB: 1,
            useWebWorker: true,
        };
        return await imageCompression(file, options);
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const rawFile = event.target.files?.[0];
        if (!rawFile) return;
	      Logger.print(rawFile);

        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(rawFile.type)) {
            alert('Only PNG, JPG, and JPEG files are allowed.');
            return;
        }

        setIsCompressing(true);
        try {
            const oneMB = 1024 * 1024;
            const file = (rawFile.size > oneMB) ? await compressFile(rawFile) : rawFile;

						Logger.print(file);
            setSelectedFile(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target.result as string);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            Logger.error('Image processing failed:', error);
            alert('An error occurred while processing the image.');
        } finally {
            setIsCompressing(false);
        }
    };

    const handlePlusButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleUpload = async () => {
        /*
        if (!selectedFile) {
            alert('Please select an image first.');
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            // '/upload/image'는 실제 서버의 엔드포인트로 수정해야 합니다.
            const response = await axiosInstance.post('/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const imageUrl = response.data.url;
            if (imageUrl) {
                setUploadedUrl(imageUrl);
                alert('Image uploaded successfully!');
            } else {
                alert('Failed to get image URL from response.');
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('Image upload failed.');
        }
        */

        setTimeout(() => {
            setUploadedUrl('https://ecimg.cafe24img.com/pg725b28316328009/rediettkr/web/product/extra/small/20241224/083a51d8f6124e463274b4bc0e14b012.jpg');
            alert('Image uploaded successfully!');
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1E1E1E] rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white text-lg">Insert Image</h2>
                    <button onClick={onClose} className="text-white">&times;</button>
                </div>
                <div className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-500 rounded-lg mb-4">
                    {selectedImage ? (
                        <img src={selectedImage} alt="Preview" className="w-full max-w-full max-h-96 object-contain" />
                    ) : isCompressing ? (
                        <div className="flex items-center justify-center h-24">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    ) : (
                        <button onClick={handlePlusButtonClick} className="flex items-center gap-2">
                            <img src={IconAdd} alt="Add image" className="w-6 h-6 invert" />
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
                        <button onClick={handleUpload} className="flex items-center justify-center gap-2 px-4 py-1 bg-gray-600 text-white rounded-md w-32">
                            <img src={IconUpload} alt="Upload image" className="w-6 h-6 invert" />
                            <span>Upload</span>
                        </button>
                    )}
                    {uploadedUrl && (
                        <button onClick={() => onInsert(uploadedUrl)} className="flex items-center justify-center gap-2 px-4 py-1 bg-[#CAFF33] text-black rounded-md w-32">
                            <img src={IconInsert} alt="Insert image" className="w-6 h-6" />
                            <span>Insert</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageModal;
