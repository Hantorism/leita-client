import React, { useState, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";

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
    const [customTestCases, setCustomTestCases] = useState<{ input: string; output: string }[]>([]);

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

    const navigate = useNavigate();
    const handleSubmitCode = async () => {
        setIsSubmitting(true);
        setResult(null);

        if (!token) {
            alert("로그인이 필요합니다.");
            setIsSubmitting(false);
            return;
        }

        try {
            const userInputTestCase = customTestCases.length > 0 ? customTestCases[customTestCases.length - 1] : null;

            if (userInputTestCase) {
                testCases.push({
                    input: userInputTestCase.input,
                    output: userInputTestCase.output, // expectedOutput → output 수정
                });
            }
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


                const userConfirmed = window.confirm("🏁제출이 완료되었습니다! 내가 푼 문제 페이지로 이동할까요?");
                if (userConfirmed) {
                    navigate("/judge");
                }
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





            <div className="mt-4 p-3 bg-[#1A1A1A] text-white rounded-md max-h-[400px] overflow-y-auto scrollbar-hide">
                {/*<h3 className="text-lg">테스트 케이스</h3>*/}


                {/* 테스트 케이스 선택 버튼 */}
                <div className="flex gap-2 mt-2">
                    {[...testCases, ...customTestCases].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedTestCase(index)}
                            className={`px-2 py-1 text-xs rounded ${
                                selectedTestCase === index
                                    ? "bg-gray-700 text-white"
                                    : "bg-gray-600 hover:bg-gray-500 text-gray-300"
                            }`}
                        >
                            {index < testCases.length ? `TestCase ${index + 1}` : `My TestCase ${index - testCases.length + 1}`}
                        </button>
                    ))}

                    {/* + 버튼 (사용자 정의 테스트 케이스 추가) */}
                    <button
                        onClick={() =>
                            setCustomTestCases([...customTestCases, { input: "", output: "" }])
                        }
                        className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-900 text-white"
                    >
                        +
                    </button>
                </div>


                {/* 선택된 테스트 케이스 표시 */}
                <div className="mt-3 p-2 rounded bg-black">
                    <div className="mt-1">
                        <h4 className="text-xs text-gray-400 ">입력 {selectedTestCase + 1}</h4>

                        {selectedTestCase < testCases.length ? (
                            // ✅ 기본 테스트 케이스: 기존처럼 출력
                            <pre className="font-D2Coding bg-[#1E1E1E] text-gray-300 p-2 rounded-md whitespace-pre-wrap">
                {testCases[selectedTestCase].input}
            </pre>
                        ) : (
                            // ✅ My TestCase: 직접 입력 가능하도록 변경
                            <textarea
                                className="font-D2Coding bg-[#1E1E1E] text-gray-300 p-2 rounded-md w-full h-12 resize-y"
                                value={customTestCases[selectedTestCase - testCases.length].input}
                                onChange={(e) => {
                                    const updatedCases = [...customTestCases];
                                    updatedCases[selectedTestCase - testCases.length].input = e.target.value;
                                    setCustomTestCases(updatedCases);
                                }}
                            />
                        )}
                    </div>

                    <div className="mt-1 mb-3">
                        <h4 className="text-xs text-gray-400 mt-2">기대 출력 {selectedTestCase + 1}</h4>

                        {selectedTestCase < testCases.length ? (

                            <pre className="font-D2Coding bg-[#1E1E1E] text-gray-300 p-2 rounded-md whitespace-pre-wrap">
                {testCases[selectedTestCase].output}
            </pre>
                        ) : (

                            <textarea
                                className="font-D2Coding bg-[#1E1E1E] text-gray-300 p-2 rounded-md w-full h-12 resize-y"
                                value={customTestCases[selectedTestCase - testCases.length].output}
                                onChange={(e) => {
                                    const updatedCases = [...customTestCases];
                                    updatedCases[selectedTestCase - testCases.length].output = e.target.value;
                                    setCustomTestCases(updatedCases);
                                }}
                            />
                        )}
                    </div>

                    {/* 실행 결과 표시 */}
                    {result?.message && (
                        <p className="mt-2 font-D2Coding text-gray-200">🚀 {result.message} !</p>
                    )}
                    {result?.testCases &&
                        result.testCases.map((testResult, index) => (
                            <div
                                // key={index}
                                // className={`mt-2 p-2 rounded-md ${
                                //     testResult.isPassed ? "bg-green-800" : "bg-red-800"
                                // }`}
                            >
                                <h4 className=" mt-2 text-xs text-gray-300 font-D2Coding"> result</h4>
                                <pre className="font-D2Coding bg-[#1E1E1E] text-gray-300 p-2 rounded-md whitespace-pre-wrap">
                                {testResult.actualOutput}
                            </pre>
                                {testResult.error && (
                                    <p className="text-red-400 text-xs mt-1">❌ 오류: {testResult.error}</p>
                                )}
                            </div>
                        ))}
                </div>

            </div>

        </div>
    );
};

export default CodeEditor;
