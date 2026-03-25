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
}

export interface StudySession {
  id: number;
  studyId: number;
  startDateTime: string;
  endDateTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  status: "PRESENT" | "LATE" | "ABSENT";
  attendedAt: string | null;
}

export interface AttendanceCheck {
  id: number;
  studySessionId: number;
  openTime: string;
  closeTime: string;
  lateThresholdMinutes: number;
  status: "OPEN" | "CLOSED";
  attendances: Attendance[];
}

export interface Assignment {
  id: number;
  studySessionId: number;
  title: string;
  description: string | null;
  problemIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface StudyProgressMember {
  userId: number;
  userName: string;
  attendanceCount: number;
  completedAssignments: number;
  isCompleted: boolean;
}

export interface StudyProgress {
  studyId: number;
  completionRule: {
    attendanceRequired: boolean;
    assignmentRequired: boolean;
    requiredAttendanceCount: number;
    requiredAssignmentCount: number;
  };
  members: StudyProgressMember[];
}
