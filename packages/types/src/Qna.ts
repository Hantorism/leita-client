export interface QnaResponse {
  id: number;
  title: string;
  content: string;
  authorName: string;
  authorEmail: string;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QnaRequest {
  title: string;
  content: string;
}

export interface QnaReplyRequest {
  answer: string;
}

export interface QnaPageResponse {
  content: QnaResponse[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
}
