import React, { useState, useEffect } from 'react';
import { studyApi } from '../apis/Study';
import { StudySession, Study } from '../types/Study';
import { Logger } from '../utils';
import CreateSessionModal from './CreateSessionModal';
import AttendanceCheckModal from './AttendanceCheckModal';
import CreateAssignmentModal from './CreateAssignmentModal';

interface StudySessionListProps {
  study: Study;
  isMember: boolean;
  isAdmin: boolean;
}

const StudySessionList: React.FC<StudySessionListProps> = ({ study, isMember, isAdmin }) => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState<number | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState<number | null>(null);

  const fetchSessions = async () => {
    try {
      // Temporary fallback as backend might not have this endpoint implemented yet
      // const response = await studyApi.getStudySessions(study.id);
      // setSessions(response.data);
      setSessions([
        {
          id: 1,
          studyId: study.id,
          startDateTime: new Date(Date.now() + 86400000).toISOString(),
          endDateTime: new Date(Date.now() + 93600000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]);
    } catch (err) {
      Logger.error('Failed to fetch sessions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [study.id]);

  const handleAttend = async (sessionId: number) => {
    try {
      await studyApi.attend(study.id, sessionId);
      alert('출석 처리가 완료되었습니다.');
    } catch (err) {
      alert('출석 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) return <div className="text-gray-400 mt-4">세션 목록을 불러오는 중...</div>;

  return (
    <div className="w-full mt-6">
      <div className="flex justify-between items-center border-b border-gray-600 pb-3 pl-2">
        <h2 className="text-2xl font-semibold">스터디 세션</h2>
        {isAdmin && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-1.5 bg-[#CAFF33] text-black text-sm font-bold rounded-full hover:bg-[#b0e82e]"
          >
            Create Session
          </button>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {sessions.length === 0 ? (
          <p className="text-gray-500 pl-2">등록된 세션이 없습니다.</p>
        ) : (
          sessions.map((session, index) => (
            <div key={session.id} className="bg-white bg-opacity-5 p-5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h3 className="text-lg font-medium text-[#CAFF33]">{index + 1}회차 세션</h3>
                <p className="text-sm text-gray-400 mt-1">
                  시작: {new Date(session.startDateTime).toLocaleString()} <br/>
                  종료: {new Date(session.endDateTime).toLocaleString()}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                {isAdmin && study.assignmentRequired && (
                  <button 
                    onClick={() => setShowAssignmentModal(session.id)}
                    className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-600"
                  >
                    + Assignment
                  </button>
                )}
                {isAdmin && study.attendanceCheckRequired && (
                  <button 
                    onClick={() => setShowAttendanceModal(session.id)}
                    className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-600"
                  >
                    Start Attendance
                  </button>
                )}
                {(isAdmin || isMember) && study.attendanceCheckRequired && (
                  <button 
                    onClick={() => handleAttend(session.id)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-500"
                  >
                    Attend
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <CreateSessionModal 
          studyId={study.id} 
          onClose={() => setShowCreateModal(false)} 
          onCreated={fetchSessions} 
        />
      )}

      {showAttendanceModal !== null && (
        <AttendanceCheckModal 
          studyId={study.id} 
          sessionId={showAttendanceModal}
          onClose={() => setShowAttendanceModal(null)} 
        />
      )}

      {showAssignmentModal !== null && (
        <CreateAssignmentModal 
          studyId={study.id} 
          sessionId={showAssignmentModal}
          onClose={() => setShowAssignmentModal(null)} 
        />
      )}
    </div>
  );
};

export default StudySessionList;
