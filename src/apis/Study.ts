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
  // GET  /study-session/{studyId}?page=0&size=10
  getStudySessions: async (studyId: number, page = 0, size = 10) => {
    const response = await AxiosInstance.get(`/study-session/${studyId}`, { params: { page, size } });
    return response.data;
  },

  // GET  /study-session/{studyId}/{sessionId}
  getStudySession: async (studyId: number, sessionId: number) => {
    const response = await AxiosInstance.get(`/study-session/${studyId}/${sessionId}`);
    return response.data;
  },

  // POST  /study-session/{studyId}   body: { startDateTime, endDateTime }
  createSession: async (studyId: number, data: { startDateTime: string; endDateTime: string }) => {
    const response = await AxiosInstance.post(`/study-session/${studyId}`, data);
    return response.data;
  },

  // PUT  /study-session/{studyId}/{sessionId}   body: { startDateTime, endDateTime }
  updateSession: async (studyId: number, sessionId: number, data: { startDateTime: string; endDateTime: string }) => {
    const response = await AxiosInstance.put(`/study-session/${studyId}/${sessionId}`, data);
    return response.data;
  },

  // DELETE  /study-session/{studyId}/{sessionId}
  deleteSession: async (studyId: number, sessionId: number) => {
    const response = await AxiosInstance.delete(`/study-session/${studyId}/${sessionId}`);
    return response.data;
  },

  // ── 출석 관련 ──────────────────────────────────────────────
  // GET  /study-session/{studyId}/{sessionId}/attendance
  getAttendance: async (studyId: number, sessionId: number) => {
    const response = await AxiosInstance.get(`/study-session/${studyId}/${sessionId}/attendance`);
    return response.data;
  },

  // POST  /study-session/{studyId}/{sessionId}/attendance/open
  //        body: { openTime?, closeTime?, lateThresholdMinutes? }
  startAttendanceCheck: async (
    studyId: number,
    sessionId: number,
    data: { openTime?: string; closeTime?: string; lateThresholdMinutes?: number }
  ) => {
    const response = await AxiosInstance.post(`/study-session/${studyId}/${sessionId}/attendance/open`, data);
    return response.data;
  },

  // POST  /study-session/{studyId}/{sessionId}/attendance/attend
  attend: async (studyId: number, sessionId: number) => {
    const response = await AxiosInstance.post(`/study-session/${studyId}/${sessionId}/attendance/attend`);
    return response.data;
  },

  // POST  /study-session/{studyId}/{sessionId}/attendance/close
  closeAttendance: async (studyId: number, sessionId: number) => {
    const response = await AxiosInstance.post(`/study-session/${studyId}/${sessionId}/attendance/close`);
    return response.data;
  },

  // ── 과제 관련 ──────────────────────────────────────────────
  // GET  /study-session/{studyId}/{sessionId}/assignment
  getAssignment: async (studyId: number, sessionId: number) => {
    const response = await AxiosInstance.get(`/study-session/${studyId}/${sessionId}/assignment`);
    return response.data;
  },

  // POST  /study-session/{studyId}/{sessionId}/assignment
  //        body: { title, description?, problemIds }
  createAssignment: async (
    studyId: number,
    sessionId: number,
    data: { title: string; description?: string; problemIds: number[] }
  ) => {
    const response = await AxiosInstance.post(`/study-session/${studyId}/${sessionId}/assignment`, data);
    return response.data;
  },

  // PUT  /study-session/{studyId}/{sessionId}/assignment
  updateAssignment: async (
    studyId: number,
    sessionId: number,
    data: { title?: string; description?: string; problemIds?: number[] }
  ) => {
    const response = await AxiosInstance.put(`/study-session/${studyId}/${sessionId}/assignment`, data);
    return response.data;
  },

  // GET  /study-session/{studyId}/{sessionId}/assignment/submissions
  getAssignmentSubmissions: async (studyId: number, sessionId: number) => {
    const response = await AxiosInstance.get(`/study-session/${studyId}/${sessionId}/assignment/submissions`);
    return response.data;
  },
};
