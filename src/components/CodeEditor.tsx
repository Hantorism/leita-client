import { judgeApi, problemApi } from '@apis';
import { CustomDropdown } from '@components';
import { useAlert } from '@contexts';
import MonacoEditor, { type Monaco } from '@monaco-editor/react';
import { Logger } from '@utils';
import type * as monacoEditor from 'monaco-editor';
import { type MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TestResult {
  actualOutput: string;
  error?: string | null;
  isPassed?: boolean;
}

interface ResultState {
  message?: string;
  isSubmit: boolean;
  result?: string; // 제출 모드일 때의 단일 결과
  error?: string | null; // 제출 모드일 때의 단일 에러
  testCases?: TestResult[]; // 실행 모드일 때의 테스트 케이스 결과 배열
}

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  problemId: string;
  testCases: { input: string; output: string }[];
}

const CodeEditor = ({ problemId, testCases: initialTestCases }: CodeEditorProps) => {
  const { showAlert } = useAlert();
  // const [language, setLanguage] = useState("undefined");
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoComplete, setAutoComplete] = useState(true);
  const [result, setResult] = useState<ResultState | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ line: number; column: number }>({
    line: 1,
    column: 1,
  });
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [outputHeight, setOutputHeight] = useState(200);
  const token = localStorage.getItem('accessToken');
  const navigate = useNavigate();
  const [editorInstance, setEditorInstance] = useState<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const [monacoInstance, setMonacoInstance] = useState<Monaco | null>(null);
  const isDragging = useRef(false);
  const [leftWidth, setLeftWidth] = useState(600);
  const [isResizing, setIsResizing] = useState(false);
  const startY = useRef(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const resizeHandlerRef = useRef<HTMLDivElement>(null);
  const [isSubmitMode, setIsSubmitMode] = useState(false);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') || 'undefined';
  });

  // 언어 변경 시 JavaScript 검증 설정 업데이트
  useEffect(() => {
    if (monacoInstance && language === 'javascript') {
      (monacoInstance.languages as any).typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
      });
    }
  }, [language, monacoInstance]);

  const [code, setCode] = useState(() => {
    const saved = localStorage.getItem(`code-${problemId}`);
    return saved || '';
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

  const decodeText = (text: string) => {
    try {
      if (!text) return '';

      const urlDecoded = decodeURIComponent(text);
      if (urlDecoded !== text) return urlDecoded;

      try {
        const binary = atob(text);
        const bytes = new Uint8Array([...binary].map((ch) => ch.charCodeAt(0)));
        const decoded = new TextDecoder().decode(bytes);
        return decoded;
      } catch (e) {
        // 무시
      }

      const jsonParsed = JSON.parse(text);
      if (typeof jsonParsed === 'string') return jsonParsed;

      return text;
    } catch (error) {
      return text;
    }
  };

  const [editorHeight, setEditorHeight] = useState(600);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('selectedLanguage', newLanguage);

    if (monacoInstance && newLanguage === 'javascript') {
      (monacoInstance.languages as any).typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
      });
    }
  };

  const encodeBase64 = (str: string): string => {
    const utf8Bytes = new TextEncoder().encode(str);
    const binary = Array.from(utf8Bytes)
      .map((byte) => String.fromCharCode(byte))
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaY = e.clientY - startY.current;
      const newHeight = editorHeight + deltaY;

      if (newHeight >= 200 && newHeight <= window.innerHeight * 0.7) {
        setEditorHeight(newHeight);
        startY.current = e.clientY;
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, editorHeight]);

  const startResizing = (e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startY.current = e.clientY;
  };

  const handleSubmitCode = async () => {
    if (language === 'undefined') {
      showAlert('info', '언어를 선택해주세요!');
      return;
    }

    setIsSubmitting(true);
    setIsSubmitMode(true);
    setResult(null);

    try {
      const resultData = await judgeApi.submitCode(Number(problemId), {
        code: encodeBase64(code),
        language: language.toUpperCase(),
      });

      setResult({
        message: resultData.message || '✅ 제출 성공!',
        isSubmit: true,
        result: resultData.data?.result || resultData.result || '',
        error: resultData.data?.error || resultData.error || null,
      });
    } catch (error) {
      Logger.error('서버 요청 오류:', error);
      setResult({
        message: ' 서버 요청 중 오류 발생',
        isSubmit: false,
        result: '',
        error: '서버 오류',
      });
    }

    setIsSubmitting(false);
  };

  const handleRunCode = async () => {
    if (language === 'undefined') {
      showAlert('info', '언어를 선택해주세요!');
      return;
    }
    setIsRunningCode(true);
    setIsSubmitMode(false);
    setResult(null);

    try {
      const problemRes = await problemApi.getProblem(Number(problemId));
      const problemData = problemRes.data || problemRes;
      const testCases = problemData?.testCases || [];

      if (testCases.length === 0) {
        setResult({ message: '테스트 케이스가 없습니다.', isSubmit: false });
        setIsRunningCode(false);
        return;
      }

      const combinedTestCases = [...initialTestCases, ...testCases.slice(initialTestCases.length)];

      const resultData = await judgeApi.runCode(Number(problemId), {
        code: encodeBase64(code),
        language: language.toUpperCase(),
        testCases: combinedTestCases.map(({ input, output }) => ({
          input,
          output,
        })),
      });

      setResult({
        message: resultData.message || '🛠 실행 완료!',
        isSubmit: false,
        testCases:
          resultData.data?.map((testResult: any, index: number) => ({
            actualOutput: testResult.result || '',
            error: testResult.error || null,
            isPassed: testResult.result === combinedTestCases[index].output,
          })) || [],
      });
    } catch (error) {
      Logger.error('코드 실행 오류:', error);
      setResult({
        message: ' 실행 중 오류 발생',
        isSubmit: false,
        error: '서버 요청 실패',
      });
    }
    setIsRunningCode(false);
  };

  // MonacoEditor가 마운트 될 때 실행
  const handleEditorMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    setEditorInstance(editor);
    setMonacoInstance(monaco);
    const container = editor.getContainerDomNode();
    editorRef.current = container as HTMLDivElement; // MonacoEditor의 컨테이너 DOM 요소를 ref에 저장

    // JavaScript 에러 검증 비활성화
    if (language === 'javascript') {
      (monaco as any).languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
      });
    }

    // container가 제대로 참조되는지 확인하기 위한 로그
    if (container) {
      Logger.print('Editor container:', container);
      Logger.print(container.getBoundingClientRect()); // getBoundingClientRect() 사용 가능
    }
  };

  //     const [testCases, setTestCases] = useState([{ input: "", output: "" }]);
  //     // const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [testCases, setTestCases] = useState(initialTestCases);
  // // 새로운 테스트 케이스 추가 함수
  const addTestCase = () => {
    setTestCases((prevTestCases) => {
      const newTestCases = [...prevTestCases, { input: '', output: '' }];
      return newTestCases;
    });

    setSelectedTestCase((prevIndex) => prevIndex + 1);
  };

  const handleTestCaseChange = (index: number, field: 'input' | 'output', value: string) => {
    setTestCases((prevTestCases) =>
      prevTestCases.map((testCase, i) => (i === index ? { ...testCase, [field]: value } : testCase)),
    );
  };

  const handleRunSingleTestCase = async (index: number) => {
    if (language === 'undefined') {
      showAlert('info', '언어를 선택해주세요!');
      return;
    }

    setIsRunningCode(true);
    setResult(null);

    const testCase = testCases[index];

    try {
      const resultData = await judgeApi.runCode(Number(problemId), {
        code: encodeBase64(code),
        language: language.toUpperCase(),
        testCases: [
          {
            input: testCase.input,
            output: testCase.output,
          },
        ],
      });

      setResult({
        message: resultData.message || '🛠 실행 완료!',
        isSubmit: false,
        testCases:
          resultData.data?.map((item: any) => ({
            actualOutput: item.result || '',
            error: item.error || null,
            isPassed: item.status === 'CORRECT',
          })) || [],
      });
    } catch (error) {
      Logger.error('코드 실행 오류:', error);
      setResult({
        message: ' 실행 중 오류 발생',
        isSubmit: false,
        error: '서버 요청 실패',
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
          {/*    className="bg-[#3E3E3E] text-gray-300 p-2 rounded-md font-Pretendard text-[0.9rem]"*/}
          {/*>*!/}
					 {/*    <option value="python">Python</option>*/}
          {/*    <option value="javascript">JavaScript</option>*/}
          {/*    <option value="java">Java</option>*/}
          {/*    <option value="cpp">C</option>*/}
          {/*    <option value="cpp">C++</option>*/}
          {/*    <option value="go">Go</option>*/}
          {/*    <option value="kotlin">Kotlin</option>*/}
          {/*    <option value="swift">Swift</option>*/}
          {/*</select>*/}
          <CustomDropdown
            language={language}
            handleLanguageChange={handleLanguageChange}
          />

          {/*<div className="mt-4">*/}
          {/*    <p>Selected Language: {language}</p>*/}
          {/*</div>*/}

          <button
            type="button"
            onClick={handleRunCode}
            className="flex items-center justify-center gap-2 px-4 py-2 text-[0.9rem] font-light text-white bg-[#3E3E3E] rounded-md transition-all duration-300 ease-in-out hover:scale-105 hover:text-[#CAFE33] hover:shadow-[0px_4px_15px_rgba(202,_255,_51,_0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
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
              'RUN'
            )}
          </button>

          <button
            type="button"
            onClick={handleSubmitCode}
            className="flex items-center justify-center gap-2 px-4 py-2 text-[0.9rem] font-light text-[#1A1A1A] bg-[#CAFE33] rounded-md transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gray-200 hover:text-gray-900 hover:shadow-[0px_4px_15px_rgba(202,_255,_51,_0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
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
              'SUBMIT'
            )}
          </button>
        </div>
      </div>

      {/* 에디터와 리사이즈 핸들러 컨테이너 */}
      <div className="flex flex-col relative">
        {/* 에디터 */}
        <div
          ref={editorRef}
          className="flex-grow bg-[#282C34] rounded-lg border-2 border-gray-500 overflow-hidden shadow-lg mt-2 mb-4 min-h-[300px]"
          style={{ height: `${editorHeight}px` }}
        >
          <MonacoEditor
            width="100%"
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              fontFamily: 'JetBrain Mono',
              fontSize: 15,
              suggestOnTriggerCharacters: autoComplete,
              lineNumbers: 'on',
              renderLineHighlight: 'all',
            }}
            onMount={handleEditorMount}
          />
        </div>

        {/* 리사이즈 핸들러 */}
        <div
          ref={resizeHandlerRef}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[60px] h-[8px] bg-gray-400 hover:bg-gray-200 cursor-ns-resize rounded-md flex items-center justify-center z-50 transition-all duration-150 ease-in-out"
          onMouseDown={startResizing}
        >
          {/* 점 3개 추가 (드래그 가능 강조) */}
          <div className="w-[20px] h-[3px] bg-gray-600 rounded-full"></div>
        </div>
      </div>

      <div className="mt-2 bg-[#2A2A2A] text-white rounded-md min-h-[50px] min-w-0 max-h-[700px] overflow-y-auto space-y-2 p-6 pt-4 scrollbar-hide">
        {/* 테스트 케이스 선택 바 */}
        {isSubmitMode ? null : (
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {testCases.map((_, index) => (
              <div
                key={index}
                className="relative"
              >
                <button
                  onClick={() => setSelectedTestCase(index)}
                  className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                    selectedTestCase === index
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                  }`}
                >
                  TestCase {index + 1}
                  {index >= initialTestCases.length && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTestCases((prevTestCases) => prevTestCases.filter((_, i) => i !== index));
                        setSelectedTestCase((prev) => (prev === index ? 0 : Math.max(0, prev - 1)));
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
        )}

        {isSubmitMode ? (
          // ✅ Submit 모드일 때: 결과만 출력
          <>
            {result?.result && (
              <div className="mt-2 p-2 bg-black rounded-md">
                <h4 className="text-xs text-gray-400">Result</h4>
                <pre className="bg-[#1E1E1E] text-gray-300 p-2 rounded-md font-JetBrain whitespace-pre-wrap">
                  {result.result}
                </pre>
              </div>
            )}

            {result?.error?.trim() && (
              <div className="mt-2 p-2 bg-[#3A1A1A] rounded-md">
                <h4 className="text-xs text-red-400">❌ Error</h4>
                <pre className="text-red-300 font-JetBrain whitespace-pre-wrap">{result.error}</pre>
              </div>
            )}
          </>
        ) : (
          // 테스트 케이스 입력 모드
          <>
            <div className="mt-3 p-2 rounded bg-black">
              <div className="mt-1">
                {selectedTestCase < initialTestCases.length ? (
                  <div>
                    {testCases[selectedTestCase].input.trim() !== '' && (
                      <>
                        <h4 className="text-xs text-gray-400">입력 {selectedTestCase + 1}</h4>
                        <pre className="font-JetBrain bg-[#1E1E1E] text-gray-300 p-2 rounded-md whitespace-pre-wrap">
                          {decodeText(testCases[selectedTestCase].input)}
                        </pre>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => handleRunSingleTestCase(selectedTestCase)}
                      className="font-Pretendard mt-1 mb-2 px-3 py-1 text-xs border-2 border border-gray-800 rounded-md hover:bg-gray-500 text-white hover:text-white"
                    >
                      My Testcase RUN
                    </button>
                    <h4 className="text-xs text-gray-400">입력 {selectedTestCase + 1}</h4>

                    <textarea
                      className="font-JetBrain bg-[#1E1E1E] text-gray-300 p-2 rounded-md w-full min-h-[50px]"
                      // value={testCases[selectedTestCase].input}
                      value={testCases[selectedTestCase]?.input || ''}
                      onChange={(e) => handleTestCaseChange(selectedTestCase, 'input', e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="mt-1 mb-3">
                <h4 className="text-xs text-gray-400 mt-2">기대 출력 {selectedTestCase + 1}</h4>
                {selectedTestCase < initialTestCases.length ? (
                  <pre className="font-JetBrain bg-[#1E1E1E] text-gray-300 p-2 rounded-md whitespace-pre-wrap">
                    {decodeText(testCases[selectedTestCase].output)}
                  </pre>
                ) : (
                  <div>
                    <textarea
                      className="font-JetBrain bg-[#1E1E1E] text-gray-300 p-2 rounded-md w-full min-h-[50px]"
                      // value={testCases[selectedTestCase].output}
                      value={testCases[selectedTestCase]?.output || ''}
                      onChange={(e) => handleTestCaseChange(selectedTestCase, 'output', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 p-2 bg-black rounded-md">
              {result?.testCases && (
                <div className="mb-2 text-sm text-gray-400 font-NanumSquare font-semibold">
                  {result.testCases.length}개 테스트 케이스 중
                  <span className="font-bold mx-1 text-white">
                    {result.testCases.filter((tc) => tc.actualOutput === '맞았습니다').length}개
                  </span>
                  맞았습니다.
                </div>
              )}

              {result?.testCases?.map((testCase, index) => (
                <div key={index}>
                  <div
                    className={`mt-2 p-2 rounded-md ${testCase.actualOutput === '맞았습니다' ? 'bg-[#2A2A2A]' : 'bg-[#2A2A2A]'}`}
                  >
                    <h4 className="text-xs text-gray-400">Testcase {index + 1}</h4>
                    <pre
                      className={`font-JetBrain whitespace-pre-wrap ${testCase.actualOutput === '맞았습니다' ? 'text-[#CAFE33]' : 'text-white-400'}`}
                    >
                      {testCase.actualOutput}
                    </pre>
                  </div>

                  {testCase.error?.trim() && (
                    <div className="mt-2 p-2 bg-[#3A1A1A] rounded-md">
                      <h4 className="text-xs text-red-400">❌ Error : Testcase {index + 1}</h4>
                      <pre className="text-red-300 font-JetBrain whitespace-pre-wrap">{testCase.error}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/*        /!* 결과 및 테스트 케이스 *!/*/}
      {/*        <div className="mt-2 bg-[#2A2A2A] text-white rounded-md min-h-[50px] min-w-0 max-h-[700px] overflow-y-auto space-y-2 p-6 pt-4 scrollbar-hide">*/}
      {/*            /!* 테스트 케이스 선택 바 *!/*/}
      {/*            <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">*/}
      {/*                {testCases.map((_, index) => (*/}
      {/*                <div key={index} className="relative">*/}
      {/*                    <button*/}
      {/*                        onClick={() => setSelectedTestCase(index)}*/}
      {/*                        className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${*/}
      {/*                        selectedTestCase === index*/}
      {/*                            ? "bg-gray-700 text-white"*/}
      {/*                            : "bg-gray-600 hover:bg-gray-500 text-gray-300"*/}
      {/*                        }`}*/}
      {/*                    >*/}
      {/*                        TestCase {index + 1}*/}
      {/*                        {index >= initialTestCases.length && (*/}
      {/*                            <button*/}
      {/*                            onClick={(e) => {*/}
      {/*                                e.stopPropagation();*/}
      {/*                                setTestCases((prevTestCases) =>*/}
      {/*                                    prevTestCases.filter((_, i) => i !== index)*/}
      {/*                                );*/}
      {/*                                setSelectedTestCase((prev) =>*/}
      {/*                                    prev === index ? 0 : Math.max(0, prev - 1)*/}
      {/*                                );*/}
      {/*                            }}*/}
      {/*                            className="text-red-400 hover:text-white text-xs ml-1"*/}
      {/*                            >*/}
      {/*                                x*/}
      {/*                            </button>*/}
      {/*                        )}*/}
      {/*                    </button>*/}
      {/*                </div>*/}
      {/*                ))}*/}

      {/*                <button*/}
      {/*                onClick={addTestCase}*/}
      {/*                className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-800 text-white"*/}
      {/*                >*/}
      {/*                    +*/}
      {/*                </button>*/}
      {/*            </div>*/}

      {/*            <div className="mt-3 p-2 rounded bg-black">*/}
      {/*                <div className="mt-1">*/}
      {/*                    {selectedTestCase < initialTestCases.length ? (*/}
      {/*                    <div>*/}
      {/*                        {testCases[selectedTestCase].input.trim() !== "" && (*/}
      {/*                            <>*/}
      {/*                                <h4 className="text-xs text-gray-400">입력 {selectedTestCase + 1}</h4>*/}
      {/*                                <pre className="font-[Hack] bg-[#1E1E1E] text-gray-300 p-2 rounded-md whitespace-pre-wrap">*/}
      {/*                    {decodeText(testCases[selectedTestCase].input)}*/}
      {/*                </pre>*/}
      {/*                            </>*/}
      {/*                        )}*/}
      {/*                    </div>*/}
      {/*                    ) : (*/}
      {/*                    <div>*/}
      {/*                        <button*/}
      {/*                            onClick={() => handleRunSingleTestCase(selectedTestCase)}*/}
      {/*                            className=" font-Pretendard mt-1 mb-2 px-3 py-1 text-xs  border-2 border border-gray-800   rounded-md hover:bg-gray-500 text-white hover:text-white"*/}
      {/*                        >*/}
      {/*                            My Testcase RUN*/}
      {/*                        </button>*/}
      {/*                        <h4 className="text-xs text-gray-400">입력 {selectedTestCase + 1}</h4>*/}

      {/*                        <textarea*/}
      {/*                            className="font-[Hack] bg-[#1E1E1E] text-gray-300 p-2 rounded-md w-full min-h-[50px]"*/}
      {/*                            value={testCases[selectedTestCase].input}*/}
      {/*                            onChange={(e) => handleTestCaseChange(selectedTestCase, "input", e.target.value)}*/}
      {/*                        />*/}

      {/*                    </div>*/}
      {/*                    )}*/}
      {/*                </div>*/}

      {/*                <div className="mt-1 mb-3">*/}
      {/*                    <h4 className="text-xs text-gray-400 mt-2">기대 출력 {selectedTestCase + 1}</h4>*/}
      {/*                    {selectedTestCase < initialTestCases.length ? (*/}

      {/*                    <pre className="font-[Hack] bg-[#1E1E1E] text-gray-300 p-2 rounded-md whitespace-pre-wrap">*/}
      {/*        {decodeText(testCases[selectedTestCase].output)}*/}
      {/*</pre>*/}
      {/*                    ) : (*/}
      {/*                    <div>*/}
      {/*                    <textarea*/}
      {/*                        className="font-[Hack] bg-[#1E1E1E] text-gray-300 p-2 rounded-md w-full min-h-[50px]"*/}
      {/*                        value={testCases[selectedTestCase].output}*/}
      {/*                        onChange={(e) => handleTestCaseChange(selectedTestCase, "output", e.target.value)}*/}
      {/*                    />*/}

      {/*                </div>*/}
      {/*                )}*/}
      {/*            </div>*/}

      {/*/!*                {result?.result && (*!/*/}
      {/*/!*                <div className="mt-2 p-2 bg-[#2A2A2A] rounded-md">*!/*/}
      {/*/!*                    <h4 className="text-xs text-gray-400"> Result</h4>*!/*/}
      {/*/!*                    <pre className="text-gray-300 font-JetBrain whitespace-pre-wrap">*!/*/}
      {/*/!*                {result.result}*!/*/}
      {/*/!*            </pre>*!/*/}
      {/*/!*                </div>*!/*/}
      {/*/!*                )}*!/*/}

      {/*/!*                {result?.error?.trim() && (*!/*/}
      {/*/!*                <div className="mt-2 p-2 bg-[#3A1A1A] rounded-md">*!/*/}
      {/*/!*                    <h4 className="text-xs text-red-400">❌ Error</h4>*!/*/}
      {/*/!*                    <pre className="text-red-300 font-JetBrain whitespace-pre-wrap">*!/*/}
      {/*/!*    {result.error}*!/*/}
      {/*/!*</pre>*!/*/}
      {/*/!*                </div>*!/*/}
      {/*/!*                )}*!/*/}

      {/*                /!*run 결과 *!/*/}
      {/*                {result?.testCases?.[selectedTestCase] && (*/}
      {/*                <>*/}
      {/*                    <div className="mt-2 p-2 bg-[#2A2A2A] rounded-md">*/}
      {/*                        <h4 className="text-xs text-gray-400">Result</h4>*/}
      {/*                        <pre className="text-gray-300 font-JetBrain whitespace-pre-wrap">*/}
      {/*        {result.testCases[selectedTestCase].actualOutput}*/}
      {/*    </pre>*/}
      {/*                    </div>*/}
      {/*                </>
			 {/*                )}*/}

      {/*            {Array.isArray(result?.testCases) &&*/}
      {/*            result.testCases[selectedTestCase]?.error?.trim() && (*/}
      {/*                <div className="mt-2 p-2 bg-[#3A1A1A] rounded-md">*/}
      {/*                    <h4 className="text-xs text-red-400">❌ Error</h4>*/}
      {/*                    <pre className="text-red-300 font-JetBrain whitespace-pre-wrap">*/}
      {/*    {result.testCases[selectedTestCase].error}*/}
      {/*</pre>*/}
      {/*                </div>*/}
      {/*            )}*/}

      {/*        </div>*/}
      {/*    </div>*/}
    </div>
  );
};
export default CodeEditor;
