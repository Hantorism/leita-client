import React, { useState } from "react";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const CreateStudyModal = ({ onClose, onCreated }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [requirement, setRequirement] = useState("");
    const token = localStorage.getItem("token");

    const handleSubmit = async () => {
        const body = { title, description, requirement };
        if (!title.trim() || !description.trim() || !requirement.trim()) {
            alert("👾 모든 항목을 입력해주세요.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/study-class`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({ title, description, requirement }),
            });

            if (!response.ok) throw new Error("Failed to create study");

            const result = await response.json();
            alert("👾 생성 완료되었습니다!");
            onClose();
            onCreated();
        } catch (err) {
            alert("👾 생성 실패: " + (err instanceof Error ? err.message : "알 수 없는 오류"));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 font-NanumSquare">
            <div className="bg-gray-100 rounded-xl p-8 w-full max-w-md shadow-lg">
                <h2 className="text-xl font-bold mb-4">스터디 그룹 생성</h2>
                <input
                    className="w-full mb-3 p-2 border rounded"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    className="w-full mb-3 p-2 border rounded"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <input
                    className="w-full mb-3 p-2 border rounded"
                    placeholder="Requirement"
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-4 font-Pretendard">
                    <button
                        className="px-4 py-2 bg-gray-300 rounded-full"
                        onClick={onClose}
                    >
                        cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-600 text-white rounded-full hover:text-[#CAFF33]"
                        onClick={handleSubmit}
                    >
                        create
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateStudyModal;