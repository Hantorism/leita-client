import React, {useEffect, useState} from 'react';

type EditStudyModalProps = {
    isOpen: boolean;
    onClose: () => void;
    study: {
        id: string;
        title: string;
        description: string;
        requirement: string;
    };
    onUpdate: (updatedStudy: { title: string; description: string; requirement: string }) => void;
    onDelete: () => void;
};

const EditStudyModal = ({ isOpen, onClose, study, onUpdate, onDelete }: EditStudyModalProps) => {
    const [title, setTitle] = useState(study.title);
    const [description, setDescription] = useState(study.description);
    const [requirement, setRequirement] = useState(study.requirement);

    const handleSubmit = () => {
        onUpdate({ title, description, requirement });
    };

    // const handleDelete = () => {
    //     onDelete();
    // };

    useEffect(() => {
        if (study) {
            setTitle(study.title);
            setDescription(study.description);
            setRequirement(study.requirement);
        }
    }, [study]);

    const handleUpdate = () => {
        const updatedStudy = {
            title,
            description,
            requirement,
        };
        onUpdate(updatedStudy);  // 이걸 부모 컴포넌트에서 받아서 fetch 요청
        onClose(); // 모달 닫기
    };

    return isOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-gray-100 p-6 rounded-lg w-1/3 text-gray-800 font-Pretend">
                <h3 className="text-xl font-semibold mb-4">스터디 수정</h3>
                <div>
                    <label className="block text-sm mb-2">제목</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mb-4"
                    />
                    <label className="block text-sm mb-2">설명</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mb-4"
                    />
                    <label className="block text-sm mb-2">모집 조건</label>
                    <input
                        type="text"
                        value={requirement}
                        onChange={(e) => setRequirement(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mb-4"
                    />
                </div>
                <div className="flex justify-end gap-2 mt-4 font-lexend">
                    <button onClick={handleSubmit} className="px-4 py-2 bg-gray-500 text-white rounded-full">저장</button>
                    <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded-full">취소</button>

                </div>
            </div>
        </div>
    ) : null;
};

export default EditStudyModal;
