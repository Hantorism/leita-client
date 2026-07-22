import type { ProblemTestCase } from './Problem';

export enum JudgeResult {
  PENDING = 'PENDING',
  CORRECT = 'CORRECT',
  WRONG = 'WRONG',
  COMPILE_ERROR = 'COMPILE_ERROR',
  RUNTIME_ERROR = 'RUNTIME_ERROR',
  TIME_OUT = 'TIME_OUT',
  MEMORY_OUT = 'MEMORY_OUT',
  UNKNOWN = 'UNKNOWN',
}

export const JudgeResultMessages: Record<JudgeResult, string> = {
  [JudgeResult.PENDING]: '채점 대기 중',
  [JudgeResult.CORRECT]: '맞았습니다',
  [JudgeResult.WRONG]: '틀렸습니다',
  [JudgeResult.COMPILE_ERROR]: '컴파일 에러',
  [JudgeResult.RUNTIME_ERROR]: '런타임 에러',
  [JudgeResult.TIME_OUT]: '시간 초과',
  [JudgeResult.MEMORY_OUT]: '메모리 초과',
  [JudgeResult.UNKNOWN]: '기타',
};

export type JudgeLanguage = 'C' | 'CPP' | 'JAVA' | 'PYTHON' | 'JAVASCRIPT' | 'GO' | 'KOTLIN' | 'SWIFT';

export interface SubmitRequest {
  code: string;
  language: JudgeLanguage;
}

export interface SubmitResponse {
  submitId: number;
  result: JudgeResult;
  error: string;
}

export interface RunRequest {
  code: string;
  language: JudgeLanguage;
  testCases: ProblemTestCase[];
}

export interface RunResponse {
  result: JudgeResult;
  error: string;
  output: string;
}

export interface ReviewRequest {
  submitId: number;
  description: string;
  commitMessage: string;
  repositoryName: string;
}

export interface JudgeData {
  id: number;
  problemId: string;
  problemTitle?: string;
  user: {
    id: number;
    name: string;
    email: string;
    profileImage?: string;
  };
  result: JudgeResult;
  used: {
    memory: number;
    time: number;
    language: string;
  };
  sizeOfCode: number;
  type: string;
  codeUrl?: string;
  createdAt?: string;
}

export interface JudgeDetailData extends JudgeData {
  codeUrl: string;
}
