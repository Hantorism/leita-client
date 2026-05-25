export interface NoticeResponse {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeRequest {
  title: string;
  content: string;
}

export interface NoticePageResponse {
  content: NoticeResponse[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
}
