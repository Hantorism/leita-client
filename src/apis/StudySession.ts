import { AxiosInstance } from '@utils';

export const studySessionApi = {
  // GET /study-session
  getStudySessions: async (studyId: number, page?: number, size?: number) => {
    const response = await AxiosInstance.get(`/study-session`, { params: { studyId, page, size } });
    return response.data;
  },

  // POST /study-session
  createStudySession: async (data: {
    studyId: number;
    title: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
  }) => {
    const response = await AxiosInstance.post(`/study-session`, data);
    return response.data;
  },

  // GET /study-session/{studySessionId}
  getStudySession: async (studySessionId: number) => {
    const response = await AxiosInstance.get(`/study-session/${studySessionId}`);
    return response.data;
  },

  // PUT /study-session/{studySessionId}
  updateStudySession: async (
    studySessionId: number,
    data: { title: string; description?: string; startDateTime: string; endDateTime: string },
  ) => {
    const response = await AxiosInstance.put(`/study-session/${studySessionId}`, data);
    return response.data;
  },

  // DELETE /study-session/{studySessionId}
  deleteStudySession: async (studySessionId: number) => {
    const response = await AxiosInstance.delete(`/study-session/${studySessionId}`);
    return response.data;
  },

  // GET /study-session/{studySessionId}/attendance
  getAttendance: async (studySessionId: number) => {
    const response = await AxiosInstance.get(`/study-session/${studySessionId}/attendance`);
    return response.data;
  },

  // POST /study-session/{studySessionId}/attendance
  openAttendance: async (
    studySessionId: number,
    data: { openTime: string; closeTime: string; lateThresholdMinutes: number },
  ) => {
    const response = await AxiosInstance.post(`/study-session/${studySessionId}/attendance`, data);
    return response.data;
  },

  // PUT /study-session/{studySessionId}/attendance
  updateAttendance: async (
    studySessionId: number,
    data: { closeTime?: string; lateThresholdMinutes?: number; status?: string },
  ) => {
    const response = await AxiosInstance.put(`/study-session/${studySessionId}/attendance`, data);
    return response.data;
  },

  // POST /study-session/{studySessionId}/attendance/attend
  attend: async (studySessionId: number) => {
    const response = await AxiosInstance.post(`/study-session/${studySessionId}/attendance/attend`);
    return response.data;
  },

  // POST /study-session/{studySessionId}/attendance/close
  closeAttendance: async (studySessionId: number, data?: { closeTime: string }) => {
    const response = await AxiosInstance.post(`/study-session/${studySessionId}/attendance/close`, data || {});
    return response.data;
  },

  // GET /study-session/{studySessionId}/assignment
  getAssignment: async (studySessionId: number) => {
    const response = await AxiosInstance.get(`/study-session/${studySessionId}/assignment`);
    return response.data;
  },

  // POST /study-session/{studySessionId}/assignment
  createAssignment: async (
    studySessionId: number,
    data: { title: string; description?: string; problemIds: number[] },
  ) => {
    const response = await AxiosInstance.post(`/study-session/${studySessionId}/assignment`, data);
    return response.data;
  },

  // PUT /study-session/{studySessionId}/assignment
  updateAssignment: async (
    studySessionId: number,
    data: { title: string; description?: string; problemIds: number[] },
  ) => {
    const response = await AxiosInstance.put(`/study-session/${studySessionId}/assignment`, data);
    return response.data;
  },
};
