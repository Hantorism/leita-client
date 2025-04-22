import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import CodeEditor from "../common/CodeEditor.tsx";

const API_BASE_URL = process.env.REACT_APP_API_URL; // API 주소 설정

const ProblemDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [leftWidth, setLeftWidth] = useState(600);
    const isDragging = useRef(false);
    const [code, setCode] = useState("");
    const [copiedId, setCopiedId] = useState(null);
    const decodeText = (text) => {
        try {
            if (!text) return "";


            const urlDecoded = decodeURIComponent(text);
            if (urlDecoded !== text) return urlDecoded;


            try {
                const binary = atob(text);
                const bytes = new Uint8Array([...binary].map(ch => ch.charCodeAt(0)));
                const decoded = new TextDecoder().decode(bytes);
                return decoded;
            } catch (e) {
                // 무시
            }


            const jsonParsed = JSON.parse(text);
            if (typeof jsonParsed === "string") return jsonParsed;

            return text;
        } catch (error) {
            return text;
        }
    };


    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get("token");

        console.log("🔍 Extracted token from URL:", token);


        if (token) {
            localStorage.setItem("accessToken", token);
            // console.log("✅ Token restored in localStorage:", token);
        }
    }, [location.search]);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/problem/${id}`);
                const data = res.data?.data;

                if (!data) {
                    throw new Error("Invalid response format");
                }

                setProblem(data);
            } catch (error) {
                console.error("Failed to fetch problem:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
    }, [id]);

    useEffect(() => {
        if (problem) {
            document.title = `${problem.title} - Leita`;
        }
    }, [problem]);

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

    const handleCopy = (input, id) => {
        navigator.clipboard.writeText(input).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    if (loading) return <div className="text-white text-center mt-10">👾 문제를 불러오는 중</div>;
    if (!problem) return <div className="text-white text-center mt-10">👽 문제를 찾을 수 없습니다.</div>;

    return (
        <div className="flex h-screen bg-[#1A1A1A] text-white px-3 py-4 font-Pretend ">
            {/* 문제 설명 영역 */}
            <div
                className="scrollbar-hide bg-[#2A2A2A] p-6 shadow-lg overflow-y-auto min-w-[300px] max-w-[70vw] relative rounded-lg m-4"
                style={{ width: `${leftWidth}px`, height: "calc(100vh - 60px)" }}
            >
                <h2 className="text-2xl font-bold text-gray-200 font-Pretend"># {problem.problemId} {problem.title}</h2>
                {/*<h1 className="text-2xl font-bold text-[#CAFF33]"></h1>*/}

                <div className="mt-3 flex flex-wrap gap-2">
                    {problem.category?.map((cat, i) => (
                        <span key={i} className="px-2 py-1 text-xs text-gray-200 border border-gray-500 rounded-full">
                            {cat}
                        </span>
                    ))}
                </div>

                <div className="mt-3">
                    <span className="text-gray-400 font-Pretend">정답률:</span>  {problem.solved?.rate?.toFixed(2)}%
                    <span className="ml-4 text-gray-400 font-Pretend">풀이 제출 수:</span> {problem.solved?.totalCount}
                </div>
                <hr className="border-t border-gray-500 mt-2" />

                <div className="mt-6">
                    <h2 className="text-xl font-normal pb-2 pt-1 font-Pretend">문제 설명</h2>
                    <pre className="mt-2 text-gray-300 whitespace-pre-wrap font-Pretend">{problem.description.problem}</pre>
                </div>

                <div className="mt-4">
                    <h3 className="text-lg font-normal pb-1 pt-2 font-Pretend">입력</h3>
                    <pre className="text-gray-300 pl-0 rounded-md mt-1 whitespace-pre-wrap font-Pretend">{decodeText(problem.description.input)}</pre>

                </div>
                <div className="mt-4">
                    <h3 className="text-lg font-normal pb-1 pt-2 font-Pretend">출력</h3>
                    <pre className="text-gray-300  rounded-md mt-1 whitespace-pre-wrap font-Pretend">{decodeText(problem.description.output)}</pre>
                </div>



                {/* 예제 케이스 */}
                <div className="pt-6">
                    <h2 className="text-xl font-normal pb-1 pt-3">예제 테스트 케이스</h2>
                    {problem.testCases.map((testCase, index) => (
                        <div key={testCase.id || index} className="mt-1 p-3 bg-black rounded-lg">
                            {testCase.input.trim() !== "" && (
                                <>
                                    <h3 className="text-sm text-gray-400">입력 {index + 1}</h3>
                                    <div className="relative">
                        <pre className="font-[Hack] bg-[#1E1E1E] text-gray-300 p-2 rounded-md pr-10">
                            {decodeText(testCase.input)}
                        </pre>
                                        <button
                                            onClick={() => handleCopy(decodeText(testCase.input), testCase.id || index)}
                                            className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                                        >
                                            {copiedId === (testCase.id || index) ? "복사완료!" : "복사하기"}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* 출력은 항상 렌더링 */}
                            <h3 className="text-sm text-gray-400 mt-2">출력 {index + 1}</h3>
                            <pre className="font-[Hack] bg-[#1E1E1E] text-gray-300 p-2 rounded-md">
                {decodeText(testCase.output)}
            </pre>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <h3 className="text-lg font-normal pb-2 pt-3">제한 사항</h3>
                    <p className="text-gray-300">메모리 제한: {problem?.limit?.memory ?? "정보 없음"}KB</p>
                    <p className="text-gray-300">시간 제한: {problem?.limit?.time ?? "정보 없음"}MS</p>
                </div>

                <p className="text-sm text-gray-400 pt-6">출처: {problem.source}</p>
                <p className="text-sm text-gray-400">작성자: {problem.authorName}</p>
            </div>

            {/* 리사이즈 핸들 */}
            <div
                className="w-[8px] min-h-[60px] bg-gray-400 hover:bg-gray-200 cursor-ew-resize rounded-md mx-[-4px] flex items-center justify-center self-center z-50 transition-all duration-150 ease-in-out"
                onMouseDown={startResizing}
            >
                {/* 점 3개 추가 (드래그 가능 강조) */}
                <div className="w-[3px] h-[20px] bg-gray-600 rounded-full"></div>
            </div>

            {/* 코드 에디터 */}
            <div className="flex-1 flex flex-col min-w-[300px] overflow-auto h-full max-h-full">
                <CodeEditor code={code} setCode={setCode} problemId={problem.problemId} testCases={problem.testCases} />

            </div>
        </div>
    );
};

export default ProblemDetail;
