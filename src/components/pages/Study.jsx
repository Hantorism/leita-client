import React, { useEffect, useState } from "react";
import Header from "../common/Header";
import Footer from "../common/Footer";
import CreateStudyModal from "../common/CreateStudyModal.tsx";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Study = () => {
    const [studies, setStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    const [page, setPage] = useState(0); // currentPage 통합
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [isMember, setIsMember] = useState(false);
    const [studyDetails, setStudyDetails] = useState(null);
    const [selectedStudy, setSelectedStudy] = useState(null);
    const storedEmail = localStorage.getItem("email");
    const currentUserEmail = storedEmail?.trim().toLowerCase();
    const [showStudyDetailModal, setShowStudyDetailModal] = useState(false);





    const fetchStudies = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), size: String(size) });
            const response = await fetch(`${API_BASE_URL}/study-class?${params}`); // ✅ 여기에 page, size 포함
            if (!response.ok) throw new Error(`Failed to fetch study groups: ${response.status}`);

            const result = await response.json();
            setStudies(result.data?.content || []);
            setTotalPages(result.data?.totalPages || 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    const fetchStudyDetails = async (studyId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/study-class/${studyId}`, {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to fetch study details");

            const result = await response.json();
            const studyData = result.data;

            const currentUser = JSON.parse(localStorage.getItem("user"));
            const currentUserEmail = currentUser ? currentUser.data.email : null;

            console.log("Current Email:", currentUserEmail);



            const isAdmin = studyData.admins
                .map(a => a.email.toLowerCase().trim())
                .includes(currentUserEmail);
            const isMember = studyData.members
                .map(m => m.email.toLowerCase().trim())
                .includes(currentUserEmail);

            if (isMember || isAdmin) {
                window.open(`/study/${studyId}`, "_blank");
            } else {
                setSelectedStudy(studyData);
                setShowStudyDetailModal(true);
            }
        } catch (err) {
            console.error("에러 발생:", err);
            alert("스터디 정보를 불러오는 데 실패했습니다.");
        }
    };




    useEffect(() => {
        fetchStudies();
    },  [page]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className="flex flex-col items-start min-h-screen text-gray-900 pt-[5%] bg-[#1A1A1A] font-lexend">
            <header className="pl-[10%] pr-[10%] w-full text-left">
                <Header />
            </header>

            <div className="pl-[15%] pr-[15%] mt-6 w-full flex justify-end font-lexend">
                <button
                    onClick={() => setShowModal(true)}
                    className=" bg-white bg-opacity-30 text-white px-6 py-2 font-lexend rounded-full hover:text-[#b0e82e] hover:bg-opacity-10"
                >
                    Create Study
                </button>
            </div>
            <div className="flex-grow max-w-3xl mx-auto w-full">
            {!loading && !error && studies.length === 0 ? (
                <p className="text-center text-gray-400 mt-10 w-full">
                    🚀 진행 중인 스터디가 없습니다.
                </p>
            ) : (
                <div className="flex-grow max-w-3xl mx-auto w-full pt-9 md:text-sm pl-5 pr-5 font-Pretend">
                    <div className="bg-[#2A2A2A] bg-opacity-90 text-white rounded-lg shadow-md overflow-hidden border-collapse border border-gray-600">
                        <table className=" w-full text-left ">
                        <thead >
                        <tr className="bg-[#2A2A2A] text-white">
                            <th className="p-3 border-b border-gray-500">Title</th>
                            <th className="p-3 border-b border-gray-500">Description</th>
                            <th className="p-3 border-b border-gray-500">Admin</th>
                            <th className="p-3 border-b border-gray-500">Members</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white bg-opacity-5">
                        {studies.map((study, index) => (
                            <tr
                                key={study.id}
                                className={`cursor-pointer border-b border-gray-500 hover:bg-black hover:text-[#CAFF33] transition ${
                                    index % 2 === 0
                                        ? "bg-white bg-opacity-10"
                                        : "bg-[#2A2A2A] bg-opacity-20"
                                }`}
                                onClick={() => {
                                    fetchStudyDetails(study.id);
                                }}
                            >
                                <td className="px-4 py-5 ">{study.title}</td>
                                <td className="px-4 py-5 ">
                                    {study.description.length > 15
                                        ? `${study.description.slice(0, 15)}...`
                                        : study.description}
                                </td>
                                <td className="px-4 py-5 text-gray-300">
                                    {study.admins.map((a) => a.name).join(", ")}
                                </td>
                                <td className="px-4 py-5 text-gray-300">{study.members.length}명</td>
                            </tr>

                        ))}
                        </tbody>
                    </table>
                </div>
                </div>
            )}

                {/* 페이지네이션 */}
                <div className="flex justify-center mt-4 mb-4">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            className={`px-3 py-1 mx-1 rounded-full transition ${
                                page === i
                                    ? "bg-[#CAFF33] text-black"
                                    : "bg-gray-700 text-white hover:bg-gray-600"
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

            </div>

            {showModal && (
                <CreateStudyModal
                    onClose={() => setShowModal(false)}
                    onCreated={fetchStudies}
                />
            )}
            {showStudyDetailModal && selectedStudy && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-gray-100 rounded-xl p-8 w-full max-w-md shadow-lg ">
                        <h2 className="text-xl font-extrabold mb-4 font-nanum">{selectedStudy.title}</h2>
                        <p className="mb-3 font-bold text-gray-600 font-nanum">
                            {selectedStudy.description}
                        </p>
                        <p className="mb-10 text-sm text-gray-600 font-nanum">
                            모집 조건: {selectedStudy.requirement}
                        </p>
                        <div className="flex justify-end space-x-2">

                            <button
                                className="px-4 py-2 bg-gray-300  rounded-full hover:bg-gray-500"
                                onClick={() => setShowStudyDetailModal(false)}
                            >
                                close
                            </button>
                            <button
                                className="px-4 py-2  bg-gray-600 text-white rounded-full  hover:text-[#CAFF33]"
                                onClick={async () => {
                                    try {
                                        const res = await fetch(`/study-class/${selectedStudy.id}/join`, {
                                            method: "GET",
                                            credentials: "include",
                                        });

                                        if (res.ok) {
                                            alert("🚀 가입 요청을 전송했습니다.");
                                        } else {
                                            alert("❗가입 요청에 실패했습니다.");
                                        }
                                    } catch (error) {
                                        alert("❗네트워크 오류가 발생했습니다.");
                                        console.error(error);
                                    }

                                    setShowStudyDetailModal(false);
                                }}
                            >
                                Join
                            </button>
                        </div>
                    </div>
                </div>
            )}



            <footer className="w-full text-left mt-20">
                <Footer />
            </footer>
        </div>
    );
};

export default Study;
