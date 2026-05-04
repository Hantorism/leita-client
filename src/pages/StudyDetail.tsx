import { studyApi } from '@apis';
import {
  Button,
  DeleteStudyModal,
  Footer,
  Header,
  StudyCompletionTab,
  StudyMemberTab,
  StudyProgressTab,
  StudySessionTab,
  UpdateStudyModal,
} from '@components';
import { useAlert } from '@contexts';
import type { Study, StudyUser } from '@types';
import { extractErrorMessage, getCurrentUserEmail, Logger } from '@utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type Tab = 'sessions' | 'members' | 'progress' | 'completion';

const TAB_LABELS: { key: Tab; label: string }[] = [
  { key: 'sessions', label: '세션 목록' },
  { key: 'members', label: '멤버 조회' },
  { key: 'progress', label: '출석/과제 현황' },
  { key: 'completion', label: '수료 확인' },
];

const StudyDetailPage = () => {
  const { id } = useParams();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('sessions');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchStudy = useCallback(async () => {
    if (!id) return;
    try {
      const [studyRes, roleRes] = await Promise.all([
        studyApi.getStudy(Number(id)),
        studyApi.getMyRole(Number(id))
      ]);
      
      if (!isMounted.current) return;

      const studyData = studyRes as unknown as Study;
      setStudy(studyData);
      document.title = `${studyData.title} | Leita`;

      const role = roleRes as unknown as any;
      setIsAdmin(role.role === 'ADMIN');
      setIsMember(role.role === 'MEMBER');

      const userEmail = getCurrentUserEmail();
      if (userEmail) {
        setCurrentUserEmail(userEmail);
      }
    } catch (err) {
      Logger.error('스터디 정보를 불러오는 데 실패했습니다:', err);
      if (isMounted.current) {
        setError('스터디 정보를 불러올 수 없습니다.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchStudy();
  }, [fetchStudy]);

  const handleDeleteStudy = async () => {
    if (!study) return;
    setIsDeleting(true);
    try {
      await studyApi.deleteStudy(study.id);
      showAlert('success', '스터디가 성공적으로 삭제되었습니다.');
      navigate('/study');
    } catch (err) {
      Logger.error('스터디 삭제 중 오류 발생:', err);
      showAlert('error', '삭제 실패: ' + extractErrorMessage(err));
    } finally {
      if (isMounted.current) {
        setIsDeleting(false);
        setShowDeleteModal(false);
      }
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[var(--color-bg-main)] text-white text-center pt-20">
        스터디 정보를 불러오는 중...
      </div>
    );
  if (error) return <div className="min-h-screen bg-[var(--color-bg-main)] text-white text-center pt-20">{error}</div>;
  if (!study)
    return (
      <div className="min-h-screen bg-[var(--color-bg-main)] text-white text-center pt-20">
        스터디를 찾을 수 없습니다.
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1A1A] text-white font-Pretendard overflow-x-hidden">
      <Header />

      <main className="flex-grow w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-20">
        <div className="flex flex-col gap-10">
          {/* 스터디 제목 + 수료 조건 배지 */}
          <div className="w-full flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-[#CAFE33]">
                {study.title}
              </h1>
              <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-3xl">
                {study.description || '스터디에 대한 상세 설명이 준비되지 않았습니다.'}
              </p>
            </div>

            {isAdmin && (
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-[#CAFE33]/10 hover:border-[#CAFE33]/30 hover:text-[#CAFE33] transition-all duration-300 text-sm font-black text-gray-400 group shadow-lg hover:shadow-[#CAFE33]/5"
                >
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="group-hover:rotate-12 transition-transform duration-300"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  스터디 수정
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-all duration-300 text-sm font-black text-gray-400 group shadow-lg hover:shadow-red-500/5"
                >
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="group-hover:scale-110 transition-transform duration-300"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  스터디 삭제
                </button>
              </div>
            )}
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5 w-fit">
            {TAB_LABELS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all duration-300 ${
                  activeTab === key ? 'bg-white/10 text-[#CAFE33] shadow-lg' : 'text-gray-500 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="w-full">
            {/* ── 탭 1: 세션 목록 ── */}
            {activeTab === 'sessions' && (
              <div className="w-full animate-fadeIn">
                <StudySessionTab
                  study={study}
                  isMember={isMember}
                  isAdmin={isAdmin}
                  currentUserEmail={currentUserEmail}
                />
              </div>
            )}

            {/* ── 탭 2: 멤버 조회 ── */}
            {activeTab === 'members' && (
              <StudyMemberTab
                study={study}
                isAdmin={isAdmin}
                onMemberUpdated={fetchStudy}
              />
            )}

            {/* ── 탭 3: 출석/과제 현황 ── */}
            {activeTab === 'progress' && <StudyProgressTab study={study} />}

            {/* ── 탭 4: 수료 확인 ── */}
            {activeTab === 'completion' && (
              <StudyCompletionTab
                study={study}
                isAdmin={isAdmin}
                currentUserEmail={currentUserEmail}
                onRequirementUpdated={fetchStudy}
              />
            )}
          </div>
        </div>
      </main>

      {/* 모달 */}
      {showUpdateModal && study && (
        <UpdateStudyModal
          study={study}
          onClose={() => setShowUpdateModal(false)}
          onUpdated={fetchStudy}
        />
      )}

      {showDeleteModal && study && (
        <DeleteStudyModal
          study={study}
          isDeleting={isDeleting}
          onConfirm={handleDeleteStudy}
          onClose={() => setShowDeleteModal(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default StudyDetailPage;
