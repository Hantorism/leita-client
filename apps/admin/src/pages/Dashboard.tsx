import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { noticeApi, qnaApi } from '@leita/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [noticeCount, setNoticeCount] = useState<number>(0);
  const [qnaCount, setQnaCount] = useState<number>(0);
  const [unansweredQnaCount, setUnansweredQnaCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        const notices = await noticeApi.getAdminNotices(0, 1);
        const qnas = await qnaApi.getAdminQnas(0, 100); // Fetch all to count unanswered
        
        setNoticeCount(notices.totalElements || 0);
        setQnaCount(qnas.totalElements || 0);
        
        const unanswered = qnas.content.filter(q => !q.answer).length;
        setUnansweredQnaCount(unanswered);
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div className="space-y-10 relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#CAFE33]/5 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none" />
      
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-white">대시보드</h1>
        <p className="text-gray-500 font-medium">LEITA 관리 서비스의 현황 요약 및 바로가기 제공 페이지입니다.</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:bg-white/10 transition-colors cursor-pointer group animate-fadeIn"
          onClick={() => navigate('/notices')}
        >
          <span className="text-xs font-black text-gray-500 uppercase tracking-widest">등록된 공지사항</span>
          <div className="flex items-baseline gap-2 mt-4 mb-2">
            <span className="text-4xl font-black text-white group-hover:text-[#CAFE33] transition-colors font-JetBrain">
              {loading ? '-' : noticeCount}
            </span>
            <span className="text-sm font-bold text-gray-500">개</span>
          </div>
          <span className="text-xs text-gray-400 font-semibold group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1 mt-4">
            공지사항 목록 가기 →
          </span>
        </div>

        <div
          className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:bg-white/10 transition-colors cursor-pointer group animate-fadeIn [animation-delay:100ms]"
          onClick={() => navigate('/qnas')}
        >
          <span className="text-xs font-black text-gray-500 uppercase tracking-widest">누적 Q&A 문의</span>
          <div className="flex items-baseline gap-2 mt-4 mb-2">
            <span className="text-4xl font-black text-white group-hover:text-[#CAFE33] transition-colors font-JetBrain">
              {loading ? '-' : qnaCount}
            </span>
            <span className="text-sm font-bold text-gray-500">개</span>
          </div>
          <span className="text-xs text-gray-400 font-semibold group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1 mt-4">
            Q&A 문의 목록 가기 →
          </span>
        </div>

        <div
          className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:bg-white/10 transition-colors cursor-pointer group animate-fadeIn [animation-delay:200ms]"
          onClick={() => navigate('/qnas?filter=unanswered')}
        >
          <span className="text-xs font-black text-gray-500 uppercase tracking-widest">미답변 문의</span>
          <div className="flex items-baseline gap-2 mt-4 mb-2">
            <span className="text-4xl font-black text-red-500 group-hover:scale-105 transition-transform font-JetBrain">
              {loading ? '-' : unansweredQnaCount}
            </span>
            <span className="text-sm font-bold text-gray-500">개</span>
          </div>
          <span className="text-xs text-gray-400 font-semibold group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1 mt-4">
            답변하러 가기 →
          </span>
        </div>
      </div>

      {/* Info Card */}
      <div
        className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-10 relative overflow-hidden animate-fadeIn [animation-delay:300ms]"
      >
        <h2 className="text-lg font-bold mb-4">어드민 시스템 가이드</h2>
        <ul className="space-y-3 text-sm text-gray-400 font-semibold">
          <li className="flex items-start gap-2.5">
            <span className="text-[#CAFE33]">✔</span>
            <span>왼쪽 사이드바의 핸들을 드래그하여 사이드바 너비를 200px에서 400px까지 조절할 수 있습니다.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-[#CAFE33]">✔</span>
            <span>핸들을 더블 클릭하면 사이드바를 접어 더 넓은 작업 화면을 확보할 수 있습니다.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-[#CAFE33]">✔</span>
            <span>공지사항 관리에서 작성한 공지는 메인 서비스 공지사항 게시판에 즉시 노출됩니다.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-[#CAFE33]">✔</span>
            <span>사용자 문의에 신속하게 답변하여 원활한 소통을 유지해 주세요.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
