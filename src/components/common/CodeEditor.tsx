import React, { useState, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";

interface CodeEditorProps {
    code: string;
    setCode: (code: string) => void;
    problemId: string;
    testCases: { input: string; output: string }[];
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, problemId ,testCases }) => {
    const [language, setLanguage] = useState("Python");
    const [isRunning, setIsRunning] = useState(false);
    const [autoComplete, setAutoComplete] = useState(true);
    const [result, setResult] = useState<string | null>(null);
    const [cursorPosition, setCursorPosition] = useState<{ line: number; column: number }>({
        line: 1,
        column: 1,
    });
    const [selectedTestCase, setSelectedTestCase] = useState(0);

    const observer = new ResizeObserver(() => {});
    observer.observe(document.body);
    observer.disconnect();

    const editorRef = useRef<any>(null); // Reference to Monaco Editor

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value);
    };
    const token = localStorage.getItem("token");
    const handleSubmitCode = async () => {
        setIsRunning(true);
        setResult(null);

        if (!token) {
            alert("로그인이 필요합니다.");
            setIsRunning(false);
            return;
        }

        try {
            const response = await fetch(`https://dev-server.leita.dev/api/judge/submit/${problemId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    code,
                    language: language.toUpperCase(),
                }),
            });

            const resultData = await response.json();

            if (response.ok) {
                setResult({
                    message: resultData.message || "✅ 제출 성공!",
                    isSubmit: true
                });
            } else {
                setResult({
                    error: `❌ 제출 실패: ${resultData.message}`,
                    message: resultData.message,
                    isSubmit: true
                });
            }

        } catch (error) {
            setResult("서버 요청 중 오류 발생");
        }

        setIsRunning(false);
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setResult(null);

        try {
            const problemResponse = await fetch(`https://dev-server.leita.dev/api/problem/${problemId}`, {
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
                setIsRunning(false);
                return;
            }

            const response = await fetch(`https://dev-server.leita.dev/api/judge/run/${problemId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    code,
                    language: language.toUpperCase(),
                    testCases,
                }),
            });

            const resultData = await response.json();

            if (response.ok) {
                setResult({
                    testCases: resultData.testCases || [],
                    message: resultData.message || "🛠 실행 완료!",
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

        setIsRunning(false);
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
                        onClick={handleRunCode}
                        className="font-lexend px-[15px] py-[5px] text-[0.9rem] font-light text-[#1A1A1A] bg-[#CAFF33] rounded-md transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:scale-[1.05] hover:bg-gray-200 hover:text-gray-900 hover:shadow-[0px_4px_15px_rgba(202,_255,_51,_0.4)] text-left"
                        disabled={isRunning}
                    >
                        {isRunning ? "RUNNING" : "RUN"}
                    </button>
                    <button
                        onClick={handleSubmitCode}
                        className="font-lexend px-[15px] py-[5px] text-[0.9rem] font-light text-white bg-[#3E3E3E] rounded-md transition-all duration-300 ease-in-out hover:bg-gradient-to-r  hover:scale-[1.05] hover:text-[#CAFF33] hover:shadow-[0px_4px_15px_rgba(202,_255,_51,_0.4)] text-left"
                        disabled={isRunning}
                    >
                        Submit
                    </button>
                </div>
            </div>

            <div className="mt-3 bg-[#282C34] rounded-lg border-2 border-gray-500 overflow-hidden shadow-lg flex-grow">
                <MonacoEditor
                    width="100%"
                    height="100%"
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


            <div className="mt-4 p-3 bg-[#1A1A1A] text-white rounded-md">
                <h3 className="text-lg">테스트 케이스</h3>

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

                    <div className="mt-3">
                        <h4 className="text-xs text-gray-400 mt-1">입력 {selectedTestCase + 1}</h4>
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

                    {result?.testCases?.[selectedTestCase] && (
                        <>
                            <p>
                                <span className="text-red-400 font-D2Coding">실제 출력:</span>{" "}
                                {result.testCases[selectedTestCase].actualOutput}
                            </p>
                            <p>
                            <span className="font-semibold">
                                {result.testCases[selectedTestCase].actualOutput === testCases[selectedTestCase].output
                                    ? "✅ 통과"
                                    : "❌ 실패"}
                            </span>
                            </p>
                        </>
                    )}

                    {result?.message && (
                        <p className="mt-2 text-white">
                            {result.isSubmit ? `🚀  ${result.message}` : `🛠  ${result.message || "실행 완료!"}`}
                        </p>
                    )}
                </div>
            </div>

        </div>
    );
};

export default CodeEditor;
