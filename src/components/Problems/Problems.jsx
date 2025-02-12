import React, { useEffect, useState } from "react";
import Header from "../common/Header";

const Problems = () => {
    const [problems, setProblems] = useState([]);

    useEffect(() => {
        // 실제 API 요청을 주석 처리하고, 대신 임시 데이터를 설정
        // const fetchProblems = async () => {
        //     try {
        //         const res = await axios.get(`${API_BASE_URL}/problems`);
        //         setProblems(res.data);
        //     } catch (error) {
        //         console.error("Failed to fetch problems:", error);
        //     }
        // };
        // fetchProblems();

        // 임시 데이터
        const dummyProblems = [
            {
                problem: "A+B 문제",
                timeLimit: 1000,
                memoryLimit: 256,
                testCases: [{ input: "1 2", output: "3" }],
            },
            {
                problem: "최대공약수와 최소공배수",
                timeLimit: 2000,
                memoryLimit: 512,
                testCases: [{ input: "24 18", output: "6 72" }],
            },
            {
                problem: "문자열 뒤집기",
                timeLimit: 1500,
                memoryLimit: 128,
                testCases: [{ input: "hello", output: "olleh" }],
            },
        ];
        setProblems(dummyProblems);
    }, []);

    return (
        <div className="flex flex-col items-start h-screen text-white pl-[10%] pr-[10%] pt-[5%]">
            <header className="w-full text-left">
                <Header />
            </header>

            <div className="max-w-4xl mx-auto w-full pt-9">
                {/*<h1 className="text-xl font-bold mb-4">문제 목록</h1>*/}

                <div className="bg-white bg-opacity-65 text-black rounded-lg shadow-md overflow-hidden">
                    <table className="w-full text-left border-collapse border border-gray-400 even:bg-gray-800">
                        <thead>
                        <tr className="bg-gray-250">
                            <th className="p-3 border-b">#</th>
                            <th className="p-3 border-b">문제 이름</th>
                            <th className="p-3 border-b">시간 제한</th>
                            <th className="p-3 border-b">메모리 제한</th>
                            <th className="p-3 border-b">테스트 케이스</th>
                        </tr>
                        </thead>
                        <tbody>
                        {problems.length > 0 ? (
                            problems.map((problem, index) => (
                                <tr
                                    key={index}
                                    className={`border-b hover:bg-gray-200 transition ${
                                        index % 2 === 0 ? "bg-white bg-opacity-35" : ""
                                    }`}
                                >
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3 font-semibold">{problem.problem || "제목 없음"}</td>
                                    <td className="p-3">{problem.timeLimit} ms</td>
                                    <td className="p-3">{problem.memoryLimit} MB</td>
                                    <td className="p-3">{problem.testCases.length}개</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-3 text-center text-gray-500">
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
