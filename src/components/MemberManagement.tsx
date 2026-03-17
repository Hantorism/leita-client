import React, { useEffect, useState } from 'react';
import { studyApi } from '../apis/Study';
import { StudyUser } from '../types/Study';
import { Logger } from '../utils';

interface MemberManagementProps {
  studyId: number;
}

const MemberManagement: React.FC<MemberManagementProps> = ({ studyId }) => {
  const [pendings, setPendings] = useState<StudyUser[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real application, you might fetch pendings through the study object 
  // or a dedicated endpoint like `/study/${studyId}/pendings`.
  const fetchPendings = async () => {
    try {
      // Assuming getStudyById returns the updated study object including pendings
      const result = await studyApi.getStudyById(studyId);
      const studyData = result.data || result;
      setPendings(studyData.members?.filter((m: StudyUser) => m.role === 'PENDING') || []);
    } catch (err) {
      Logger.error('Failed to fetch pending members', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendings();
  }, [studyId]);

  const handleApprove = async (email: string) => {
    try {
      await studyApi.approveMember(studyId, email);
      alert('멤버 가입을 승인했습니다.');
      fetchPendings(); // List refresh
    } catch (err) {
      alert('승인 처리에 실패했습니다.');
    }
  };

  const handleDeny = async (email: string) => {
    try {
      await studyApi.denyMember(studyId, email);
      alert('멤버 가입을 거절했습니다.');
      fetchPendings(); // List refresh
    } catch (err) {
      alert('거절 처리에 실패했습니다.');
    }
  };

  if (loading) return <div className="text-gray-400">대기 멤버 목록을 불러오는 중...</div>;

  return (
    <div className="w-full mt-6">
      <h2 className="text-2xl font-semibold border-b border-gray-600 pb-3 pl-2">가입 대기 멤버</h2>
      
      {pendings.length === 0 ? (
        <p className="text-gray-500 pl-2 mt-4">가입 대기 중인 멤버가 없습니다.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {pendings.map((user: StudyUser, index: number) => (
            <li key={index} className="flex items-center justify-between gap-4 bg-white bg-opacity-5 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center font-bold text-gray-300 uppercase">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <span className="block text-md font-medium text-gray-200">{user.name}</span>
                  <span className="block text-sm text-gray-500">{user.email}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeny(user.email)}
                  className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-md hover:bg-red-500"
                >
                  거절
                </button>
                <button
                  onClick={() => handleApprove(user.email)}
                  className="px-3 py-1.5 bg-[#CAFF33] text-black text-sm font-bold rounded-md hover:bg-[#b0e82e]"
                >
                  승인
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MemberManagement;
