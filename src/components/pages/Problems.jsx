import React, { useEffect, useState } from "react";
import Header from "../common/Header";

const Problems = () => {
    const [problems, setProblems] = useState([]);

    useEffect(() => {
        // 실제 API 요청을 주석 처리하고 목데이터를 사용
        // const fetchProblems = async () => {
        //     try {
        //         const res = await axios.get("API_BASE_URL/problems");
        //         setProblems(res.data);
        //     } catch (error) {
        //         console.error("Failed to fetch problems:", error);
        //     }
        // };
        // fetchProblems();

        // 목데이터
        const dummyProblems = [
            {
                title: "A+B 문제",
                category: ["수학", "기초"],
                solved: { rate: 85 },
            },
            {
                title: "최대공약수와 최소공배수",
                category: ["수학", "유클리드"],
                solved: { rate: 78 },
            },
            {
                title: "문자열 뒤집기",
                category: ["문자열 처리"],
                solved: { rate: 92 },
            },
            {
                title: "빠진 데이터 예제",
                category:  ["자료구조"],
                solved: { rate: null },
            }
        ];
        setProblems(dummyProblems);
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
                            <th className="p-3 border-b border-gray-500">#</th>
                            <th className="p-3 border-b border-gray-500 font-semibold">제목</th>
                            <th className="p-3 border-b border-gray-500">정답률</th>
                        </tr>
                        </thead>
                        <tbody>
                        {problems.length > 0 ? (
                            problems.map((problem, index) => (
                                <tr
                                    key={index}
                                    className={`border-b bg-black border-gray-500 hover:bg-black  hover:text-[#CAFF33] transition ${
                                        index % 2 === 0 ? "bg-white bg-opacity-10" : "bg-[#2A2A2A] bg-opacity-20" // 배경 색상 변경
                                    }`}
                                >


                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3 font-bold">
                                        {problem.title || "제목 없음"}
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {problem.category?.map((cat, i) => (
                                                <span key={i}
                                                      className="px-2 py-1 text-xs text-gray-200 border border-solid rounded-full">
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
