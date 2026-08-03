import type { SecurityRole } from './Auth';

export interface AffiliationResponse {
  id: number;
  name: string;
  emailDomain: string;
}

export interface AffiliationRequest {
  name: string;
  emailDomain: string;
}

export interface AdminUserResponse {
  id: number;
  name: string;
  email: string;
  role: SecurityRole;
  affiliationName: string;
  profileImage: string | null;
  department: string | null;
}
