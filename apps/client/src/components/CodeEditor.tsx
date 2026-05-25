import { judgeApi, problemApi } from '@leita/api';
import { CustomDropdown, CommitModal } from '@components';
import { useAlert, useAuth } from '@contexts';
import MonacoEditor, { type Monaco } from '@monaco-editor/react';
import { JudgeResult, JudgeResultMessages } from '@leita/types';
import type { JudgeLanguage, JudgeData } from '@leita/types';
import { AuthStorage, DecodeBase64, Logger } from '@utils';
import type * as monacoEditor from 'monaco-editor';
import { type MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

interface TestResult {
  actualOutput: string;
  error?: string | null;
  isPassed?: boolean;
}

interface ResultState {
  message?: string;
  isSubmit: boolean;
  submitId?: number;
  result?: JudgeResult; // Use Enum type strictly
  error?: string | null;
  testCases?: TestResult[];
}

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  problemId: string;
  testCases: { input: string; output: string }[];
}

const CodeEditor = ({ problemId, testCases: initialTestCases }: CodeEditorProps) => {
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
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
    const saved = localStorage.getItem('selectedLanguage');
    if (saved && saved !== 'undefined') return saved;
    const user = AuthStorage.getUser();
    return user?.mainLanguage?.toLowerCase() || 'undefined';
  });
  const [isSaved, setIsSaved] = useState(false);

  // 언어 변경 시 JavaScript 검증 설정 업데이트
  useEffect(() => {
    if (monacoInstance && language === 'javascript') {
      const monaco = monacoInstance as any;
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
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
    const timer = setTimeout(() => {
      localStorage.setItem(`code-${problemId}`, code);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }, 500);
    return () => clearTimeout(timer);
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
      return DecodeBase64(text);
    } catch (error) {
      return text;
    }
  };

  const [editorHeight, setEditorHeight] = useState(600);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('selectedLanguage', newLanguage);

    if (monacoInstance && newLanguage === 'javascript') {
      const monaco = monacoInstance as any;
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
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
      const response = await judgeApi.submitCode(problemId, {
        code: encodeBase64(code),
        language: language.toUpperCase() as JudgeLanguage,
      });

      // 서버 응답이 문자열이든 객체이든 JudgeResult Enum 키값으로 변환
      const resultKey = (typeof response.result === 'object' ? (response.result as any).name : String(response.result)) as JudgeResult;

      setResult({
        message: '✅ 제출 성공!',
        isSubmit: true,
        submitId: response.submitId,
        result: resultKey,
        error: response.error || null,
      });
    } catch (error) {
      Logger.error('서버 요청 오류:', error);
      setResult({
        message: ' 서버 요청 중 오류 발생',
        isSubmit: false,
        error: '서버 오류',
      });
    }

    setIsSubmitting(false);
  };

  const handleOpenCommitModal = () => {
    if (!result?.submitId) {
      showAlert('error', '제출 ID를 찾을 수 없습니다. 다시 제출해주세요.');
      Logger.error('Missing submitId in result state:', result);
      return;
    }
    setIsCommitModalOpen(true);
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
      const result = await judgeApi.runCode(problemId, {
        code: encodeBase64(code),
        language: language.toUpperCase() as JudgeLanguage,
        testCases: testCases.map(({ input, output }) => ({
          input: input.startsWith('http') ? input : encodeBase64(input),
          output: output.startsWith('http') ? output : encodeBase64(output),
          isShow: true,
        })),
      });

      const resultData = result as any;
      setResult({
        message: resultData.message || '🛠 실행 완료!',
        isSubmit: false,
        testCases:
          resultData?.map((testResult: any) => ({
            actualOutput: testResult.output || '',
            error: testResult.error || null,
            isPassed: testResult.result === 'CORRECT',
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
      const m = monaco as any;
      m.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
      });
    }

    // container가 제대로 참조되는지 확인하기 위한 로그
  };

  //     const [testCases, setTestCases] = useState([{ input: "", output: "" }]);
  //     const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [testCases, setTestCases] = useState(() =>
    initialTestCases.map((tc) => ({
      ...tc,
      input: decodeText(tc.input),
      output: decodeText(tc.output),
    })),
  );

  useEffect(() => {
    setTestCases(
      initialTestCases.map((tc) => ({
        ...tc,
        input: decodeText(tc.input),
        output: decodeText(tc.output),
      })),
    );
  }, [initialTestCases]);

  // // 새로운 테스트 케이스 추가 함수
  const addTestCase = () => {
    setTestCases((prevTestCases) => {
      const newTestCases = [...prevTestCases, { input: '', output: '', isShow: true }];
      return newTestCases;
    });

    setSelectedTestCase(testCases.length);
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
      const result = await judgeApi.runCode(problemId, {
        code: encodeBase64(code),
        language: language.toUpperCase() as JudgeLanguage,
        testCases: [
          {
            input: testCase.input.startsWith('http') ? testCase.input : encodeBase64(testCase.input),
            output: testCase.output.startsWith('http') ? testCase.output : encodeBase64(testCase.output),
            isShow: true,
          },
        ],
      });

      const resultData = result as any;
      setResult({
        message: resultData.message || '🛠 실행 완료!',
        isSubmit: false,
        testCases:
          resultData?.map((item: any) => ({
            actualOutput: item.output || '',
            error: item.error || null,
            isPassed: item.result === 'CORRECT',
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
          <CustomDropdown
            language={language}
            handleLanguageChange={handleLanguageChange}
          />
          <div
            className={`transition-opacity duration-500 text-xs text-gray-400 flex items-center gap-1 ${isSaved ? 'opacity-100' : 'opacity-0'}`}
          >
            <span className="text-[#CAFE33]">✅</span> 임시 저장됨
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={handleRunCode}
            className="flex items-center justify-center gap-2 px-4 py-2 text-[0.9rem] font-light text-white bg-[#3E3E3E] rounded-md transition-all duration-300 ease-in-out hover:scale-105 hover:text-[var(--color-brand)] hover:shadow-[0px_4px_15px_rgba(202,_255,_51,_0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
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
                Running
              </>
            ) : (
              'Run'
            )}
          </button>

          <button
            type="button"
            onClick={handleSubmitCode}
            className="flex items-center justify-center gap-2 px-4 py-2 text-[0.9rem] font-light text-[var(--color-bg-main)] bg-[var(--color-brand)] rounded-md transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gray-200 hover:text-gray-900 hover:shadow-[0px_4px_15px_rgba(202,_255,_51,_0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
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
              'Submit'
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

      <div className="mt-2 bg-[var(--color-bg-surface)] text-white rounded-md min-h-[50px] min-w-0 max-h-[700px] overflow-y-auto space-y-2 p-6 pt-4 scrollbar-hide">
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
                  className={`px-2 py-1 text-sm rounded flex items-center gap-1 ${
                    selectedTestCase === index
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                  }`}
                >
                  TC {index + 1}
                  {index >= initialTestCases.length && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTestCases((prevTestCases) => prevTestCases.filter((_, i) => i !== index));
                        setSelectedTestCase((prev) => (prev === index ? 0 : Math.max(0, prev - 1)));
                      }}
                      className="text-red-400 hover:text-white text-sm ml-1"
                    >
                      x
                    </button>
                  )}
                </button>
              </div>
            ))}

            <button
              onClick={addTestCase}
              className="px-2 py-1 text-sm rounded bg-gray-600 hover:bg-gray-800 text-white"
            >
              +
            </button>
          </div>
        )}

        {isSubmitMode ? (
          // ✅ Submit 모드일 때: 결과만 출력
          <>
            {result?.result && (
              <div className="mt-2 p-2 bg-black rounded-md flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm text-gray-400">Result</h4>
                  {result.result === JudgeResult.CORRECT && user?.isGithubLinked && (
                    <button
                      onClick={handleOpenCommitModal}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#CAFE33]/10 border border-[#CAFE33]/20 hover:bg-[#CAFE33]/20 text-[#CAFE33] transition-all rounded-lg group text-xs font-bold"
                      type="button"
                    >
                      <Icon icon="mdi:github" className="w-4 h-4" />
                      <span>GitHub에 커밋</span>
                    </button>
                  )}
                </div>
                <pre className="bg-[#1E1E1E] text-gray-300 p-2 rounded-md font-JetBrain whitespace-pre-wrap">
                  {result.result ? (JudgeResultMessages[result.result] || result.result) : ''}
                </pre>
              </div>
            )}

            {result?.error?.trim() && (
              <div className="mt-2 p-2 bg-[#3A1A1A] rounded-md">
                <h4 className="text-sm text-red-400">❌ Error</h4>
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
                        <h4 className="text-sm text-gray-400">입력 {selectedTestCase + 1}</h4>
                        <pre className="font-JetBrain bg-[#1E1E1E] text-gray-300 p-2 rounded-md whitespace-pre-wrap">
                          {testCases[selectedTestCase].input}
                        </pre>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => handleRunSingleTestCase(selectedTestCase)}
                      className="font-Pretendard mt-1 mb-2 px-3 py-1 text-sm border-2 border border-gray-800 rounded-md hover:bg-gray-500 text-white hover:text-white"
                    >
                      My Testcase RUN
                    </button>
                    <h4 className="text-sm text-gray-400">입력 {selectedTestCase + 1}</h4>

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
                <h4 className="text-sm text-gray-400 mt-2">기대 출력 {selectedTestCase + 1}</h4>
                {selectedTestCase < initialTestCases.length ? (
                  <pre className="font-JetBrain bg-[#1E1E1E] text-gray-300 p-2 rounded-md whitespace-pre-wrap">
                    {testCases[selectedTestCase].output}
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
            {result?.testCases && (
              <div className="mt-2 p-2 bg-black rounded-md">
                <div className="mb-2 text-sm text-gray-400 font-Pretendard font-semibold">
                  {result.testCases.length}개 테스트 케이스 중
                  <span className="font-bold mx-1 text-white">
                    {result.testCases.filter((tc) => tc.isPassed).length}개
                  </span>
                  맞았습니다.
                </div>

                {result.testCases.map((testCase, index) => (
                  <div key={index}>
                    <div
                      className={`mt-2 p-2 rounded-md ${testCase.isPassed ? 'bg-[var(--color-bg-surface)]' : 'bg-[var(--color-bg-surface)]'}`}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm text-gray-400">Testcase {index + 1}</h4>
                        {testCase.isPassed ? (
                          <span className="text-[var(--color-brand)]">✅</span>
                        ) : (
                          <span className="text-red-500">❌</span>
                        )}
                      </div>
                      <pre
                        className={`font-JetBrain whitespace-pre-wrap ${testCase.isPassed ? 'text-[var(--color-brand)]' : 'text-red-500'}`}
                      >
                        {decodeText(testCase.actualOutput)}
                      </pre>
                    </div>

                    {testCase.error?.trim() && (
                      <div className="mt-2 p-2 bg-[#3A1A1A] rounded-md">
                        <h4 className="text-sm text-red-400">❌ Error : Testcase {index + 1}</h4>
                        <pre className="text-red-300 font-JetBrain whitespace-pre-wrap">{testCase.error}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/*        /!* 결과 및 테스트 케이스 *!/*/}
      {/*        <div className="mt-2 bg-[var(--color-bg-surface)] text-white rounded-md min-h-[50px] min-w-0 max-h-[700px] overflow-y-auto space-y-2 p-6 pt-4 scrollbar-hide">*/}
      {/*            /!* 테스트 케이스 선택 바 *!/*/}
      {/*            <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">*/}
      {/*                {testCases.map((_, index) => (*/}
      {/*                <div key={index} className="relative">*/}
      {/*                    <button*/}
      {/*                        onClick={() => setSelectedTestCase(index)}*/}
      {/*                        className={`px-2 py-1 text-sm rounded flex items-center gap-1 ${*/}
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
      {/*                            className="text-red-400 hover:text-white text-sm ml-1"*/}
      {/*                            >*/}
      {/*                                x*/}
      {/*                            </button>*/}
      {/*                        )}*/}
      {/*                    </button>*/}
      {/*                </div>*/}
      {/*                ))}*/}

      {/*                <button*/}
      {/*                onClick={addTestCase}*/}
      {/*                className="px-2 py-1 text-sm rounded bg-gray-600 hover:bg-gray-800 text-white"*/}
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
      {/*                                <h4 className="text-sm text-gray-400">입력 {selectedTestCase + 1}</h4>*/}
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
      {/*                            className=" font-Pretendard mt-1 mb-2 px-3 py-1 text-sm  border-2 border border-gray-800   rounded-md hover:bg-gray-500 text-white hover:text-white"*/}
      {/*                        >*/}
      {/*                            My Testcase RUN*/}
      {/*                        </button>*/}
      {/*                        <h4 className="text-sm text-gray-400">입력 {selectedTestCase + 1}</h4>*/}

      {/*                        <textarea*/}
      {/*                            className="font-[Hack] bg-[#1E1E1E] text-gray-300 p-2 rounded-md w-full min-h-[50px]"*/}
      {/*                            value={testCases[selectedTestCase].input}*/}
      {/*                            onChange={(e) => handleTestCaseChange(selectedTestCase, "input", e.target.value)}*/}
      {/*                        />*/}

      {/*                    </div>*/}
      {/*                    )}*/}
      {/*                </div>*/}

      {/*                <div className="mt-1 mb-3">*/}
      {/*                    <h4 className="text-sm text-gray-400 mt-2">기대 출력 {selectedTestCase + 1}</h4>*/}
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
      {/*/!*                <div className="mt-2 p-2 bg-[var(--color-bg-surface)] rounded-md">*!/*/}
      {/*/!*                    <h4 className="text-sm text-gray-400"> Result</h4>*!/*/}
      {/*/!*                    <pre className="text-gray-300 font-JetBrain whitespace-pre-wrap">*!/*/}
      {/*/!*                {result.result}*!/*/}
      {/*/!*            </pre>*!/*/}
      {/*/!*                </div>*!/*/}
      {/*/!*                )}*!/*/}

      {/*/!*                {result?.error?.trim() && (*!/*/}
      {/*/!*                <div className="mt-2 p-2 bg-[#3A1A1A] rounded-md">*!/*/}
      {/*/!*                    <h4 className="text-sm text-red-400">❌ Error</h4>*!/*/}
      {/*/!*                    <pre className="text-red-300 font-JetBrain whitespace-pre-wrap">*!/*/}
      {/*/!*    {result.error}*!/*/}
      {/*/!*</pre>*!/*/}
      {/*/!*                </div>*!/*/}
      {/*/!*                )}*!/*/}

      {/*                /!*run 결과 *!/*/}
      {/*                {result?.testCases?.[selectedTestCase] && (*/}
      {/*                <>*/}
      {/*                    <div className="mt-2 p-2 bg-[var(--color-bg-surface)] rounded-md">*/}
      {/*                        <h4 className="text-sm text-gray-400">Result</h4>*/}
      {/*                        <pre className="text-gray-300 font-JetBrain whitespace-pre-wrap">*/}
      {/*        {result.testCases[selectedTestCase].actualOutput}*/}
      {/*    </pre>*/}
      {/*                    </div>*/}
      {/*                </>
			 {/*                )}*/}

      {/*            {Array.isArray(result?.testCases) &&*/}
      {/*            result.testCases[selectedTestCase]?.error?.trim() && (*/}
      {/*                <div className="mt-2 p-2 bg-[#3A1A1A] rounded-md">*/}
      {/*                    <h4 className="text-sm text-red-400">❌ Error</h4>*/}
      {/*                    <pre className="text-red-300 font-JetBrain whitespace-pre-wrap">*/}
      {/*    {result.testCases[selectedTestCase].error}*/}
      {/*</pre>*/}
      {/*                </div>*/}
      {/*            )}*/}

      {/*        </div>*/}
      {/*    </div>*/}

      {isCommitModalOpen && result?.submitId && result.submitId > 0 && (
        <CommitModal
          isOpen={isCommitModalOpen}
          onClose={() => setIsCommitModalOpen(false)}
          judge={{
            id: result.submitId,
            problemId: problemId,
            result: JudgeResult.CORRECT,
            used: {
              language: language,
              memory: 0,
              time: 0,
            },
            user: {
              id: 1,
              name: user?.name || '',
              email: user?.email || '',
            },
            sizeOfCode: code.length,
            type: 'SUBMIT',
          }}
        />
      )}
    </div>
  );
};
export default CodeEditor;
