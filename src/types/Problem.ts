export interface ProblemDescription {
  problem: string;
  input: string;
  output: string;
}

export interface ProblemLimit {
  memory: number;
  time: number;
}

export interface ProblemSolved {
  successCount: number;
  totalCount: number;
  rate: number;
}

export interface ProblemTestCase {
  input: string;
  output: string;
  isShow: boolean;
}

export interface ProblemDetail {
  problemId: string;
  title: string;
  authorName: string;
  description: ProblemDescription;
  limit: ProblemLimit;
  testCases: ProblemTestCase[];
  source: string;
  solved: ProblemSolved;
  category: string[];
}

export interface ProblemsResponse {
  content: ProblemDetail[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
}

export interface CreateProblemRequest {
  title: string;
  description: ProblemDescription;
  limit: ProblemLimit;
  testCases: ProblemTestCase[];
  source: string;
  category: string[];
}

export interface CreateProblemResponse {
  problemId: string;
}

export interface DeleteProblemResponse {
  isDelete: boolean;
}
