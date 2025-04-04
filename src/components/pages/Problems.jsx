import React, { useEffect, useState } from "react";
import Header from "../common/Header";
import axios from "axios";
import Footer from "../common/Footer";
import JudgeButton from "../common/JudgeButton.tsx";

const API_BASE_URL = process.env.REACT_APP_API_URL; // API 주소 설정

const Problems = () => {
    const [problems, setProblems] = useState([]);
    const [judgedProblems, setJudgedProblems] = useState([]); // 사용자가 푼 문제 상태 저장
    const [searchQuery, setSearchQuery] = useState("");
    const problemsPerPage = 10;

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/problem`, {
                    params: {
                        page: currentPage ,
                        size: problemsPerPage,
                    },
                });
                const content = res.data?.data?.content ?? [];
                const total = res.data?.data?.totalPages ?? 1;
                setProblems(content);
                setTotalPages(total);
                console.log("Fetched problems:", content);

                if (!Array.isArray(content)) {
                    throw new Error("Invalid response format");
                }

                setProblems(content);
            } catch (error) {
                console.error("Failed to fetch problems:", error);
                setProblems([]);
            }
        };


        const fetchJudgedProblems = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${API_BASE_URL}/judge`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });
                const judgedData = res.data?.data ?? [];
                setJudgedProblems(judgedData.filter((judge) => judge.result === "CORRECT"));
            } catch (error) {
                console.error("Failed to fetch judged problems:", error);
            }
        };
        console.log("Fetching problems with params:", { page: currentPage, size: problemsPerPage });


        fetchProblems();
        fetchJudgedProblems();
    },  [ currentPage]);




    const [currentProblems, setCurrentProblems] = useState([]);

    useEffect(() => {


        const indexOfLastProblem = (currentPage + 1) * problemsPerPage;
        const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;

        // console.log("Slicing from", indexOfFirstProblem, "to", indexOfLastProblem);
        setCurrentProblems(problems.slice(indexOfFirstProblem, indexOfLastProblem));
    }, [problems, currentPage]);

    useEffect(() => {

        setCurrentProblems(problems); // 그대로 저장
    }, [problems]);


    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };
    const renderPagination = () => {
        const pageNumbers = [];
        const maxPageButtons = 5;
        let startPage = Math.max(0, currentPage - 2);
        let endPage = Math.min(totalPages - 1, startPage + maxPageButtons - 1);

        if (endPage - startPage < maxPageButtons - 1) {
            startPage = Math.max(0, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 mx-1 rounded-full transition ${
                        currentPage === i ? "bg-[#CAFF33] text-black" : "bg-gray-700 text-white hover:bg-gray-600"
                    }`}
                >
                    {i + 1}
                </button>
            );
        }

        return pageNumbers;
    };

    const isProblemSolved = (problemId) => {
        return judgedProblems.some((judge) => judge.problemId === problemId);
    };
    const filteredProblems = problems.filter((problem) => {
        return (
            problem.title?.toLowerCase().includes(searchQuery.toLowerCase()) || // 제목 검색
            problem.problemId.toString().includes(searchQuery) // ID 검색
        );
    });

    return (
        <div className="flex flex-col items-start min-h-screen text-gray-900 pt-[5%] bg-[#1A1A1A] font-lexend">
            <header className="pl-[10%] pr-[10%] w-full text-left">
                <Header />
            </header>

            <div className="flex w-full mt-6 items-center justify-center gap-4">
                <input
                    type="text"
                    placeholder=" Search by Title or ID"
                    className="w-[35%] p-2 border border-gray-500 rounded-full bg-[#2A2A2A] text-white text-center"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                {/* JudgeButton */}
                <JudgeButton />
            </div>


            <div className="flex-grow max-w-3xl mx-auto w-full pt-9 md:text-sm pl-5 pr-5">
                <div className="bg-[#2A2A2A] bg-opacity-90 text-white rounded-lg shadow-md overflow-hidden">
                    <table className=" w-full text-left border-collapse border border-gray-600">
                        <thead>
                        <tr className="bg-[#2A2A2A] text-white">
                            <th className="p-3 border-b border-gray-500">ID</th>
                            <th className="p-3 border-b border-gray-500">Title</th>
                            <th className="p-3 border-b border-gray-500">Correct rate</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredProblems.length > 0 ? (
                            filteredProblems.map((problem) => (
                                <tr
                                    key={problem.problemId}
                                    onClick={() => {
                                        const problemUrl = `problems/${problem.problemId}`;
                                        const newWindow = window.open(problemUrl, "_blank");

                                        newWindow?.addEventListener("load", () => {
                                            const token = localStorage.getItem("accessToken");
                                            if (token) {
                                                newWindow?.postMessage({accessToken: token}, `${window.location.host}`);
                                            }
                                        });
                                    }}
                                    className={`cursor-pointer border-b border-gray-500 hover:bg-black hover:text-[#CAFF33] transition ${
                                        problem.problemId % 2 === 0 ? "bg-white bg-opacity-10" : "bg-[#2A2A2A] bg-opacity-20"
                                    }`}
                                >
                                    <td className="p-3">{problem.problemId}</td>
                                    <td className="p-3 font-Pretend">
                                        {problem.title || "제목 없음"}
                                        {isProblemSolved(problem.problemId) && (
                                            <span className="ml-4 text-xs text-gray-500">( solved. ) </span>
                                        )}
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {problem.category?.map((cat, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-1 text-xs text-gray-200 border border-gray-500 rounded-full"
                                                >
                                                        {cat}
                                                    </span>
                                            )) || <span className="text-xs text-gray-400">없음</span>}
                                        </div>
                                    </td>
                                    <td className="p-3">{problem.solved?.rate != null ? `${problem.solved.rate}%` : "N/A"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="p-3 text-center text-gray-400">
                                    문제를 불러오는 중입니다.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
                {/*<div className="flex justify-center mt-4">*/}
                {/*    {renderPagination()}*/}
                {/*</div>*/}
                <div className="flex justify-center mt-4">
                    {Array.from({length: totalPages}, (_, i) => (
                        <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            className={`px-3 py-1 mx-1 rounded-full transition ${
                                currentPage === i ? "bg-[#CAFF33] text-black" : "bg-gray-700 text-white hover:bg-gray-600"
                            }`}
                        >
                            {i+1 }
                        </button>
                    ))}

                </div>
            </div>

            <footer className="w-full text-left mt-20">
                <Footer />
            </footer>
        </div>
    );
};

export default Problems;
