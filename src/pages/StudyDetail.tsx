import { useEffect, useState } from 'react';
import { Logger } from '@utils';
import { studyApi } from '@apis';
import { Study } from '@types';
import { StudySessionList, MemberManagement, Header, Footer } from '@components';
import { useParams } from 'react-router-dom';

type Tab = 'info' | 'sessions' | 'members';

const TAB_LABELS: { key: Tab; label: string }[] = [
	{ key: 'info',     label: '스터디 정보' },
	{ key: 'sessions', label: '세션 목록'   },
	{ key: 'members',  label: '멤버 조회'   },
];

const StudyDetail = () => {
	const { id } = useParams();
	const [study, setStudy]     = useState<Study | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError]     = useState<string | null>(null);
	const [isMember, setIsMember] = useState(false);
	const [isAdmin, setIsAdmin]   = useState(false);
	const [activeTab, setActiveTab] = useState<Tab>('info');

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

				{/* 스터디 제목 */}
				<div className="w-full mb-6">
					<h1 className="text-3xl font-bold text-[#CAFF33]">{study.title}</h1>
					<p className="text-gray-400 mt-2 text-sm">{study.description}</p>
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

				{/* ── 탭 1: 스터디 정보 ── */}
				{activeTab === 'info' && (
					<div className="w-full space-y-6 animate-fadeIn">
						{/* 기본 정보 카드 */}
						<div className="bg-[#2A2A2A] border border-gray-700 rounded-xl p-6 space-y-4">
							<h2 className="text-xl font-semibold text-white">기본 정보</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
								<div className="bg-black bg-opacity-30 rounded-lg p-4">
									<span className="block text-gray-500 mb-1">시작일</span>
									<span className="text-gray-200">{study.startDate ? new Date(study.startDate).toLocaleDateString() : '미정'}</span>
								</div>
								<div className="bg-black bg-opacity-30 rounded-lg p-4">
									<span className="block text-gray-500 mb-1">종료일</span>
									<span className="text-gray-200">{study.endDate ? new Date(study.endDate).toLocaleDateString() : '미정'}</span>
								</div>
								<div className="bg-black bg-opacity-30 rounded-lg p-4">
									<span className="block text-gray-500 mb-1">요구 사항</span>
									<span className="text-gray-200 whitespace-pre-wrap">{study.requirement || '없음'}</span>
								</div>
							</div>
						</div>

						{/* 수료 조건 카드 */}
						<div className="bg-[#2A2A2A] border border-gray-700 rounded-xl p-6">
							<h2 className="text-xl font-semibold text-white mb-4">수료 조건</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
								<div className={`rounded-lg p-4 border ${study.attendanceRequired ? 'border-blue-700 bg-blue-900 bg-opacity-20' : 'bg-black bg-opacity-20 border-gray-700'}`}>
									<span className="block text-gray-400 mb-1">출석</span>
									{study.attendanceRequired
										? <span className="text-blue-300 font-semibold">{study.requiredAttendanceCount}회 필요</span>
										: <span className="text-gray-500">필요 없음</span>
									}
								</div>
								<div className={`rounded-lg p-4 border ${study.assignmentRequired ? 'border-purple-700 bg-purple-900 bg-opacity-20' : 'bg-black bg-opacity-20 border-gray-700'}`}>
									<span className="block text-gray-400 mb-1">과제</span>
									{study.assignmentRequired
										? <span className="text-purple-300 font-semibold">{study.requiredAssignmentCount}개 필요</span>
										: <span className="text-gray-500">필요 없음</span>
									}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* ── 탭 2: 세션 목록 ── */}
				{activeTab === 'sessions' && (
					<div className="w-full animate-fadeIn">
						<StudySessionList study={study} isMember={isMember} isAdmin={isAdmin} />
					</div>
				)}

				{/* ── 탭 3: 멤버 조회 ── */}
				{activeTab === 'members' && (
					<div className="w-full space-y-8 animate-fadeIn">
						{/* 관리자 */}
						<div className="bg-[#2A2A2A] border border-gray-700 rounded-xl p-6">
							<h2 className="text-xl font-semibold mb-4">관리자</h2>
							<ul className="space-y-3">
								{study.members?.filter((m: any) => m.role === 'ADMIN').map((admin: any, i: number) => (
									<li key={i} className="flex items-center gap-4 bg-black bg-opacity-20 p-4 rounded-lg">
										<div className="w-11 h-11 rounded-full border-2 border-[#CAFF33] bg-gray-700 flex items-center justify-center font-bold text-white uppercase">
											{admin.name.charAt(0)}
										</div>
										<div>
											<span className="block font-medium">{admin.name}</span>
											<span className="block text-sm text-gray-400">{admin.email}</span>
										</div>
										<span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#CAFF33] bg-opacity-20 text-[#CAFF33]">Admin</span>
									</li>
								))}
								{(!study.members || study.members.filter((m: any) => m.role === 'ADMIN').length === 0) && (
									<li className="text-gray-500 text-sm pl-1">관리자가 없습니다.</li>
								)}
							</ul>
						</div>

						{/* 일반 멤버 */}
						<div className="bg-[#2A2A2A] border border-gray-700 rounded-xl p-6">
							<h2 className="text-xl font-semibold mb-4">일반 멤버</h2>
							<ul className="space-y-3">
								{study.members?.filter((m: any) => m.role === 'MEMBER').map((member: any, i: number) => (
									<li key={i} className="flex items-center gap-4 bg-black bg-opacity-20 p-4 rounded-lg">
										<div className="w-11 h-11 rounded-full bg-gray-600 flex items-center justify-center font-bold text-gray-300 uppercase">
											{member.name.charAt(0)}
										</div>
										<div>
											<span className="block font-medium text-gray-200">{member.name}</span>
											<span className="block text-sm text-gray-500">{member.email}</span>
										</div>
										<span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">Member</span>
									</li>
								))}
								{(!study.members || study.members.filter((m: any) => m.role === 'MEMBER').length === 0) && (
									<li className="text-gray-500 text-sm pl-1">일반 멤버가 없습니다.</li>
								)}
							</ul>
						</div>

						{/* 멤버 관리 (관리자 전용) */}
						{isAdmin && (
							<div className="bg-[#2A2A2A] border border-gray-700 rounded-xl p-6">
								<h2 className="text-xl font-semibold mb-4">멤버 관리 <span className="text-xs text-gray-400 font-normal ml-2">관리자 전용</span></h2>
								<MemberManagement studyId={study.id} onMemberUpdated={fetchStudy} />
							</div>
						)}
					</div>
				)}
			</main>

			<footer className="w-full text-left mt-10">
				<Footer />
			</footer>
		</div>
	);
};

export default StudyDetail;
