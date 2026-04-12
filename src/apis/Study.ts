import type {
  Study,
  StudyCreateRequest,
  StudyCreateResponse,
  StudyUpdateRequest,
  StudyUser,
  StudyMemberStatus,
  StudyMemberAttendance,
  StudyMemberAssignment,
} from '@types';
import { AxiosInstance, type PagedResponse } from '@utils';

export const studyApi = {
  // GET /study
  getStudies: async (page = 0, size = 10) => {
    return AxiosInstance.get<PagedResponse<Study>>(`/study`, { params: { page, size } });
  },

  // POST /study
  createStudy: async (data: StudyCreateRequest) => {
    return AxiosInstance.post<StudyCreateResponse>(`/study`, data);
  },

  // GET /study/{id}
  getStudy: async (id: number) => {
    return AxiosInstance.get<Study>(`/study/${id}`);
  },

  // PUT /study/{id}
  updateStudy: async (id: number, data: StudyUpdateRequest) => {
    return AxiosInstance.put<Study>(`/study/${id}`, data);
  },

  // DELETE /study/{id}
  deleteStudy: async (id: number) => {
    return AxiosInstance.delete(`/study/${id}`);
  },

  // POST /study/{id}/join
  joinStudy: async (id: number) => {
    return AxiosInstance.post(`/study/${id}/join`);
  },

  // POST /study/{id}/approve
  approveMember: async (id: number, email: string) => {
    return AxiosInstance.post(`/study/${id}/approve`, { email });
  },

  // POST /study/{id}/deny
  denyMember: async (id: number, email: string) => {
    return AxiosInstance.post(`/study/${id}/deny`, { email });
  },

  // POST /study/{id}/leave
  leaveStudy: async (id: number) => {
    return AxiosInstance.post(`/study/${id}/leave`);
  },

  // GET /study/{id}/pendings
  getPendingMembers: async (id: number, page = 0, size = 10) => {
    return AxiosInstance.get<PagedResponse<StudyUser>>(`/study/${id}/pendings`, { params: { page, size } });
  },

  // GET /study/{id}/members
  getMemberStatus: async (id: number, studySessionId?: number, memberId?: number) => {
    return AxiosInstance.get<StudyMemberStatus[]>(`/study/${id}/members`, {
      params: { studySessionId, memberId },
    });
  },

  // GET /study/{id}/members/attendance
  getMemberAttendance: async (id: number, studySessionId?: number, memberId?: number) => {
    return AxiosInstance.get<StudyMemberAttendance[]>(`/study/${id}/members/attendance`, {
      params: { studySessionId, memberId },
    });
  },

  // GET /study/{id}/members/assignment
  getMemberAssignment: async (id: number, studySessionId?: number, memberId?: number) => {
    return AxiosInstance.get<StudyMemberAssignment[]>(`/study/${id}/members/assignment`, {
      params: { studySessionId, memberId },
    });
  },
};
