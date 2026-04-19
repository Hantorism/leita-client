import type { ProblemTestCase } from './Problem';

export type JudgeLanguage = 'C' | 'CPP' | 'JAVA' | 'PYTHON' | 'JAVASCRIPT' | 'GO' | 'KOTLIN' | 'SWIFT';
export type JudgeResultType =
  | 'CORRECT'
  | 'WRONG'
  | 'COMPILE_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIME_OUT'
  | 'MEMORY_OUT'
  | 'UNKNOWN';

export interface SubmitRequest {
  code: string;
  language: JudgeLanguage;
}

export interface SubmitResponse {
  result: JudgeResultType;
  error: string;
}

export interface RunRequest {
  code: string;
  language: JudgeLanguage;
  testCases: ProblemTestCase[];
}

export interface RunResponse {
  result: JudgeResultType;
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
    name: string;
    email: string;
    profileImage?: string;
  };
  result: JudgeResultType;
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
