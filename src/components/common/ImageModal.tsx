import React, { useState, useRef, useEffect } from 'react';

const ImageModal = ({ isOpen, onClose, onInsert }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadedUrl, setUploadedUrl] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setSelectedImage(null);
            setUploadedUrl(null);
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePlusButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleUpload = () => {
        // Simulate API call
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
                    ) : (
                        <button onClick={handlePlusButtonClick} className="flex items-center gap-2">
                            <img src="/image/icon-add.png" alt="Add image" className="w-6 h-6 invert" />
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
                            <img src="/image/icon-upload.png" alt="Upload image" className="w-6 h-6 invert" />
                            <span>Upload</span>
                        </button>
                    )}
                    {uploadedUrl && (
                        <button onClick={() => onInsert(uploadedUrl)} className="flex items-center justify-center gap-2 px-4 py-1 bg-[#CAFF33] text-black rounded-md w-32">
                            <img src="/image/icon-insert.png" alt="Insert image" className="w-6 h-6" />
                            <span>Insert</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageModal;
