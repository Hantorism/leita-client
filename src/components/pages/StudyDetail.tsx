import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import EditStudyModal from '../common/EditStudyModal.tsx';
import { FiSettings } from "react-icons/fi";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const StudyDetails = () => {
    const { id } = useParams();
    const [study, setStudy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [showAdminActions, setShowAdminActions] = useState(false);
    const [sessions, setSessions] = useState([]);

    const [description, setDescription] = useState("");


    const isAdmin = study?.admins.some(admin => admin.email === user.data.email);
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
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


    const fetchStudySessions = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/study?classId=${id}&page=0&size=10`
            );
            if (!response.ok) throw new Error("스터디 세션 목록 불러오기 실패");

            const result = await response.json();
            setSessions(result.data.content);
        } catch (err) {
            console.error(err.message);
        }
    };
    useEffect(() => {
        fetchStudyDetails();
        fetchStudySessions();
    }, [id]);

    const token = localStorage.getItem("token");
    const createStudySession = async () => {
        try {
            const token = localStorage.getItem("token");
            const now = new Date();
            const end = new Date(now.getTime() + 60 * 60 * 1000); // 1시간 후

            const response = await fetch(
                `${API_BASE_URL}/study?classId=${id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        startDateTime: now.toISOString(),
                        endDateTime: end.toISOString(),
                        description: description || "스터디 세션",
                    }),
                }
            );

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "세션 생성 실패");
            }

            console.log("세션 생성 성공", result);
            setIsSessionModalOpen(false); // 모달 닫기
            setDescription("");

        } catch (error) {
            console.error("세션 생성 에러:", error);
        }
    };



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
                    <div className="mb-6 flex justify-between items-start bg-white bg-opacity-10 border-l-4">
                        <h1 className="text-3xl p-4 font-semibold text-gray-50  font-Pretend ">
                            {study.title}
                        </h1>

                        {isAdmin && (
                            <div className="relative mt-2 mr-2">
                                <button
                                    onClick={() => setShowAdminActions(prev => !prev)}
                                    className="text-white hover:text-gray-300 p-2 mt-2 rounded-full"
                                >
                                    <FiSettings size={24} />
                                </button>

                                {showAdminActions && (
                                    <div className="absolute right-0 mt-2 w-40 bg-[#1A1A1A] rounded-lg shadow-lg z-10">
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-600"
                                        >
                                            스터디 수정
                                        </button>
                                        <button
                                            onClick={onDeleteStudy}
                                            className="w-full px-4 py-2 text-left text-red-300 hover:bg-gray-600"
                                        >
                                            스터디 삭제
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>


                    <div className="mb-6">
                        <ul className="space-y-2">
                            {study.admins.map(admin => (
                                <li key={admin.email} className="flex items-center space-x-2 text-gray-200">
                                    <span>Admin | </span>
                                    <span className="font-semibold">{admin.name}</span>
                                    <span className="text-sm">({admin.email})</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="text-lg p-4 mb-4 bg-opacity-10 font-Pretend bg-white rounded-lg">
                        {study.description}
                    </p>

                    <div className="mb-6 p-4 font-Pretend bg-opacity-10 rounded-lg">
                        {/*<p className="text-lg">requirement</p>*/}
                        <p>{study.requirement}</p>
                    </div>

                    <hr className="border-t border-gray-500 mt-2" />

                    <h3 className="text-xl mt-5 text-gray-50 mb-2">Member ({study.members.length}명)</h3>

                    <div className="overflow-visible whitespace-nowrap p-2 rounded-lg bg-[#2A2A2A] scrollbar-hide">
                        {study.members.map((member) => (
                            <div key={member.email} className="inline-block w-24 mx-0.5 flex-shrink-0">
                                <div className="flex flex-col items-center space-y-1 group relative">
                                    <div className="w-14 h-14 rounded-full bg-gray-500 flex justify-center items-center text-white">
                                        <span className="text-xl">{member.name[0]}</span>
                                    </div>
                                    <span className="text-sm text-center">{member.name}</span>

                                    <div className="absolute top-full mt-1 text-xs text-white bg-black bg-opacity-80 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                                        {member.email}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>






                    {study && study.admins.some(admin => admin.email === user.data.email) && (
                        <div className="mb-6">
                            <h3 className="text-xl  mb-2 mt-7">Pending Member({study.pendings.length}명)</h3>
                            <ul className="space-y-2">
                                {study.pendings.map(pending => (
                                    <li key={pending.email} className="flex items-center space-x-2">
                                        <span className="font-semibold text-gray-800">{pending.name}</span>
                                        <span className="text-gray-600 text-sm">({pending.email})</span>
                                    </li>
                                ))}
                            </ul>


                        </div>
                    )}




                </div>
            )}

            {study && (
                <div className="w-full mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl">🚀 Session List</h2>
                        {isAdmin && (
                            <button
                                onClick={() => setIsSessionModalOpen(true)}
                                className="bg-gray-600 hover:text-[#CAFF33] text-white px-4 py-2 rounded-full"
                            >
                                add
                            </button>
                        )}


                </div>


                    {sessions.length === 0 ? (
                        <p className="text-gray-400 pt-4">등록된 세션이 없습니다.</p>
                    ) : (
                        <ul className="space-y-4">
                            {sessions.map(session => (
                                <li key={session.id} className="p-4 bg-[#2a2a2a] rounded-lg shadow-md">
                                    <p className="text-white text-sm">
                                        <strong>시작:</strong> {new Date(session.startDateTime).toLocaleString()}<br />
                                        <strong>종료:</strong> {new Date(session.endDateTime).toLocaleString()}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {session.participants.map(p => (
                                            <div key={p.email} className="flex items-center space-x-2 bg-gray-700 text-white px-2 py-1 rounded-full">
                                                <span className="font-medium">{p.name}</span>
                                                <span className="text-xs">({p.email})</span>
                                            </div>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}


            <EditStudyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                study={study}
                onUpdate={onUpdateStudy}
                onDelete={onDeleteStudy}
            />

            {isSessionModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 text-gray-800">
                    <div className="bg-gray-50 rounded-lg p-6 w-full max-w-md shadow-lg">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">스터디 세션 설명 입력</h2>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="세션 설명을 입력하세요"
                            className="w-full px-3 py-2 border rounded mb-4"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setIsSessionModalOpen(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-full "
                            >
                                취소
                            </button>
                            <button
                                onClick={createStudySession}
                                className="px-4 py-2 bg-gray-600 text-white rounded-full hover:text-[#CAFF33]"
                            >
                                생성
                            </button>
                        </div>
                    </div>
                </div>
            )}




        </div>



    );
};

export default StudyDetails;
