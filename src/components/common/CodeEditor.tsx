import React, { useState, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";

const API_BASE_URL = process.env.REACT_APP_API_URL; // API 주소 설정

interface CodeEditorProps {
    code: string;
    setCode: (code: string) => void;
    problemId: string;
    testCases: { input: string; output: string }[];
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, problemId ,testCases }) => {
    const [language, setLanguage] = useState("Python");
    const [isRunningCode, setIsRunningCode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [autoComplete, setAutoComplete] = useState(true);
    const [result, setResult] = useState<string | null>(null);
    const [cursorPosition, setCursorPosition] = useState<{ line: number; column: number }>({
        line: 1,
        column: 1,
    });
    const [selectedTestCase, setSelectedTestCase] = useState(0);
    const [outputHeight, setOutputHeight] = useState(200);
    const token = localStorage.getItem("token");

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(event.target.value);
    };
    // const handleEditorMount = (editor: any) => {
    //     editorRef.current = editor;
    //     editor.onDidChangeCursorPosition((e: any) => {
    //         setCursorPosition({ line: e.position.lineNumber, column: e.position.column });
    //     });
    // };

// const outputHeightRef = useRef(outputHeight); // outputHeight를 useRef로 관리
//
//     const startResizing = (e: React.MouseEvent) => {
//         e.preventDefault();
//         const startY = e.clientY;
//         const startHeight = outputHeight;
//
//         const onMouseMove = (e: MouseEvent) => {
//             const newHeight = Math.max(100, startHeight + (e.clientY - startY));
//             setOutputHeight(newHeight);
//         };
//
//         const onMouseUp = () => {
//             window.removeEventListener("mousemove", onMouseMove);
//             window.removeEventListener("mouseup", onMouseUp);
//         };
//
//         window.addEventListener("mousemove", onMouseMove);
//         window.addEventListener("mouseup", onMouseUp);
//     };

    // const observer = new ResizeObserver(() => {});
    // observer.observe(document.body);
    // observer.disconnect();

    const editorRef = useRef<any>(null);
    const encodeBase64 = (str: string) => btoa(unescape(encodeURIComponent(str)));


    const handleSubmitCode = async () => {
        setIsSubmitting(true);
        setResult(null);

        if (!token) {
            alert("로그인이 필요합니다.");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/judge/submit/${problemId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    code: encodeBase64(code),
                    language: language.toUpperCase(),
                }),
            });

            const resultData = await response.json();

            if (response.ok) {
                setResult({
                    message: resultData.message || "✅ 제출 성공!",
                    isSubmit: true,
                    result: resultData.data?.result || "",
                    error: resultData.data?.error || null
                });
            } else {
                setResult({
                    message: `❌ 제출 실패: ${resultData.message}`,
                    isSubmit: false,
                    result: "",
                    error: resultData.data?.error || "알 수 없는 오류 발생"
                });
            }
        } catch (error) {
            console.error("서버 요청 오류:", error);
            setResult({
                message: "🚨 서버 요청 중 오류 발생",
                isSubmit: false,
                result: "",
                error: "서버 오류"
            });
        }

        setIsSubmitting(false);
    };



    const handleRunCode = async () => {
        setIsRunningCode(true);
        setResult(null);
        const token = localStorage.getItem("token");

        try {
            const problemResponse = await fetch(`${API_BASE_URL}/problem/${problemId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!problemResponse.ok) {
                throw new Error("문제 정보를 가져오는 데 실패했습니다.");
            }

            const problemData = await problemResponse.json();
            const testCases = problemData?.data?.testCases || [];

            if (testCases.length === 0) {
                setResult({ message: "테스트 케이스가 없습니다.", isSubmit: false });
                setIsRunningCode(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/judge/run/${problemId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    code: encodeBase64(code),
                    language: language.toUpperCase(),
                    testCases: testCases.map(({ input, output }) => ({
                        input: encodeBase64(input),
                        output: encodeBase64(output),
                    })),
                }),
            });

            const resultData = await response.json();


            if (response.ok) {
                setResult({
                    message: resultData.message || "🛠 실행 완료!",
                    testCases: resultData.data.map((testResult: { result: string; error?: string }, index: number) => ({
                        actualOutput: testResult.result,
                        error: testResult.error || null,
                        isPassed: testResult.result === testCases[index].output
                    })),
                    isSubmit: false
                });
            } else {
                setResult({
                    error: `❌ 실행 실패: ${resultData.message}`,
                    message: resultData.message || "실행 중 오류 발생",
                    isSubmit: false
                });
            }


        } catch (error) {
            setResult({
                message: "서버 요청 중 오류 발생",
                isSubmit: false
            });
        }

        setIsRunningCode(false);
    };



    const handleEditorMount = (editor: any) => {
        editorRef.current = editor;
        editor.onDidChangeCursorPosition((e: any) => {
            setCursorPosition({ line: e.position.lineNumber, column: e.position.column });
        });
    };

    return (

        <div className="flex-1 min-w-[300px] min-h-[100px] bg-[#2A2A2A] p-6 rounded-lg shadow-lg m-4 flex flex-col">
            <div className="flex justify-between items-center">
                {/*<h2 className="text-xl font-semibold text-[#CAFF33]">코드 작성</h2>*/}

                <div className="flex items-center space-x-4">
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        className="bg-[#3E3E3E]  text-gray-300 p-2 rounded-md font-lexend text-[0.9rem]"
                    >
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="java">Java</option>
                        <option value="cpp">C</option>
                        <option value="cpp">C++</option>
                        <option value="go">Go</option>
                        <option value="kotlin">Kotlin</option>
                        <option value="swift">Swift</option>
                    </select>

                    <button
                        type="button"
                        onClick={handleRunCode}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-[0.9rem] font-light text-[#1A1A1A] bg-[#CAFF33] rounded-md transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gray-200 hover:text-gray-900 hover:shadow-[0px_4px_15px_rgba(202,_255,_51,_0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isRunningCode}
                    >
                        {isRunningCode ? (
                            <>
                                <svg
                                    className="size-5 animate-spin text-gray-800"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                </svg>
                                RUNNING
                            </>
                        ) : (
                            "RUN"
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmitCode}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-[0.9rem] font-light text-white bg-[#3E3E3E] rounded-md transition-all duration-300 ease-in-out hover:scale-105 hover:text-[#CAFF33] hover:shadow-[0px_4px_15px_rgba(202,_255,_51,_0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <svg
                                    className="size-5 animate-spin text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                </svg>
                                Submitting
                            </>
                        ) : (
                            "Submit"
                        )}
                    </button>

                </div>
            </div>

            <div className="mt-3 bg-[#282C34] rounded-lg border-2 border-gray-500 overflow-hidden shadow-lg flex-grow">
                <MonacoEditor
                    width="100%"
                    height="calc(90vh - 300px)"
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    options={{
                        fontSize: 16,
                        suggestOnTriggerCharacters: autoComplete,
                        lineNumbers: "on",
                        renderLineHighlight: "all",
                    }}
                    onMount={handleEditorMount}
                />
            </div>



            <div className="mt-2 text-gray-300 text-sm">
                Line: {cursorPosition.line}, Column: {cursorPosition.column}
            </div>

            {/*/!* 리사이즈 핸들 *!/*/}
            {/*<div*/}
            {/*    className="w-full h-[8px] bg-gray-400 hover:bg-gray-200 cursor-ns-resize flex items-center justify-center transition-all"*/}
            {/*    onMouseDown={startResizing}*/}
            {/*>*/}
            {/*    <div className="w-[20px] h-[3px] bg-gray-600 rounded-full"></div>*/}
            {/*</div>*/}



            <div className="mt-4 p-3 bg-[#1A1A1A] text-white rounded-md max-h-[400px] overflow-y-auto scrollbar-hide">
                {/*<h3 className="text-lg">테스트 케이스</h3>*/}

                {/* 테스트 케이스 선택 버튼 */}
                <div className="flex gap-2 mt-2">
                    {testCases.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedTestCase(index)}
                            className={`px-2 py-1 text-xs rounded ${
                                selectedTestCase === index
                                    ? "bg-gray-700 text-white"
                                    : "bg-gray-600 hover:bg-gray-500 text-gray-300"
                            }`}
                        >
                            TestCase {index + 1}
                        </button>
                    ))}
                </div>

                {/* 선택된 테스트 케이스만 표시 */}
                <div className="mt-3 p-2 rounded bg-black">
                    {/*<p>*/}
                    {/*<span className="bg-gray-700 hover:bg-gray-600 p-1 text-xs rounded">*/}
                    {/*    TestCase {selectedTestCase + 1}*/}
                    {/*</span>*/}
                    {/*</p>*/}

                    <div className="mt-1">
                        <h4 className="text-xs text-gray-400 ">입력 {selectedTestCase + 1}</h4>
                        <pre className="font-D2Coding bg-[#1E1E1E] text-gray-300 p-2 rounded-md whitespace-pre-wrap">
                        {testCases[selectedTestCase].input}
                    </pre>
                    </div>

                    <div className="mt-1 mb-3">
                        <h4 className="text-xs text-gray-400 mt-2">기대 출력 {selectedTestCase + 1}</h4>
                        <pre className="font-D2Coding bg-[#1E1E1E] text-gray-300 p-2 rounded-md whitespace-pre-wrap">
                        {testCases[selectedTestCase].output}
                    </pre>
                    </div>
                    {result?.message && result.isSubmit && (
                        <p className="mt-2  font-D2Coding text-gray-200">🚀 {result.message} !</p>
                    )}
                    {result?.result && (
                        <div className="mt-2 p-2 bg-[#2A2A2A] rounded-md">
                            <h4 className="text-xs text-gray-400">🔹 결과</h4>
                            <pre className="text-gray-300 font-D2Coding whitespace-pre-wrap">
                {result.result}
            </pre>
                        </div>
                    )}


                    {result?.error && (
                        <div className="mt-2 p-2 bg-[#3A1A1A] rounded-md">
                            <h4 className="text-xs text-red-400">❌ 오류 메시지</h4>
                            <pre className="text-red-300 font-D2Coding whitespace-pre-wrap">
                {result.error}
            </pre>
                        </div>
                    )}
                    {result?.testCases?.[selectedTestCase] && (
                        <>
                            <p className="font-D2Coding text-gray-200">
                                <span className="font-D2Coding text-gray-200">결과 :</span>{" "}
                                {result.testCases[selectedTestCase].actualOutput} !
                            </p>
                            <p>
                                {/*<span className="font-semibold">*/}
                                {/*    {result.testCases[selectedTestCase].actualOutput === testCases[selectedTestCase].output*/}
                                {/*        ? "✅ 통과"*/}
                                {/*        : "❌ 실패"}*/}
                                {/*</span>*/}
                            </p>
                        </>
                    )}


                </div>
            </div>

        </div>
    );
};

export default CodeEditor;
