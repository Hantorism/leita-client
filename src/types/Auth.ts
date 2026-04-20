export type SecurityRole = 'USER' | 'ADMIN';

export interface InfoResponse {
  email: string;
  name: string;
  role: SecurityRole;
  profileImage: string | null;
  mainLanguage: string | null;
  department: string | null;
  isGithubLinked: boolean;
  githubUserName: string | null;
}

export interface JwtResponse {
  accessToken: string;
}

export interface UpdateInfoRequest {
  name: string | null;
  profileImage: string | null;
  mainLanguage: string | null;
  department: string | null;
}

export interface OAuthRequest {
  accessToken: string;
}

// For backward compatibility
export type User = InfoResponse;
