import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import EditStudyModal from '../common/EditStudyModal.tsx';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const StudyDetails = () => {
    const { id } = useParams();
    const [study, setStudy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const fetchStudyDetails = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/study-class/${id}`);
            if (!response.ok) throw new Error("스터디 정보를 불러오는 데 실패했습니다.");

            const result = await response.json();
            setStudy(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudyDetails();
    }, [id]);
    const token = localStorage.getItem("token");

    const onDeleteStudy = async () => {
        const isConfirmed = window.confirm(
            "🚨 이 스터디를 삭제하시겠습니까? 삭제 후 모든 정보가 영구적으로 삭제됩니다."
        );

        if (!isConfirmed) {
            return; // If the user cancels, do nothing
        }
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/study-class/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "스터디 삭제 실패");
            }


            alert("스터디가 삭제되었습니다.");
            window.location.href = "/study";
        } catch (error) {
            alert(error.message);
        }
    };


    const onUpdateStudy = async (updatedData) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${API_BASE_URL}/study-class/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },

                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error("🚨 스터디 업데이트 실패");
            }

            const result = await response.json();
            setStudy(result.data);
            setIsModalOpen(false);
        } catch (error) {
            alert(error.message);
        }
    };

    if (loading) return <div className="text-center text-lg">로딩 중...</div>;
    if (error) return <div className="text-center text-red-500">{`오류: ${error}`}</div>;


    return (
        <div className="max-w-6xl mx-auto p-6 bg-[#1A1A1A] text-white shadow-md rounded-lg mt-6 font-Pretend grid grid-cols-1 md:grid-cols-2 gap-6">
            {study && (
                <div>

                    <div className="mb-6">
                        <h1 className="text-3xl p-4 mb-4 font-semibold text-gray-50 mb-4 border-l-4  bg-opacity-10 font-Pretend bg-white">{study.title}</h1>

                        <div className="mb-6">
                            <ul className="space-y-2">
                                {study.admins.map(admin => (
                                    <li key={admin.email} className="flex items-center space-x-2 text-gray-200">
                                        <span className="">Admin | </span>
                                        <span className="font-semibold">{admin.name}</span>
                                        <span className="text-sm">({admin.email})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <p className="text-lg p-4 mb-4   bg-opacity-10 font-Pretend bg-white rounded-lg">
                            {study.description}
                        </p>
                        <div className="mb-6 p-4  font-Pretend  bg-opacity-10  rounded-lg">
                            <p className=" text-lg">모집 조건</p>
                            <p>{study.requirement}</p>
                        </div>
                    </div>

                    <hr className="border-t border-gray-500 mt-2" />

                    <h3 className="text-xl mt-5  text-gray-50 mb-2">Member ({study.members.length}명)</h3>
                    <div className="overflow-x-auto   whitespace-nowrap p-2 rounded-lg bg-[#2A2A2A] scrollbar-hide">
                        {study.members.map((member) => (
                            <div
                                key={member.email}
                                className="inline-block w-24 mx-0.2 flex-shrink-0 "
                            >
                                <div className="flex flex-col items-center space-y-1">
                                    <div className="w-14 h-14 rounded-full bg-gray-500 flex justify-center items-center text-white">
                                        <span className="text-xl">{member.name[0]}</span>
                                    </div>
                                    <span className="text-sm text-center">{member.name}</span>

                                </div>
                            </div>
                        ))}


                    </div>

                    {study && study.admins.some(admin => admin.email === user.data.email) && (
                        <div className="mb-6">
                            <h3 className="text-xl  mb-2 mt-3">대기 중인 멤버({study.pendings.length}명)</h3>
                            <ul className="space-y-2">
                                {study.pendings.map(pending => (
                                    <li key={pending.email} className="flex items-center space-x-2">
                                        <span className="font-semibold text-gray-800">{pending.name}</span>
                                        <span className="text-gray-600 text-sm">({pending.email})</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    className="px-4 py-2 bg-gray-600 text-white rounded"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    스터디 수정
                                </button>
                                <button
                                    className="px-4 py-2 bg-gray-600 text-white rounded"
                                    onClick={onDeleteStudy}
                                >
                                    스터디 삭제
                                </button>
                            </div>

                        </div>
                    )}




                </div>
            )}

            {study && (
                <div className="w-full">


                </div>
            )}

            <EditStudyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                study={study}
                onUpdate={onUpdateStudy}
                onDelete={onDeleteStudy}
            />



        </div>



    );
};

export default StudyDetails;
