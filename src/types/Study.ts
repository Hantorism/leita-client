import type { JudgeResultType } from './Judge';

export type StudyMemberRole = 'ADMIN' | 'MEMBER' | 'PENDING';
export type AttendanceStatus = 'OPEN' | 'CLOSED';
export type AttendanceRecordStatus = 'PRESENT' | 'LATE' | 'ABSENT';
export type AssignmentStatusType = 'COMPLETED' | 'PARTIAL' | 'INCOMPLETE';

export interface StudyCreateRequest {
  title: string;
  description: string;
  requirement: string;
  startDate: string;
  endDate: string;
}

export interface StudyCreateResponse {
  id: number;
  title: string;
}

export interface StudyUpdateRequest {
  title: string;
  description: string;
  requirement: string;
  startDate: string;
  endDate: string;
}

export interface StudySessionCreateRequest {
  studyId: number;
  title: string;
  description: string | null;
  startDateTime: string;
  endDateTime: string;
}

export interface StudySessionUpdateRequest {
  title: string;
  description: string | null;
  startDateTime: string;
  endDateTime: string;
}

export interface AttendanceOpenRequest {
  openTime: string;
  closeTime: string;
  lateThresholdMinutes: number;
}

export interface AttendanceUpdateRequest {
  closeTime: string | null;
  lateThresholdMinutes: number | null;
  status: AttendanceStatus | null;
}

export interface MemberAttendanceUpdateRequest {
  status: AttendanceRecordStatus;
}

export interface MemberAssignmentUpdateRequest {
  status: AssignmentStatusType;
}

export interface AssignmentCreateRequest {
  description: string | null;
  problemIds: string[];
  startDateTime: string | null;
  endDateTime: string;
}

export interface AssignmentUpdateRequest {
  description: string | null;
  problemIds: string[];
  startDateTime: string | null;
  endDateTime: string;
}

export interface StudyUser {
  memberId: number;
  userId: number;
  name: string;
  email: string;
  role: StudyMemberRole;
  joinedAt: string;
  approvedAt: string | null;
}

export interface Study {
  id: number;
  title: string;
  description: string;
  requirement: string;
  startDate: string;
  endDate: string;
  members: StudyUser[];
  isJoined?: boolean;
  memberCount?: number;
}

export interface StudySession {
  id: number;
  studyId: number;
  title: string;
  description: string | null;
  startDateTime: string;
  endDateTime: string;
  attendanceStatus?: AttendanceStatus;
  assignmentCreated?: boolean;
}

export interface StudySessionDetail {
  id: number;
  studyId: number;
  title: string;
  description: string | null;
  startDateTime: string;
  endDateTime: string;
  attendance: AttendanceCheck | null;
  assignment: AssignmentDetailResponse | null;
}

export interface AttendanceRecord {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  status: AttendanceRecordStatus;
  attendedAt: string | null;
}

export interface AttendanceRate {
  total: number;
  present: number;
  late: number;
  absent: number;
  percentage: number;
}

export interface AttendanceCheck {
  id: number;
  studySessionId: number;
  openTime: string;
  closeTime: string | null;
  lateThresholdMinutes: number;
  status: AttendanceStatus;
  records: AttendanceRecord[];
  attendanceRate: AttendanceRate;
}

export interface AssignmentResponse {
  id: number;
  studySessionId: number;
  description: string | null;
  problemIds: string[];
  startDateTime: string;
  endDateTime: string;
}

export interface AssignmentProblemStatus {
  problemId: string;
  title: string;
  result: JudgeResultType | null;
}

export interface AssignmentDetailResponse {
  id: number;
  studySessionId: number;
  status: AssignmentStatusType | null;
  description: string | null;
  problems: AssignmentProblemStatus[];
  startDateTime: string;
  endDateTime: string;
}

export interface UserBrief {
  id: number;
  name: string;
  email: string;
  profileImage: string | null;
}

export interface SessionStatus {
  sessionId: number;
  sessionTitle: string;
  attendanceStatus: AttendanceRecordStatus | null;
  assignmentStatus: AssignmentStatusType | null;
}

export interface StudyMemberStatus {
  user: UserBrief;
  sessions: SessionStatus[];
}

export interface AttendanceDetail {
  sessionId: number;
  sessionTitle: string;
  status: AttendanceRecordStatus | null;
  attendedAt: string | null;
}

export interface StudyMemberAttendance {
  user: UserBrief;
  attendances: AttendanceDetail[];
}

export interface AssignmentDetail {
  sessionId: number;
  sessionTitle: string;
  status: AssignmentStatusType | null;
  solvedCount: number;
  totalCount: number;
  problems: AssignmentProblemStatus[];
}

export interface StudyMemberAssignment {
  user: UserBrief;
  assignments: AssignmentDetail[];
}

export interface UserAttendanceStatus {
  totalSessions: number;
  attendedCount: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendancePercentage: number;
}

export interface UserAssignmentStatus {
  totalAssignments: number;
  completedCount: number;
  assignmentPercentage: number;
}

export interface StudyProgress {
  userId: number;
  userName: string;
  userEmail: string;
  attendanceStatus: UserAttendanceStatus;
  assignmentStatus: UserAssignmentStatus;
  isCompleted: boolean;
}

export interface StudyProgressDetail {
  studyId: number;
  title: string;
  members: StudyProgress[];
  completedMembers: UserBrief[];
  inProgressMembers: UserBrief[];
}
