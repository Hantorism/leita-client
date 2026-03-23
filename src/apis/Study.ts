import { AxiosInstance } from '@utils';
import { Study, StudyProgress } from '@/types';

export const studyApi = {
  // ── 스터디 관련 ──────────────────────────────────────────────
  // GET  /study?page=0&size=10
  getStudies: async (page = 0, size = 10) => {
    const response = await AxiosInstance.get(`/study`, { params: { page, size } });
    return response.data;
  },

  // GET  /study/{id}
  getStudyById: async (id: number) => {
    const response = await AxiosInstance.get(`/study/${id}`);
    return response.data;
  },

  // POST  /study   body: Partial<Study>
  createStudy: async (data: Partial<Study>) => {
    const response = await AxiosInstance.post(`/study`, data);
    return response.data;
  },

  // PUT  /study/{id}   body: Partial<Study>
  updateStudy: async (id: number, data: Partial<Study>) => {
    const response = await AxiosInstance.put(`/study/${id}`, data);
    return response.data;
  },

  // DELETE  /study/{id}
  deleteStudy: async (id: number) => {
    const response = await AxiosInstance.delete(`/study/${id}`);
    return response.data;
  },

  // POST  /study/{studyId}/join
  joinStudy: async (studyId: number) => {
    const response = await AxiosInstance.post(`/study/${studyId}/join`);
    return response.data;
  },

  // POST  /study/{studyId}/approve   body: { email }
  approveMember: async (studyId: number, email: string) => {
    const response = await AxiosInstance.post(`/study/${studyId}/approve`, { email });
    return response.data;
  },

  // POST  /study/{studyId}/deny   body: { email }
  denyMember: async (studyId: number, email: string) => {
    const response = await AxiosInstance.post(`/study/${studyId}/deny`, { email });
    return response.data;
  },

  // GET  /study/{studyId}/progress
  getStudyProgress: async (studyId: number): Promise<{ data: StudyProgress }> => {
    const response = await AxiosInstance.get(`/study/${studyId}/progress`);
    return response.data;
  },

  // ── 세션 관련 ──────────────────────────────────────────────
  // GET  /study-session?studyId={studyId}&page={page}&size={size}
  getStudySessions: async (studyId: number, page?: number, size?: number) => {
    const response = await AxiosInstance.get(`/study-session`, { params: { studyId, page, size } });
    return response.data;
  },

  // GET  /study-session/{studySessionId}
  getStudySession: async (studySessionId: number) => {
    const response = await AxiosInstance.get(`/study-session/${studySessionId}`);
    return response.data;
  },

  // POST  /study-session   body: { studyId, startDateTime, endDateTime }
  createSession: async (data: { studyId: number; startDateTime: string; endDateTime: string }) => {
    const response = await AxiosInstance.post(`/study-session`, data);
    return response.data;
  },

  // PUT  /study-session/{studySessionId}   body: { startDateTime, endDateTime }
  updateSession: async (studySessionId: number, data: { startDateTime: string; endDateTime: string }) => {
    const response = await AxiosInstance.put(`/study-session/${studySessionId}`, data);
    return response.data;
  },

  // DELETE  /study-session/{studySessionId}
  deleteSession: async (studySessionId: number) => {
    const response = await AxiosInstance.delete(`/study-session/${studySessionId}`);
    return response.data;
  },

  // ── 출석 관련 ──────────────────────────────────────────────
  // GET  /study-session/{studySessionId}/attendance
  getAttendance: async (studySessionId: number) => {
    const response = await AxiosInstance.get(`/study-session/${studySessionId}/attendance`);
    return response.data;
  },

  // POST  /study-session/{studySessionId}/attendance/open
  //        body: { openTime?, closeTime?, lateThresholdMinutes? }
  startAttendanceCheck: async (
    studySessionId: number,
    data: { openTime?: string; closeTime?: string; lateThresholdMinutes?: number }
  ) => {
    const response = await AxiosInstance.post(`/study-session/${studySessionId}/attendance/open`, data);
    return response.data;
  },

  // POST  /study-session/{studySessionId}/attendance/attend
  attend: async (studySessionId: number) => {
    const response = await AxiosInstance.post(`/study-session/${studySessionId}/attendance/attend`);
    return response.data;
  },

  // POST  /study-session/{studySessionId}/attendance/close
  closeAttendance: async (studySessionId: number) => {
    const response = await AxiosInstance.post(`/study-session/${studySessionId}/attendance/close`);
    return response.data;
  },

  // ── 과제 관련 ──────────────────────────────────────────────
  // GET  /study-session/{studySessionId}/assignment
  getAssignment: async (studySessionId: number) => {
    const response = await AxiosInstance.get(`/study-session/${studySessionId}/assignment`);
    return response.data;
  },

  // POST  /study-session/{studySessionId}/assignment
  //        body: { title, description?, problemIds }
  createAssignment: async (
    studySessionId: number,
    data: { title: string; description?: string; problemIds: number[] }
  ) => {
    const response = await AxiosInstance.post(`/study-session/${studySessionId}/assignment`, data);
    return response.data;
  },

  // PUT  /study-session/{studySessionId}/assignment
  updateAssignment: async (
    studySessionId: number,
    data: { title?: string; description?: string; problemIds?: number[] }
  ) => {
    const response = await AxiosInstance.put(`/study-session/${studySessionId}/assignment`, data);
    return response.data;
  },

  // GET  /study-session/{studySessionId}/assignment/submissions
  getAssignmentSubmissions: async (studySessionId: number) => {
    const response = await AxiosInstance.get(`/study-session/${studySessionId}/assignment/submissions`);
    return response.data;
  },
};

