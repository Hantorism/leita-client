import React, { useEffect, useState } from "react";
import Header from "../common/Header";
import axios from "axios";
import Footer from "../common/Footer";


const API_BASE_URL = process.env.REACT_APP_API_URL;

const Problems = () => {
    const [problems, setProblems] = useState([]);
    const [judgedProblems, setJudgedProblems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);


    const problemsPerPage = 10;
    const [filter, setFilter] = useState("ALL");
    const token = localStorage.getItem("token");
    useEffect(() => {
        if (!token) return;
        const fetchProblems = async () => {
            try {
                const params = {
                    page: currentPage,
                    size: problemsPerPage,
                    search: searchQuery,
                    filter: filter !== "ALL" ? filter : undefined,
                };


                const res = await axios.get(`${API_BASE_URL}/problem`, { params,  headers: {
                        Authorization: `Bearer ${token}`,
                    },withCredentials: true, });
                const content = res.data?.data?.content ?? [];
                const total = res.data?.data?.totalPages ?? 1;
                if (!Array.isArray(content)) {
                    throw new Error("Invalid response format");
                }
                setProblems(content);
                setTotalPages(total);
            } catch (error) {
                console.error("Failed to fetch problems:", error);
                setProblems([]);
            }
        };
        fetchProblems();

    }, [currentPage, searchQuery, filter]);

    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };

    const isProblemSolved = (problem) => {
        return problem.solved?.successCount > 0;
    };


    const filteredProblems = problems.filter((problem) => {
        const matchesSearch =
            problem.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            problem.problemId.toString().includes(searchQuery);

        if (!matchesSearch) return false;

        if (filter === "SOLVED") return isProblemSolved(problem);
        if (filter === "UNSOLVED") return !isProblemSolved(problem);

        return true;
    });


    return (
        <div className="flex flex-col items-start min-h-screen text-gray-900 pt-[5%] bg-[#1A1A1A] font-lexend">
            <header className="pl-[10%] pr-[10%] w-full text-left">
                <Header />
            </header>

            <div className="flex w-full mt-6 items-center justify-center gap-4">
                <div className="flex flex-wrap gap-2 w-[25%] rounded-full justify-center">
                    {[
                        { key: "ALL", label: "ALL" },
                        { key: "SOLVED", label: "SOLVED" },
                        { key: "UNSOLVED", label: "UNSOLVED" },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-4 py-1 rounded-full transition ${
                                filter === key
                                    ? "bg-[#2A2A2A] text-white "
                                    : "text-white hover:text-[#CAFF33]  hover:bg-opacity-0 "
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder=" Search by Title or ID"
                    className="w-[20%] p-2 py-1 rounded-full bg-[#2A2A2A]  rounded-full bg-[#2A2A2A] text-white text-center"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>




            <div className="flex-grow max-w-3xl mx-auto w-full pt-9 md:text-sm pl-5 pr-5">
                <div className="bg-[#2A2A2A] bg-opacity-90 text-white rounded-lg shadow-md overflow-hidden border-collapse border border-gray-600">
                    <table className=" w-full text-left ">
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
                                                newWindow?.postMessage({ accessToken: token }, `${window.location.host}`);
                                            }
                                        });
                                    }}
                                    className={`cursor-pointer border-b border-gray-500 hover:bg-black hover:text-[#CAFF33] transition ${
                                        problem.problemId % 2 === 0
                                            ? "bg-white bg-opacity-10"
                                            : "bg-[#2A2A2A] bg-opacity-20"
                                    }`}
                                >
                                    <td className="p-3">{problem.problemId}</td>
                                    <td className="p-3 font-Pretend">
                                        {problem.title || "제목 없음"}
                                        {isProblemSolved(problem) && (
                                            <span className="ml-4 text-xs text-gray-500">(solved)</span>
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
                                    <td className="p-3">
                                        {problem.solved?.rate != null ? `${problem.solved.rate.toFixed(2)}%` : "N/A"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="p-3 text-center text-gray-400">
                                    👾 문제를 불러오는 중
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* 페이지네이션 */}
                <div className="flex justify-center mt-4">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            className={`px-3 py-1 mx-1 rounded-full transition ${
                                currentPage === i
                                    ? "bg-[#CAFF33] text-black"
                                    : "bg-gray-700 text-white hover:bg-gray-600"
                            }`}
                        >
                            {i + 1}
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
