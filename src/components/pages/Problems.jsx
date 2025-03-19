import React, { useEffect, useState } from "react";
import Header from "../common/Header";
import axios from "axios";
import Footer from "../common/Footer";

const Problems = () => {
    const [problems, setProblems] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const problemsPerPage = 20;

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const res = await axios.get("https://dev-server.leita.dev/api/problem");
                const content = res.data?.data?.content ?? [];

                if (!Array.isArray(content)) {
                    throw new Error("Invalid response format");
                }

                setProblems(content);
            } catch (error) {
                console.error("Failed to fetch problems:", error);
                setProblems([]);
            }
        };

        fetchProblems();
    }, []);


    const indexOfLastProblem = currentPage * problemsPerPage;
    const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
    const currentProblems = problems.slice(indexOfFirstProblem, indexOfLastProblem);


    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className=" flex flex-col items-start min-h-screen text-gray-900  pt-[5%] bg-[#1A1A1A]">
            <header className="pl-[10%] pr-[10%] w-full text-left">
                <Header />
            </header>

            <div className="flex-grow max-w-3xl mx-auto w-full pt-9">
                <div className="bg-[#2A2A2A] bg-opacity-90 text-white rounded-lg shadow-md overflow-hidden">
                    <table className="font-Pretend w-full text-left border-collapse border border-gray-600">
                        <thead>
                        <tr className="bg-[#2A2A2A] text-white">
                            <th className="p-3 border-b border-gray-500">ID</th>
                            <th className="p-3 border-b border-gray-500 ">제목</th>
                            <th className="p-3 border-b border-gray-500">정답률</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentProblems.length > 0 ? (
                            currentProblems.map((problem, index) => (
                                <tr
                                    key={problem.problemId}
                                    onClick={() => {
                                        const problemUrl = `http://localhost:3000/problems/${problem.problemId}`;
                                        const newWindow = window.open(problemUrl, "_blank");


                                        newWindow?.addEventListener("load", () => {
                                            const token = localStorage.getItem("accessToken");
                                            if (token) {
                                                newWindow?.postMessage({accessToken: token}, "http://localhost:3000");
                                            }
                                        });
                                    }}
                                    className={`cursor-pointer border-b border-gray-500 hover:bg-black hover:text-[#CAFF33] transition ${
                                        problem.problemId % 2 === 0 ? "bg-white bg-opacity-10" : "bg-[#2A2A2A] bg-opacity-20"
                                    }`}
                                >
                                    <td className="p-3">{problem.problemId}</td>
                                    <td className="p-3 ">
                                        {problem.title || "제목 없음"}
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


                <div className="flex justify-center mt-4">
                    {Array.from({length: Math.ceil(problems.length / problemsPerPage)}, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => handlePageChange(i + 1)}
                            className={`px-3 py-1 mx-1 rounded-full transition ${
                                currentPage === i + 1 ? "bg-[#CAFF33] text-black" : "bg-gray-700 text-white hover:bg-gray-600"
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
