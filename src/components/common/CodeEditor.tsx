import React from "react";
import MonacoEditor from "@monaco-editor/react";

interface CodeEditorProps {
    code: string;
    setCode: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode }) => {
    return (
        <div className="flex-1 min-w-[300px] bg-[#2A2A2A] p-6 rounded-lg shadow-lg m-4">
            <h2 className="text-xl font-semibold text-[#CAFF33]">코드 작성</h2>


            <div className="mt-3 bg-[#282C34] rounded-lg border-2 border-gray-500 overflow-hidden shadow-lg h-[80vh]">
                <div className="flex items-center px-4 py-2 bg-[#1E1E1E]">

                </div>

                <MonacoEditor
                    width="100%"
                    height="100%"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || "")}
                />
            </div>
        </div>
    );
};

export default CodeEditor;
