export interface LanguageResponse {
  id: number;
  name: string;
  code: string;
  extension: string;
}

export interface LanguageRequest {
  name: string;
  code: string;
  extension: string;
}
