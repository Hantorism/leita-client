import React, { useState } from "react";
import MonacoEditor from "@monaco-editor/react";

interface CodeEditorProps {
    code: string;
    setCode: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode }) => {
    const [language, setLanguage] = useState("javascript"); // 기본 언어는 JavaScript
    const [isRunning, setIsRunning] = useState(false);
    const [autoComplete, setAutoComplete] = useState(true); // 자동완성 상태 관리

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value);
    };

    const handleRunCode = () => {
        setIsRunning(true);

        console.log("Executing code in", language);
        console.log(code);
        // API 호출
        setIsRunning(false);
    };

    // const toggleAutoComplete = () => {
    //     setAutoComplete((prev) => !prev);
    // };

    return (
        <div className="flex-1 min-w-[300px] min-h-[100px] bg-[#2A2A2A] p-6 rounded-lg shadow-lg m-4 flex flex-col">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-[#CAFF33]">코드 작성</h2>

                <div className="flex items-center space-x-4">
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        className="bg-[#3E3E3E] text-gray-300 p-2 rounded-md font-lexend text-[0.9rem]"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="java">Java</option>
                        <option value="python">Python</option>
                        <option value="cpp">C</option>
                        <option value="cpp">C++</option>
                        <option value="go">Go</option>
                        <option value="kotlin">Kotlin</option>
                        <option value="swift">Swift</option>
                    </select>

                    <button
                        onClick={handleRunCode}
                        className="font-lexend px-[15px] py-[5px] text-[0.9rem] font-light text-[#1A1A1A] bg-[#CAFF33] rounded-[80px] transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-[#CAFF33] hover:to-[#9D5CE9] hover:scale-[1.05] hover:text-white hover:shadow-[0px_4px_15px_rgba(202,_255,_51,_0.4)] text-left"
                        disabled={isRunning}
                    >
                        {isRunning ? "RUNNING" : "RUN"}
                    </button>

                    {/*<button*/}
                    {/*    onClick={toggleAutoComplete}*/}
                    {/*    className="font-lexend px-[15px] py-[5px] text-[0.9rem] font-light text-white bg-[#FF6347] rounded-[80px] transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-[#FF6347] hover:to-[#FF4500] hover:scale-[1.05] hover:text-white"*/}
                    {/*>*/}
                    {/*    {autoComplete ? "자동완성 비활성화" : "자동완성 활성화"}*/}
                    {/*</button>*/}
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
                    }}
                />
            </div>
        </div>
    );
};

export default CodeEditor;
