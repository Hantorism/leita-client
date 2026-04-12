export type SecurityRole = 'USER' | 'ADMIN';

export interface InfoResponse {
  email: string;
  name: string;
  role: SecurityRole;
}

export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
}

export interface OAuthRequest {
  accessToken: string;
}

// For backward compatibility
export type User = InfoResponse;
