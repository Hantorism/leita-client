import { studyApi } from '@apis';
import {
  Button,
  Footer,
  Header,
  StudyCompletionTab,
  StudyMemberTab,
  StudyProgressTab,
  StudySessionTab,
} from '@components';
import type { Study, StudyUser } from '@types';
import { getCurrentUserEmail, Logger } from '@utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

type Tab = 'sessions' | 'members' | 'progress' | 'completion';

const TAB_LABELS: { key: Tab; label: string }[] = [
  { key: 'sessions', label: '세션 목록' },
  { key: 'members', label: '멤버 조회' },
  { key: 'progress', label: '출석/과제 현황' },
  { key: 'completion', label: '수료 확인' },
];

const StudyDetailPage = () => {
  const { id } = useParams();
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('sessions');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
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
      const result = await studyApi.getStudy(Number(id));
      if (!isMounted.current) return;

      const studyData = result as unknown as Study;
      setStudy(studyData);
      document.title = `${studyData.title} | Leita`;

      const userEmail = getCurrentUserEmail();

      if (userEmail) {
        setCurrentUserEmail(userEmail);
        const me = studyData.members?.find((m: StudyUser) => m.email.toLowerCase().trim() === userEmail);
        setIsAdmin(me?.role === 'ADMIN');
        setIsMember(me?.role === 'MEMBER');
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
              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter italic uppercase text-[#CAFE33]">
                {study.title}
              </h1>
              <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-3xl">
                {study.description || '스터디에 대한 상세 설명이 준비되지 않았습니다.'}
              </p>
            </div>
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
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudyDetailPage;
