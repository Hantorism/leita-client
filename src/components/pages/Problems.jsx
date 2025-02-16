import React, { useEffect, useState } from "react";
import Header from "../common/Header";
import axios from "axios";

const Problems = () => {
    const [problems, setProblems] = useState([]);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const res = await axios.get("https://dev-server.leita.dev/api/problem");
                setProblems(res.data);
            } catch (error) {
                console.error("Failed to fetch problems:", error);
            }
        };
        fetchProblems();
    }, []);

    return (
        <div className="flex flex-col items-start h-screen text-gray-900 pl-[10%] pr-[10%] pt-[5%] bg-[#1A1A1A]">
            <header className="w-full text-left">
                <Header />
            </header>

            <div className="max-w-4xl mx-auto w-full pt-9">
                <div className="bg-[#2A2A2A] bg-opacity-90 text-white rounded-lg shadow-md overflow-hidden">
                    <table className="font-nanum w-full text-left border-collapse border border-gray-600">
                        <thead>
                        <tr className="bg-[#2A2A2A] text-white">
                            <th className="p-3 border-b border-gray-500">ID</th>
                            <th className="p-3 border-b border-gray-500 font-semibold">제목</th>
                            <th className="p-3 border-b border-gray-500">정답률</th>
                        </tr>
                        </thead>
                        <tbody>
                        {problems.length > 0 ? (
                            problems.map((problem, index) => (
                                <tr
                                    key={index}
                                    onClick={() => window.open(`http://localhost:3000/problems/${problem.problemId}`, "_blank")}
                                    className={`cursor-pointer border-b border-gray-500 hover:bg-black hover:text-[#CAFF33] transition ${
                                        index % 2 === 0 ? "bg-white bg-opacity-10" : "bg-[#2A2A2A] bg-opacity-20"
                                    }`}
                                >
                                    <td className="p-3">{problem.problemId}</td>
                                    <td className="p-3 font-bold">
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
                                    문제를 불러오는 중이거나 문제가 없습니다.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Problems;
