import React, { useState, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";

interface CodeEditorProps {
    code: string;
    setCode: (code: string) => void;
    problemId: string; // Add problemId as a prop
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, problemId }) => {
    const [language, setLanguage] = useState("Python");
    const [isRunning, setIsRunning] = useState(false);
    const [autoComplete, setAutoComplete] = useState(true);
    const [cursorPosition, setCursorPosition] = useState<{ line: number; column: number }>({
        line: 1,
        column: 1,
    });

    const editorRef = useRef<any>(null); // Reference to Monaco Editor

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value);
    };
    const token = localStorage.getItem("token");
    const handleSubmitCode = async () => {
        setIsRunning(true);

        console.log("Submitting code for", problemId);
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("🚨 No token found. Please log in first.");
            alert("로그인이 필요합니다.");
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

            const result = await response.json();

            if (response.ok) {
                console.log("Code submitted successfully:", result);
                if (result.data?.isSubmit) {
                    alert("제출이 완료되었습니다!");
                }
            } else {
                console.error("Submission failed:", result);
                alert(result.message || "제출에 실패했습니다.");
            }
        } catch (error) {
            console.error("Failed to submit code:", error);
            alert("서버 요청 중 오류가 발생했습니다.");
        }

        setIsRunning(false);
    };


    const handleRunCode = async () => {
        setIsRunning(true);

        console.log("Executing code in", language);
        console.log("Problem ID:", problemId);
        console.log("Code:", code);

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
                alert("테스트 케이스가 없습니다. 문제를 확인하세요.");
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
                    testCases
                }),
            });

            const result = await response.json();

            if (response.ok) {
                console.log("Code submitted successfully:", result);
            } else {
                console.error("Error executing code:", result);
            }
        } catch (error) {
            console.error("Failed to submit code:", error);
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
        </div>
    );
};

export default CodeEditor;
