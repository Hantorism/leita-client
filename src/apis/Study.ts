import { instance as AxiosInstance } from '@utils';
import {
  Study,
  StudySession,
  AttendanceCheck,
  Assignment,
  StudyProgress
} from '@/types';

export const studyApi = {
  // 스터디 관련
  getStudies: async (page = 0, size = 10) => {
    const response = await AxiosInstance.get(`/study`, { params: { page, size } });
    return response.data;
  },

  getStudyById: async (id: number) => {
    const response = await AxiosInstance.get(`/study/${id}`);
    return response.data;
  },

  createStudy: async (data: Partial<Study>) => {
    const response = await AxiosInstance.post(`/study`, data);
    return response.data;
  },

  joinStudy: async (studyId: number) => {
    const response = await AxiosInstance.post(`/study/${studyId}/join`);
    return response.data;
  },

  approveMember: async (studyId: number, email: string) => {
    const response = await AxiosInstance.post(`/study/${studyId}/approve`, { email });
    return response.data;
  },

  denyMember: async (studyId: number, email: string) => {
    const response = await AxiosInstance.post(`/study/${studyId}/deny`, { email });
    return response.data;
  },

  getStudyProgress: async (studyId: number): Promise<{ data: StudyProgress }> => {
    const response = await AxiosInstance.get(`/study/${studyId}/progress`);
    return response.data;
  },

  // 세션 관련
  getStudySessions: async (studyId: number) => {
    const response = await AxiosInstance.get(`/study/${studyId}/sessions`);
    return response.data;
  },

  createSession: async (studyId: number, data: Partial<StudySession>) => {
    const response = await AxiosInstance.post(`/study/${studyId}/sessions`, data);
    return response.data;
  },

  // 출석 관련
  startAttendanceCheck: async (studyId: number, sessionId: number, data: Partial<AttendanceCheck>) => {
    const response = await AxiosInstance.post(`/study/${studyId}/sessions/${sessionId}/attendance`, data);
    return response.data;
  },

  attend: async (studyId: number, sessionId: number) => {
    const response = await AxiosInstance.post(`/study/${studyId}/sessions/${sessionId}/attendance/attend`);
    return response.data;
  },

  // 과제 관련
  createAssignment: async (studyId: number, sessionId: number, data: Partial<Assignment>) => {
    const response = await AxiosInstance.post(`/study/${studyId}/sessions/${sessionId}/assignment`, data);
    return response.data;
  },

  getAssignment: async (studyId: number, sessionId: number) => {
    const response = await AxiosInstance.get(`/study/${studyId}/sessions/${sessionId}/assignment`);
    return response.data;
  },

  getAssignmentSubmissions: async (studyId: number, sessionId: number) => {
    const response = await AxiosInstance.get(`/study/${studyId}/sessions/${sessionId}/assignment/submissions`);
    return response.data;
  }
};
