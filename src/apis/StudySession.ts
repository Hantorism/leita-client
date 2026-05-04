import type {
  AssignmentCreateRequest,
  AssignmentDetailResponse,
  AssignmentResponse,
  AssignmentUpdateRequest,
  AttendanceCheck,
  AttendanceOpenRequest,
  AttendanceUpdateRequest,
  MemberAssignmentUpdateRequest,
  MemberAttendanceUpdateRequest,
  StudySession,
  StudySessionCreateRequest,
  StudySessionDetail,
  StudySessionUpdateRequest,
} from '@types';
import { AxiosInstance, type PagedResponse } from '@utils';

export const studySessionApi = {
  // GET /study-session
  getStudySessions: async (studyId: number, page?: number, size?: number) => {
    return AxiosInstance.get<PagedResponse<StudySession>>(`/study-session`, {
      params: { studyId, page, size },
    });
  },

  // POST /study-session
  createStudySession: async (data: StudySessionCreateRequest) => {
    return AxiosInstance.post<StudySessionDetail>(`/study-session`, data);
  },

  // GET /study-session/{studySessionId}
  getStudySession: async (studySessionId: number) => {
    return AxiosInstance.get<StudySessionDetail>(`/study-session/${studySessionId}`);
  },

  // PUT /study-session/{studySessionId}
  updateStudySession: async (studySessionId: number, data: StudySessionUpdateRequest) => {
    return AxiosInstance.put<StudySessionDetail>(`/study-session/${studySessionId}`, data);
  },

  // DELETE /study-session/{studySessionId}
  deleteStudySession: async (studySessionId: number) => {
    return AxiosInstance.delete(`/study-session/${studySessionId}`);
  },

  // GET /study-session/{studySessionId}/attendance
  getAttendance: async (studySessionId: number) => {
    return AxiosInstance.get<AttendanceCheck>(`/study-session/${studySessionId}/attendance`);
  },

  // POST /study-session/{studySessionId}/attendance
  openAttendance: async (studySessionId: number, data: AttendanceOpenRequest) => {
    return AxiosInstance.post<AttendanceCheck>(`/study-session/${studySessionId}/attendance`, data);
  },

  // PUT /study-session/{studySessionId}/attendance
  updateAttendance: async (studySessionId: number, data: AttendanceUpdateRequest) => {
    return AxiosInstance.put<AttendanceCheck>(`/study-session/${studySessionId}/attendance`, data);
  },

  // POST /study-session/{studySessionId}/attendance/attend
  attend: async (studySessionId: number) => {
    return AxiosInstance.post<AttendanceCheck>(`/study-session/${studySessionId}/attendance/attend`);
  },

  // PUT /study-session/{studySessionId}/attendance/members/{memberId}
  updateMemberAttendance: async (studySessionId: number, memberId: number, data: MemberAttendanceUpdateRequest) => {
    return AxiosInstance.put<AttendanceCheck>(`/study-session/${studySessionId}/attendance/members/${memberId}`, data);
  },

  // GET /study-session/{studySessionId}/assignment
  getAssignment: async (studySessionId: number) => {
    return AxiosInstance.get<AssignmentDetailResponse>(`/study-session/${studySessionId}/assignment`);
  },

  // POST /study-session/{studySessionId}/assignment
  createAssignment: async (studySessionId: number, data: AssignmentCreateRequest) => {
    return AxiosInstance.post<AssignmentResponse>(`/study-session/${studySessionId}/assignment`, data);
  },

  // PUT /study-session/{studySessionId}/assignment
  updateAssignment: async (studySessionId: number, data: AssignmentUpdateRequest) => {
    return AxiosInstance.put<AssignmentResponse>(`/study-session/${studySessionId}/assignment`, data);
  },

  // PUT /study-session/{studySessionId}/assignment/members/{memberId}
  updateMemberAssignment: async (studySessionId: number, memberId: number, data: MemberAssignmentUpdateRequest) => {
    return AxiosInstance.put<AssignmentDetailResponse>(
      `/study-session/${studySessionId}/assignment/members/${memberId}`,
      data,
    );
  },
};
