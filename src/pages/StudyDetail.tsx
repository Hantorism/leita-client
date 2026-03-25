import { useEffect, useState } from 'react';
import { Logger } from '@utils';
import { studyApi } from '@apis';
import { Study } from '@types';
import { StudySessionTab, StudyMemberTab, StudyProgressTab, StudyProgressModal, Header, Footer } from '@components';
import { useParams } from 'react-router-dom';

type Tab = 'sessions' | 'members' | 'progress';

const TAB_LABELS: { key: Tab; label: string }[] = [
	{ key: 'sessions', label: '세션 목록' },
	{ key: 'members',  label: '멤버 조회' },
	{ key: 'progress', label: '출석/과제 현황' },
];

const StudyDetail = () => {
	const { id } = useParams();
	const [study, setStudy]         = useState<Study | null>(null);
	const [loading, setLoading]     = useState(true);
	const [error, setError]         = useState<string | null>(null);
	const [isMember, setIsMember]   = useState(false);
	const [isAdmin, setIsAdmin]     = useState(false);
	const [activeTab, setActiveTab] = useState<Tab>('sessions');

	// --- 통합 현황 모달 상태 ---
	const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
	const [progressModalMember, setProgressModalMember] = useState<any>(null);
	const [progressModalInitialSessionId, setProgressModalInitialSessionId] = useState<number | undefined>(undefined);

	const handleOpenProgressModal = (member: any, sessionId?: number) => {
		setProgressModalMember(member);
		setProgressModalInitialSessionId(sessionId);
		setIsProgressModalOpen(true);
	};

	const fetchStudy = async () => {
		if (!id) return;
		try {
			const result    = await studyApi.getStudy(parseInt(id, 10));
			const studyData = result.data || result;
			setStudy(studyData);
			document.title = `${studyData.title} | Leita`;

			const storedUser       = localStorage.getItem('user');
			const currentUser      = storedUser ? JSON.parse(storedUser) : null;
			const currentUserEmail = currentUser?.data?.email?.toLowerCase().trim();

			if (currentUserEmail) {
				const me = studyData.members?.find((m: any) => m.email.toLowerCase().trim() === currentUserEmail);
				setIsAdmin(me?.role === 'ADMIN');
				setIsMember(me?.role === 'MEMBER');
			}
		} catch (err: any) {
			Logger.error('스터디 정보를 불러오는 데 실패했습니다:', err);
			setError('스터디 정보를 불러올 수 없습니다.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchStudy();
	}, [id]);

	if (loading) return <div className="min-h-screen bg-[#1A1A1A] text-white text-center pt-20">스터디 정보를 불러오는 중...</div>;
	if (error)   return <div className="min-h-screen bg-[#1A1A1A] text-white text-center pt-20">{error}</div>;
	if (!study)  return <div className="min-h-screen bg-[#1A1A1A] text-white text-center pt-20">스터디를 찾을 수 없습니다.</div>;

	return (
		<div className="flex flex-col min-h-screen bg-[#1A1A1A] text-white font-Pretendard">
			<header className="pl-[10%] pr-[10%] w-full text-left pt-[3%]">
				<Header />
			</header>

			<main className="flex-grow flex flex-col items-center py-10 px-5 max-w-5xl mx-auto w-full">

				{/* 스터디 제목 + 수료 조건 배지 */}
				<div className="w-full flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
					<div>
						<h1 className="text-3xl font-bold text-[#CAFF33]">{study.title}</h1>
						<p className="text-gray-400 mt-2 text-sm">{study.description}</p>
					</div>

				</div>

				{/* 탭 네비게이션 */}
				<div className="w-full flex border-b border-gray-700 mb-8">
					{TAB_LABELS.map(({ key, label }) => (
						<button
							key={key}
							onClick={() => setActiveTab(key)}
							className={`px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2 -mb-[2px] ${
								activeTab === key
									? 'border-[#CAFF33] text-[#CAFF33]'
									: 'border-transparent text-gray-400 hover:text-white'
							}`}
						>
							{label}
						</button>
					))}
				</div>

				{/* ── 탭 1: 세션 목록 ── */}
				{activeTab === 'sessions' && (
					<div className="w-full animate-fadeIn">
						<StudySessionTab study={study} isMember={isMember} isAdmin={isAdmin} />
					</div>
				)}

				{/* ── 탭 2: 멤버 조회 ── */}
				{activeTab === 'members' && (
					<StudyMemberTab 
						study={study} 
						isAdmin={isAdmin} 
						onMemberUpdated={fetchStudy} 
						onOpenProgressModal={handleOpenProgressModal}
					/>
				)}

				{/* ── 탭 3: 출석/과제 현황 ── */}
				{activeTab === 'progress' && (
					<StudyProgressTab 
						study={study} 
						onOpenProgressModal={handleOpenProgressModal}
					/>
				)}

				{/* 통합 현황 모달 렌더링 (최상위 레벨) */}
				{isProgressModalOpen && progressModalMember && (
					<StudyProgressModal
						study={study}
						member={progressModalMember}
						initialSessionId={progressModalInitialSessionId}
						onClose={() => setIsProgressModalOpen(false)}
					/>
				)}

			</main>

			<footer className="w-full text-left mt-10">
				<Footer />
			</footer>
		</div>
	);
};

export default StudyDetail;
