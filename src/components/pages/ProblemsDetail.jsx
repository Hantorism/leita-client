import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../common/Header";

const ProblemDetail = () => {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);

    // 목데이터
    const mockProblem = {
        title: "A+B 문제",
        authorName: "관리자",
        description: {
            problem: "두 정수 A와 B를 입력받아 A+B를 출력하는 문제입니다.",
            input: "첫째 줄에 A와 B가 주어진다. (0 ≤ A, B ≤ 10)",
            output: "첫째 줄에 A+B를 출력한다."
        },
        limit: {
            memory: 128,
            time: 1
        },
        testCases: [
            {
                input: "1 2",
                output: "3",
                id: 1
            },
            {
                input: "5 8",
                output: "13",
                id: 2
            }
        ],
        source: "Baekjoon Online Judge",
        solved: {
            count: 120,
            rate: 85
        },
        category: ["수학", "기초"]
    };

    useEffect(() => {
        // API 호출 주석 처리 후 목데이터 사용
        // axios.get(`https://dev-server.leita.dev/api/problem/${id}`).then((res) => {
        //     setProblem(res.data);
        //     setLoading(false);
        // }).catch((error) => {
        //     console.error("Failed to fetch problem:", error);
        //     setLoading(false);
        // });

        setTimeout(() => {
            setProblem(mockProblem);
            setLoading(false);
        }, 500);
    }, [id]);

    if (loading) {
        return <div className="text-white text-center mt-10">문제를 불러오는 중...</div>;
    }

    if (!problem) {
        return <div className="text-white text-center mt-10">문제를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#1A1A1A] text-white px-[10%] py-[5%]">
            <div
                className="max-w-3xl mx-auto bg-[#2A2A2A] bg-opacity-90 p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto resize-x min-w-[300px] max-w-[90vw]"
                style={{ resize: "horizontal", overflowX: "auto" }}
            >
                <h1 className="text-2xl font-bold text-[#CAFF33]">{problem.title}</h1>

                <div className="mt-3">
                    <div className="flex flex-wrap gap-2 mt-1">
                        {problem.category?.map((cat, i) => (
                            <span key={i} className="px-2 py-1 text-xs text-gray-200 border border-gray-500 rounded-full">
                        {cat}
                    </span>
                        ))}
                    </div>
                </div>

                <p className="text-sm text-gray-400">출처: {problem.source}</p>
                <p className="text-sm text-gray-400">작성자: {problem.authorName}</p>

                <div className="mt-3">
                    <span className="text-gray-400">정답률:</span> {problem.solved?.rate}%
                    <span className="ml-4 text-gray-400">풀이 제출 수:</span> {problem.solved?.count}
                </div>

                <div className="mt-6">
                    <h2 className="text-xl font-semibold">문제 설명</h2>
                    <p className="mt-2 text-gray-300">{problem.description.problem}</p>
                </div>

                <div className="mt-4">
                    <h3 className="text-lg font-semibold">입력</h3>
                    <pre className="bg-black text-gray-300 p-3 rounded-md mt-1">{problem.description.input}</pre>
                </div>

                <div className="mt-4">
                    <h3 className="text-lg font-semibold">출력</h3>
                    <pre className="bg-black text-gray-300 p-3 rounded-md mt-1">{problem.description.output}</pre>
                </div>

                <div className="mt-4">
                    <h3 className="text-lg font-semibold">제한 사항</h3>
                    <p className="text-gray-300">메모리 제한: {problem?.limit?.memory ?? "정보 없음"}MB</p>
                    <p className="text-gray-300">시간 제한: {problem?.limit?.time ?? "정보 없음"}초</p>
                </div>

                <div className="mt-6">
                    <h2 className="text-xl font-semibold">예제 테스트 케이스</h2>
                    {problem.testCases.map((testCase, index) => (
                        <div key={testCase.id} className="mt-3 p-3 bg-black rounded-lg">
                            <h3 className="text-sm text-gray-400">입력 {index + 1}</h3>
                            <pre className="bg-[#1E1E1E] text-gray-300 p-2 rounded-md">{testCase.input}</pre>
                            <h3 className="text-sm text-gray-400 mt-2">출력 {index + 1}</h3>
                            <pre className="bg-[#1E1E1E] text-gray-300 p-2 rounded-md">{testCase.output}</pre>
                        </div>
                    ))}
                </div>

                <button
                    className="mt-6 w-full py-3 bg-[#CAFF33] text-[#1A1A1A] font-bold rounded-full transition-all duration-300 hover:bg-[#9D5CE9] hover:text-white hover:shadow-lg"
                    onClick={() => window.location.href = `/problem/${id}/solve`}
                >
                    문제 풀기
                </button>
            </div>
        </div>

    );
};

export default ProblemDetail;
