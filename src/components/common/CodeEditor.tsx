import React, { useState, useRef, useEffect } from "react";
import MonacoEditor, { Monaco } from "@monaco-editor/react";
import { useNavigate } from 'react-router-dom';
import * as monacoEditor from 'monaco-editor';

import CustomDropdown from "./CustomDropdown";

const API_BASE_URL = process.env.REACT_APP_API_URL; // API 주소 설정

interface CodeEditorProps {
    code: string;
    setCode: (code: string) => void;
    problemId: string;
    testCases: { input: string; output: string }[];
}

const CodeEditor: React.FC<CodeEditorProps> = ({  problemId ,testCases: initialTestCases }) => {
    const [language, setLanguage] = useState("undefined");
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
    const navigate = useNavigate();
    const [editorInstance, setEditorInstance] = useState<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
    const [monacoInstance, setMonacoInstance] = useState<Monaco | null>(null);

    // 언어 변경 시 JavaScript 검증 설정 업데이트
    useEffect(() => {
        if (monacoInstance && language === "javascript") {
            monacoInstance.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: true,
                noSyntaxValidation: true
            });
        }
    }, [language, monacoInstance]);

    const [code, setCode] = useState(() => {
        const saved = localStorage.getItem(`code-${problemId}`);
        return saved || "";
    });


    useEffect(() => {
        localStorage.setItem(`code-${problemId}`, code);

    }, [code, problemId]);
    // useEffect(() => {
    //     const savedLang = localStorage.getItem("preferred-language");
    //     if (savedLang) {
    //         setLanguage(savedLang);
    //     }
    // }, []);
    //
    //

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


    const [editorHeight, setEditorHeight] = useState(400); // 에디터 높이 초기값
    const [isResizing, setIsResizing] = useState(false); // 리사이즈 상태 추적
    const editorRef = useRef(null); // MonacoEditor의 컨테이너 DOM 참조
    const startY = useRef(0);
    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);  // 언어 변경

        // Monaco 인스턴스가 있고 JavaScript를 선택했을 때 에러 검증 비활성화
        if (monacoInstance && newLanguage === "javascript") {
            monacoInstance.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: true,
                noSyntaxValidation: true
            });
        }
    };

    const encodeBase64 = (str: string): string => {
        const utf8Bytes = new TextEncoder().encode(str);
        const binary = Array.from(utf8Bytes)
            .map(byte => String.fromCharCode(byte))
            .join('');
        return btoa(binary);
    };


    //
    // const encodeBase64 = (str: string): string => {
    //     // TextEncoder로 UTF-8 문자열을 Uint8Array로 변환
    //     const encoder = new TextEncoder();
    //     const uint8Array = encoder.encode(str);
    //
    //     // Uint8Array를 base64로 변환
    //     const base64String = btoa(String.fromCharCode(...uint8Array));
    //     return base64String;
    // };

    const decodeBase64 = (base64: string): string => {
        // base64를 디코딩하여 Uint8Array로 변환
        const decodedString = atob(base64);
        const uint8Array = new Uint8Array(decodedString.length);

        for (let i = 0; i < decodedString.length; i++) {
            uint8Array[i] = decodedString.charCodeAt(i);
        }

        // Uint8Array를 문자열로 변환
        const decoder = new TextDecoder();
        return decoder.decode(uint8Array);
    };

    const handleSubmitCode = async () => {


        if (language === "undefined") {
            alert("🚨 언어를 선택해주세요!");
            return;
        }

        if (!token) {
            alert("로그인이 필요합니다.");
            setIsSubmitting(false);
            return;
        }
        setIsSubmitting(true);
        setResult(null);

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
                message: " 서버 요청 중 오류 발생",
                isSubmit: false,
                result: "",
                error: "서버 오류"
            });
        }

        setIsSubmitting(false);
    };

    const handleRunCode = async () => {

        if (language === "undefined") {
            alert("🚨언어를 선택해주세요!");
            return;
        }
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
            const combinedTestCases = [
                ...initialTestCases,
                ...testCases.slice(initialTestCases.length) // 사용자가 추가한 테스트 케이스
            ];

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
                    // testCases: testCases.map(({ input, output }) => ({
                    //     input: encodeBase64(input),
                    //     output: encodeBase64(output),
                    // })),
                    testCases: combinedTestCases.map(({ input, output }) => ({
                        input: input,
                        output: output,
                        // input: encodeBase64(input),
                        // output: encodeBase64(output),
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

    // // 리사이즈 시작
    // const startResizing = (e) => {
    //     e.preventDefault();
    //     // 시작 지점 기록
    //     // const startY = e.clientY;
    //     startY.current = e.clientY; // 마우스 클릭 위치 기록
    //     setIsResizing(true);
    //
    //     const onMouseMove = (moveEvent) => {
    //         const newHeight = editorHeight + (moveEvent.clientY - startY); // editorHeight는 처음 높이
    //         setEditorHeight(newHeight);
    //     };
    //
    //     const onMouseUp = () => {
    //         window.removeEventListener('mousemove', onMouseMove);
    //         window.removeEventListener('mouseup', onMouseUp);
    //     };
    //
    //     window.addEventListener('mousemove', onMouseMove);
    //     window.addEventListener('mouseup', onMouseUp);
    // };
    //
    //
    // // 리사이즈 중
    // const handleMouseMove = (e) => {
    //     if (isResizing && editorRef.current) {
    //         const deltaY = e.clientY - startY.current; // Y축 이동 거리 계산
    //         const newHeight = editorHeight + deltaY; // 새로운 높이 계산
    //         if (newHeight > 100 && newHeight < window.innerHeight - 200) { // 최소/최대 높이 제한
    //             setEditorHeight(newHeight);
    //             startY.current = e.clientY; // 이전 Y 좌표 업데이트
    //         }
    //     }
    // };
    //
    // // 리사이즈 종료
    // const stopResizing = () => {
    //     setIsResizing(false); // 리사이즈 상태 종료
    // };
    //
    // // 마우스 이벤트 처리
    // useEffect(() => {
    //     if (isResizing) {
    //         document.addEventListener("mousemove", handleMouseMove);
    //         document.addEventListener("mouseup", stopResizing);
    //     } else {
    //         document.removeEventListener("mousemove", handleMouseMove);
    //         document.removeEventListener("mouseup", stopResizing);
    //     }
    //
    //     return () => {
    //         document.removeEventListener("mousemove", handleMouseMove);
    //         document.removeEventListener("mouseup", stopResizing);
    //     };
    // }, [isResizing]);

    // MonacoEditor가 마운트 될 때 실행
    const handleEditorMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: Monaco) => {
        setEditorInstance(editor);
        setMonacoInstance(monaco);
        const container = editor.getContainerDomNode();
        editorRef.current = container;  // MonacoEditor의 컨테이너 DOM 요소를 ref에 저장

        // JavaScript 에러 검증 비활성화
        if (language === "javascript") {
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: true,
                noSyntaxValidation: true
            });
        }

        // container가 제대로 참조되는지 확인하기 위한 로그
        if (container) {
            console.log("Editor container:", container);
            console.log(container.getBoundingClientRect()); // getBoundingClientRect() 사용 가능
        }
    };

//     const [testCases, setTestCases] = useState([{ input: "", output: "" }]);
//     // const [selectedTestCase, setSelectedTestCase] = useState(0);
    const [testCases, setTestCases] = useState(initialTestCases);
// // 새로운 테스트 케이스 추가 함수
    const addTestCase = () => {
        setTestCases((prevTestCases) => {
            const newTestCases = [...prevTestCases, { input: "", output: "" }];
            return newTestCases;
        });

        setSelectedTestCase((prevIndex) => prevIndex + 1);
    };

    const handleTestCaseChange = (index: number, field: "input" | "output", value: string) => {
        setTestCases((prevTestCases) =>
            prevTestCases.map((testCase, i) =>
                i === index ? { ...testCase, [field]: value } : testCase
            )
        );
    };

    const handleRunSingleTestCase = async (index: number) => {
        if (language === "undefined") {
            alert("🚨 언어를 선택해주세요!");
            return;
        }

        setIsRunningCode(true);
        setResult(null);

        const token = localStorage.getItem("token");
        const testCase = testCases[index];

        try {
            const response = await fetch(`${API_BASE_URL}/judge/run/${problemId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    code: encodeBase64(code),
                    language: language.toUpperCase(),
                    testCases: [
                        { input: encodeBase64(testCase.input),
                            output: encodeBase64(testCase.output), }
                    ],
                }),
            });

            const resultData = await response.json();

            if (response.ok) {
                setResult({
                    message: resultData.message || "🛠 실행 완료!",
                    testCases: resultData.data.map((item: any) => ({
                        actualOutput: item.result,
                        error: item.error || null,
                    })),
                    isSubmit: false,
                });
            } else {
                setResult({
                    error: `❌ 실행 실패: ${resultData.message}`,
                    message: resultData.message || "실행 중 오류 발생",
                    isSubmit: false,
                });
            }
        } catch (error) {
            setResult({
                message: "서버 요청 중 오류 발생",
                isSubmit: false,
            });
        }

        setIsRunningCode(false);
    };





    return (
        <div className="flex-1 min-w-[300px] min-h-[80px] h-screen overflow-y-hidden  shadow-lg m-4 flex flex-col">
            {/* 상단 부분: 언어 선택, RUN, SUBMIT 버튼 */}
            <div className="flex justify-between items-center  rounded-lg">
                <div className="flex items-center space-x-4">
                    {/*<select*/}
                    {/*    value={language}*/}
                    {/*    onChange={handleLanguageChange}*/}
                    {/*    // className="custom-select"*/}
                    {/*    className="bg-[#3E3E3E] text-gray-300 p-2 rounded-md font-lexend text-[0.9rem]"*/}
                    {/*>*/}
                    {/*    <option value="python">Python</option>*/}
                    {/*    <option value="javascript">JavaScript</option>*/}
                    {/*    <option value="java">Java</option>*/}
                    {/*    <option value="cpp">C</option>*/}
                    {/*    <option value="cpp">C++</option>*/}
                    {/*    <option value="go">Go</option>*/}
                    {/*    <option value="kotlin">Kotlin</option>*/}
                    {/*    <option value="swift">Swift</option>*/}
                    {/*</select>*/}
                    <CustomDropdown language={language} handleLanguageChange={handleLanguageChange} />

                    {/*<div className="mt-4">*/}
                    {/*    <p>Selected Language: {language}</p>*/}
                    {/*</div>*/}


                    <button
                        type="button"
                        onClick={handleRunCode}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-[0.9rem] font-light text-white bg-[#3E3E3E] rounded-md transition-all duration-300 ease-in-out hover:scale-105 hover:text-[#CAFF33] hover:shadow-[0px_4px_15px_rgba(202,_255,_51,_0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isRunningCode}
                    >
                        {isRunningCode ? (
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
                                RUNNING
                            </>
                        ) : (
                            "RUN"
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmitCode}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-[0.9rem] font-light text-[#1A1A1A] bg-[#CAFF33] rounded-md transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gray-200 hover:text-gray-900 hover:shadow-[0px_4px_15px_rgba(202,_255,_51,_0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
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
                                Submitting
                            </>
                        ) : (
                            "SUBMIT"
                        )}
                    </button>
                </div>
            </div>

            {/* 리사이즈 핸들러 위와 아래로 나누기 */}
            <div className="flex flex-col h-full">
                {/* 에디터 */}
                <div
                    ref={editorRef}
                    className="flex-grow bg-[#282C34] rounded-lg border-2 border-gray-500 overflow-hidden shadow-lg mt-2 min-h-[300px]"
                    style={{ height: `${editorHeight}px` }}
                >
                    <MonacoEditor
                        width="100%"
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || "")}
                        options={{
                            fontSize: 15,
                            suggestOnTriggerCharacters: autoComplete,
                            lineNumbers: "on",
                            renderLineHighlight: "all",
                            // JavaScript 에러 표시 비활성화 설정
                            "javascript.validate.enable": language === "javascript" ? false : true,
                            // TypeScript 관련 검증도 함께 비활성화
                            "typescript.validate.enable": language === "javascript" ? false : true,
                            // 구문 검증 비활성화 (JavaScript의 경우)
                            "editor.semanticHighlighting.enabled": language === "javascript" ? false : true,
                        }}
                        onMount={handleEditorMount}
                    />
                </div>

                {/*<div className="mt-2 text-gray-300 text-sm">*/}
                {/*    Line: {cursorPosition.line}, Column: {cursorPosition.column}*/}
                {/*</div>*/}

                {/* 리사이즈 핸들러 */}
                {/*<div*/}
                {/*    className="w-full mt-2 h-[8px] bg-gray-400 hover:bg-gray-200 cursor-ns-resize flex items-center justify-center transition-all"*/}
                {/*    onMouseDown={startResizing}  // 리사이즈 시작*/}
                {/*>*/}
                {/*    <div className="w-[20px] h-[3px] bg-gray-600 rounded-full"></div>*/}
                {/*</div>*/}

                {/* 결과 및 테스트 케이스 */}
                <div className="mt-2 mb-8 bg-[#2A2A2A] text-white rounded-md min-h-[50px] min-w-0 max-h-[700px] overflow-y-auto space-y-2 p-6 pt-4 scrollbar-hide">
                    {/* 테스트 케이스 선택 바 */}
                    <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                        {testCases.map((_, index) => (
                            <div key={index} className="relative">
                                <button
                                    onClick={() => setSelectedTestCase(index)}
                                    className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                                        selectedTestCase === index
                                            ? "bg-gray-700 text-white"
                                            : "bg-gray-600 hover:bg-gray-500 text-gray-300"
                                    }`}
                                >
                                    TestCase {index + 1}
                                    {index >= initialTestCases.length && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // 부모 버튼 클릭 방지
                                                setTestCases((prevTestCases) =>
                                                    prevTestCases.filter((_, i) => i !== index)
                                                );
                                                setSelectedTestCase((prev) =>
                                                    prev === index ? 0 : Math.max(0, prev - 1)
                                                );
                                            }}
                                            className="text-red-400 hover:text-white text-xs ml-1"
                                        >
                                            x
                                        </button>
                                    )}
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={addTestCase}
                            className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-800 text-white"
                        >
                            +
                        </button>
                    </div>



                <div className="mt-3 p-2 rounded bg-black">
                    <div className="mt-1">

                        {selectedTestCase < initialTestCases.length ? (

                            <div>
                                <h4 className="text-xs text-gray-400">입력 {selectedTestCase + 1}</h4>
                            <pre className="font-[Hack] bg-[#1E1E1E] text-gray-300 p-2 rounded-md whitespace-pre-wrap">
                                {decodeText(testCases[selectedTestCase].input)}
                            </pre>
                            </div>
                        ) : (
                            <div>
                                <button
                                    onClick={() => handleRunSingleTestCase(selectedTestCase)}
                                    className=" font-lexend mt-1 mb-2 px-3 py-1 text-xs  border-2 border border-gray-800   rounded-md hover:bg-gray-500 text-white hover:text-white"
                                >
                                    My Testcase RUN
                                </button>
                                <h4 className="text-xs text-gray-400">입력 {selectedTestCase + 1}</h4>

                                <textarea
                                    className="font-[Hack] bg-[#1E1E1E] text-gray-300 p-2 rounded-md w-full min-h-[50px]"
                                    value={testCases[selectedTestCase].input}
                                    onChange={(e) => handleTestCaseChange(selectedTestCase, "input", e.target.value)}
                                />

                            </div>
                        )}
                    </div>


                    <div className="mt-1 mb-3">
                        <h4 className="text-xs text-gray-400 mt-2">기대 출력 {selectedTestCase + 1}</h4>
                        {selectedTestCase < initialTestCases.length ? (

                            <pre className="font-[Hack] bg-[#1E1E1E] text-gray-300 p-2 rounded-md whitespace-pre-wrap">
                {decodeText(testCases[selectedTestCase].output)}
            </pre>
                        ) : (
<div>
                            <textarea
                                className="font-[Hack] bg-[#1E1E1E] text-gray-300 p-2 rounded-md w-full min-h-[50px]"
                                value={testCases[selectedTestCase].output}
                                onChange={(e) => handleTestCaseChange(selectedTestCase, "output", e.target.value)}
                            />


</div>
                        )}
                    </div>
                {/*</div>*/}


                    {/*    <div className="mt-3 p-2 rounded bg-black">*/}
                {/*        <div className="mt-1">*/}
                {/*            <h4 className="text-xs text-gray-400 ">입력 {selectedTestCase + 1}</h4>*/}
                {/*            <pre className="font-D2Coding bg-[#1E1E1E] text-gray-300 p-2 rounded-md whitespace-pre-wrap">*/}
                {/*    {decodeText(testCases[selectedTestCase].input)}*/}
                {/*</pre>*/}
                {/*        </div>*/}

                {/*        <div className="mt-1 mb-3">*/}
                {/*            <h4 className="text-xs text-gray-400 mt-2">기대 출력 {selectedTestCase + 1}</h4>*/}
                {/*            <pre className="font-D2Coding bg-[#1E1E1E] text-gray-300 p-2 rounded-md whitespace-pre-wrap">*/}
                {/*    {decodeText(testCases[selectedTestCase].output)}*/}
                {/*</pre>*/}
                {/*        </div>*/}

                        {result?.result && (
                            <div className="mt-2 p-2 bg-[#2A2A2A] rounded-md">
                                <h4 className="text-xs text-gray-400"> Result</h4>
                                <pre className="text-gray-300 font-D2Coding whitespace-pre-wrap">
                        {result.result}
                    </pre>
                            </div>
                        )}

                    {result?.error?.trim() && (
                        <div className="mt-2 p-2 bg-[#3A1A1A] rounded-md">
                            <h4 className="text-xs text-red-400">❌ Error</h4>
                            <pre className="text-red-300 font-D2Coding whitespace-pre-wrap">
            {result.error}
        </pre>
                        </div>
                    )}




                    {/*run 결과 */}
                    {result?.testCases?.[selectedTestCase] && (
                        <>
                            <div className="mt-2 p-2 bg-[#2A2A2A] rounded-md">
                                <h4 className="text-xs text-gray-400">Result</h4>
                                <pre className="text-gray-300 font-D2Coding whitespace-pre-wrap">
                {result.testCases[selectedTestCase].actualOutput}
            </pre>
                            </div>
                        </>
                    )}

                    {Array.isArray(result?.testCases) &&
                        result.testCases[selectedTestCase]?.error?.trim() && (
                            <div className="mt-2 p-2 bg-[#3A1A1A] rounded-md">
                                <h4 className="text-xs text-red-400">❌ Error</h4>
                                <pre className="text-red-300 font-D2Coding whitespace-pre-wrap">
                {result.testCases[selectedTestCase].error}
            </pre>
                            </div>
                        )}


        {/*            {result?.testCases?.[0] && (*/}
        {/*                    <>*/}
        {/*                        <div className="mt-2 p-2 bg-[#2A2A2A] rounded-md">*/}
        {/*                            <h4 className="text-xs text-gray-400"> Result</h4>*/}
        {/*                            <pre className="text-gray-300 font-D2Coding whitespace-pre-wrap">*/}
        {/*                            {result.testCases[0].actualOutput} </pre>*/}
        {/*                        </div>*/}
        {/*                    </>*/}
        {/*                )}*/}
        {/*            {Array.isArray(result?.testCases) &&*/}
        {/*                result.testCases[0]?.error?.trim() &&*/}
        {/*                result.result !== "맞았습니다" && (*/}
        {/*                    <div className="mt-2 p-2 bg-[#3A1A1A] rounded-md">*/}
        {/*                        <h4 className="text-xs text-red-400">❌ Error</h4>*/}
        {/*                        <pre className="text-red-300 font-D2Coding whitespace-pre-wrap">*/}
        {/*    {result.testCases[0].error}*/}
        {/*</pre>*/}
        {/*                    </div>*/}
        {/*                )}*/}

                </div>
                </div>
            </div>

        </div>
    );

};

export default CodeEditor;