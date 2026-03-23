import { useEffect, useState } from 'react';
import { Logger } from '@utils';
import { studyApi } from '@apis';
import { Study } from '@types';
import { StudySessionList, StudyMemberList, Header, Footer } from '@components';
import { useParams } from 'react-router-dom';

type Tab = 'sessions' | 'members';

const TAB_LABELS: { key: Tab; label: string }[] = [
	{ key: 'sessions', label: '세션 목록' },
	{ key: 'members',  label: '멤버 조회' },
];

const StudyDetail = () => {
	const { id } = useParams();
	const [study, setStudy]         = useState<Study | null>(null);
	const [loading, setLoading]     = useState(true);
	const [error, setError]         = useState<string | null>(null);
	const [isMember, setIsMember]   = useState(false);
	const [isAdmin, setIsAdmin]     = useState(false);
	const [activeTab, setActiveTab] = useState<Tab>('sessions');

	const fetchStudy = async () => {
		if (!id) return;
		try {
			const result    = await studyApi.getStudyById(parseInt(id, 10));
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

					{/* 수료 조건 배지 */}
					<div className="flex flex-wrap gap-2 shrink-0 sm:mt-1">
						{study.attendanceRequired ? (
							<span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-blue-700 bg-blue-900 bg-opacity-30 text-blue-300 font-semibold whitespace-nowrap">
								출석 {study.requiredAttendanceCount}회
							</span>
						) : (
							<span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-gray-700 bg-black bg-opacity-20 text-gray-500 whitespace-nowrap">
								출석 불필요
							</span>
						)}
						{study.assignmentRequired ? (
							<span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-purple-700 bg-purple-900 bg-opacity-30 text-purple-300 font-semibold whitespace-nowrap">
								과제 {study.requiredAssignmentCount}개
							</span>
						) : (
							<span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-gray-700 bg-black bg-opacity-20 text-gray-500 whitespace-nowrap">
								과제 불필요
							</span>
						)}
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
						<StudySessionList study={study} isMember={isMember} isAdmin={isAdmin} />
					</div>
				)}

				{/* ── 탭 2: 멤버 조회 ── */}
				{activeTab === 'members' && (
					<StudyMemberList study={study} isAdmin={isAdmin} onMemberUpdated={fetchStudy} />
				)}

			</main>

			<footer className="w-full text-left mt-10">
				<Footer />
			</footer>
		</div>
	);
};

export default StudyDetail;
