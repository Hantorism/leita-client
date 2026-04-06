export type StudyMemberRole = 'ADMIN' | 'MEMBER' | 'PENDING';

export interface StudyUser {
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
  maxAbsences?: number;
  maxIncompleteAsg?: number;
}

export interface StudySession {
  id: number;
  studyId: number;
  title: string;
  description: string | null;
  startDateTime: string;
  endDateTime: string;
  attendanceStatus?: 'BEFORE' | 'OPEN' | 'CLOSED';
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
  assignment: Assignment | null;
}

export interface AttendanceRecord {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
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
  status: 'OPEN' | 'CLOSED';
  records: AttendanceRecord[];
  attendanceRate: AttendanceRate;
}

export interface Assignment {
  id: number;
  studySessionId: number;
  title: string;
  description: string | null;
  problemIds: number[];
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
  attendanceStatus: string | null;
  assignmentStatus: boolean | null;
}

export interface StudyMemberStatus {
  user: UserBrief;
  sessions: SessionStatus[];
}

export interface AttendanceDetail {
  sessionId: number;
  sessionTitle: string;
  status: string | null;
  attendedAt: string | null;
}

export interface StudyMemberAttendance {
  user: UserBrief;
  attendances: AttendanceDetail[];
}

export interface AssignmentDetail {
  sessionId: number;
  sessionTitle: string;
  solvedCount: number;
  totalCount: number;
  isCompleted: boolean;
  solvedProblemIds: number[];
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
