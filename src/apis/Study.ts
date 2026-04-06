import type { Study } from '@types';
import { AxiosInstance } from '@utils';

export const studyApi = {
  // GET /study
  getStudies: async (page = 0, size = 10) => {
    const response = await AxiosInstance.get(`/study`, { params: { page, size } });
    return response.data;
  },

  // POST /study
  createStudy: async (data: Partial<Study>) => {
    const response = await AxiosInstance.post(`/study`, data);
    return response.data;
  },

  // GET /study/{id}
  getStudy: async (id: number) => {
    const response = await AxiosInstance.get(`/study/${id}`);
    return response.data;
  },

  // PUT /study/{id}
  updateStudy: async (id: number, data: Partial<Study>) => {
    const response = await AxiosInstance.put(`/study/${id}`, data);
    return response.data;
  },

  // DELETE /study/{id}
  deleteStudy: async (id: number) => {
    const response = await AxiosInstance.delete(`/study/${id}`);
    return response.data;
  },

  // POST /study/{id}/join
  joinStudy: async (id: number) => {
    const response = await AxiosInstance.post(`/study/${id}/join`);
    return response.data;
  },

  // POST /study/{id}/approve
  approveMember: async (id: number, email: string) => {
    const response = await AxiosInstance.post(`/study/${id}/approve`, { email });
    return response.data;
  },

  // POST /study/{id}/deny
  denyMember: async (id: number, email: string) => {
    const response = await AxiosInstance.post(`/study/${id}/deny`, { email });
    return response.data;
  },

  // POST /study/{id}/leave
  leaveStudy: async (id: number) => {
    const response = await AxiosInstance.post(`/study/${id}/leave`);
    return response.data;
  },

  // GET /study/{id}/pendings
  getPendingMembers: async (id: number, page = 0, size = 10) => {
    const response = await AxiosInstance.get(`/study/${id}/pendings`, { params: { page, size } });
    return response.data;
  },

  // GET /study/{id}/members
  getMemberStatus: async (id: number, studySessionId?: number, memberId?: number) => {
    const response = await AxiosInstance.get(`/study/${id}/members`, {
      params: { studySessionId, memberId },
    });
    return response.data;
  },

  // GET /study/{id}/members/attendance
  getMemberAttendance: async (id: number, studySessionId?: number, memberId?: number) => {
    const response = await AxiosInstance.get(`/study/${id}/members/attendance`, {
      params: { studySessionId, memberId },
    });
    return response.data;
  },

  // GET /study/{id}/members/assignment
  getMemberAssignment: async (id: number, studySessionId?: number, memberId?: number) => {
    const response = await AxiosInstance.get(`/study/${id}/members/assignment`, {
      params: { studySessionId, memberId },
    });
    return response.data;
  },
};
