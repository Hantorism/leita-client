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
      const result = await studyApi.getStudy(parseInt(id, 10));
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
    return <div className="min-h-screen bg-[var(--color-bg-main)] text-white text-center pt-20">스터디 정보를 불러오는 중...</div>;
  if (error) return <div className="min-h-screen bg-[var(--color-bg-main)] text-white text-center pt-20">{error}</div>;
  if (!study)
    return <div className="min-h-screen bg-[var(--color-bg-main)] text-white text-center pt-20">스터디를 찾을 수 없습니다.</div>;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg-main)] text-white font-Pretendard">
      <header className="pl-[10%] pr-[10%] w-full text-left pt-[3%]">
        <Header />
      </header>

      <main className="flex-grow flex flex-col items-center py-10 px-5 max-w-5xl mx-auto w-full">
        {/* 스터디 제목 + 수료 조건 배지 */}
        <div className="w-full flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-brand)]">{study.title}</h1>
            <p className="text-gray-400 mt-2 text-sm">{study.description}</p>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div
          id="study-tabs-nav"
          className="w-full flex border-b border-gray-700 mb-8"
        >
          {TAB_LABELS.map(({ key, label }) => (
            <Button
              key={key}
              variant="ghost"
              onClick={() => setActiveTab(key)}
              className={`!px-6 !py-3 font-semibold border-b-2 -mb-[2px] !rounded-none ${
                activeTab === key ? 'border-[var(--color-brand)] !text-[var(--color-brand)]' : 'border-transparent hover:text-white'
              }`}
            >
              {label}
            </Button>
          ))}
        </div>

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
      </main>

      <footer className="w-full text-left mt-10">
        <Footer />
      </footer>
    </div>
  );
};

export default StudyDetailPage;
