import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import MonacoEditor from "@monaco-editor/react";

const ProblemDetail = () => {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [leftWidth, setLeftWidth] = useState(600);
    const isDragging = useRef(false);
    const [code, setCode] = useState("");


    useEffect(() => {
        axios.get(`https://dev-server.leita.dev/api/problem/${id}`)
            .then((res) => {
                setProblem(res.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Failed to fetch problem:", error);
                setLoading(false);
            });
    }, [id]);

    const startResizing = (e) => {
        e.preventDefault();
        isDragging.current = true;
        document.addEventListener("mousemove", handleResize);
        document.addEventListener("mouseup", stopResizing);
    };

    const handleResize = (e) => {
        if (isDragging.current) {
            const newWidth = e.clientX;
            setLeftWidth(Math.max(300, Math.min(newWidth, window.innerWidth * 0.7)));
        }
    };

    const stopResizing = () => {
        isDragging.current = false;
        document.removeEventListener("mousemove", handleResize);
        document.removeEventListener("mouseup", stopResizing);
    };

    if (loading) return <div className="text-white text-center mt-10">문제를 불러오는 중...</div>;
    if (!problem) return <div className="text-white text-center mt-10">문제를 찾을 수 없습니다.</div>;

    return (
        <div className="flex min-h-screen bg-[#1A1A1A] text-white px-6 py-4">

            <div
                className="bg-[#2A2A2A] p-6 shadow-lg overflow-y-auto min-w-[300px] max-w-[70vw] relative rounded-lg m-4"
                style={{width: `${leftWidth}px`}}
            >
                <h1 className="text-2xl font-bold text-[#CAFF33]">{problem.title}</h1>

                <div className="mt-3 flex flex-wrap gap-2">
                    {problem.category?.map((cat, i) => (
                        <span key={i} className="px-2 py-1 text-xs text-gray-200 border border-gray-500 rounded-full">
                            {cat}
                        </span>
                    ))}
                </div>

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


                {/* 예제 케이스 */}
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

                <p className="text-sm text-gray-400 pt-3">출처: {problem.source}</p>
                <p className="text-sm text-gray-400">작성자: {problem.authorName}</p>
            </div>


            {/* 리사이즈 핸들 */}
            <div
                className="w-0.5 bg-gray-500 cursor-ew-resize rounded-full m-4"
                onMouseDown={startResizing}
            />

            {/* 오른쪽 코드 작성 영역 */}
            <div className="flex-1 min-w-[300px] bg-[#1E1E1E] p-6 rounded-lg shadow-lg m-4">

                <h2 className="text-xl font-semibold text-[#CAFF33]">코드 작성</h2>

                {/* 코드 입력 영역 */}
                <div className="mt-3 bg-[#282C34] rounded-lg border-2 border-gray-600 overflow-hidden shadow-lg">
                    <div className="flex items-center px-4 py-2 bg-[#1E1E1E]  ">
                        <span className="ml-4 text-sm text-gray-300">solution.py</span>
                    </div>

                    <MonacoEditor
                        className="w-full h-[60vh]  text-gray-300 bg-transparent outline-none resize-none font-mono"
                        height="300px"
                        defaultLanguage="javascript"
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || "")}
                    />


                </div>
            </div>
        </div>
    );
};

export default ProblemDetail;
