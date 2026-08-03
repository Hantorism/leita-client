import { AxiosInstance } from '../utils/AxiosInstance';
import type { AdminUserResponse } from '@leita/types';

export interface GetAdminUsersParams {
  affiliationId?: number;
  page?: number;
  size?: number;
}

export interface PaginatedUserResponse {
  content: AdminUserResponse[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const adminUserApi = {
  getUsers: async (params?: GetAdminUsersParams): Promise<PaginatedUserResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.affiliationId !== undefined) searchParams.append('affiliationId', String(params.affiliationId));
    if (params?.page !== undefined) searchParams.append('page', String(params.page));
    if (params?.size !== undefined) searchParams.append('size', String(params.size));

    const queryString = searchParams.toString();
    const url = `/admin/users${queryString ? `?${queryString}` : ''}`;
    return AxiosInstance.get<PaginatedUserResponse>(url);
  },

  updateUserRole: async (id: number, role: 'USER' | 'ADMIN'): Promise<AdminUserResponse> => {
    return AxiosInstance.put<AdminUserResponse>(`/admin/users/${id}/role?role=${role}`);
  },

  deleteUser: async (id: number): Promise<void> => {
    return AxiosInstance.delete<void>(`/admin/users/${id}`);
  },
};
