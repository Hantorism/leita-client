import React, { useEffect, useState } from 'react';
import { Logger } from '@utils';
import { studyApi } from '@apis';
import { Study, StudyUser } from '@types';
import { Header, Footer } from '@containers';
import { StudySessionList, MemberManagement } from '@components';
import { useParams } from 'react-router-dom';

const StudyDetail = () => {
	const { id } = useParams();
	const [study, setStudy] = useState<Study | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [isMember, setIsMember] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);

	const fetchStudy = async () => {
		if (!id) return;
		try {
			const result = await studyApi.getStudyById(parseInt(id, 10));
			const studyData = result.data || result;
			setStudy(studyData);
			console.log(study);
			document.title = `${studyData.title} | Leita`;

			// Check roles
			const storedUser = localStorage.getItem('user');
			const currentUser = storedUser ? JSON.parse(storedUser) : null;
			const currentUserEmail = currentUser?.data?.email?.toLowerCase().trim();

			if (currentUserEmail) {
				const currentStudyUser = studyData.members?.find((m: any) => m.email.toLowerCase().trim() === currentUserEmail);
				if (currentStudyUser) {
					setIsAdmin(currentStudyUser.role === 'ADMIN');
					setIsMember(currentStudyUser.role === 'MEMBER');
				} else {
					setIsAdmin(false);
					setIsMember(false);
				}
			}

		} catch (err: any) {
			Logger.error("스터디 정보를 불러오는 데 실패했습니다:", err);
			setError("스터디 정보를 불러올 수 없습니다.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchStudy();
	}, [id]);

	if (loading) return <div className="min-h-screen bg-[#1A1A1A] text-white text-center pt-20">스터디 정보를 불러오는 중...</div>;
	if (error) return <div className="min-h-screen bg-[#1A1A1A] text-white text-center pt-20">{error}</div>;
	if (!study) return <div className="min-h-screen bg-[#1A1A1A] text-white text-center pt-20">스터디를 찾을 수 없습니다.</div>;

	return (
		<div className="flex flex-col min-h-screen bg-[#1A1A1A] text-white font-Pretendard">
			<header className="pl-[10%] pr-[10%] w-full text-left pt-[3%]">
				<Header />
			</header>

			<main className="flex-grow flex flex-col items-center py-10 px-5 max-w-5xl mx-auto w-full">
				<div className="w-full bg-[#2A2A2A] bg-opacity-80 p-8 rounded-lg shadow-lg border border-gray-600">
					<div className="flex justify-between items-start">
						<div>
							<h1 className="text-3xl font-bold text-[#CAFF33]">{study.title}</h1>
							<p className="text-gray-400 mt-4 text-lg">{study.description}</p>
						</div>
					</div>
					
					<div className="mt-6 p-4 bg-black bg-opacity-30 rounded-lg">
						<h3 className="text-xl font-semibold mb-2">수료 조건</h3>
						<ul className="text-gray-300 space-y-1">
							<li>• 출석: {study.attendanceCheckRequired ? `${study.requiredAttendanceCount}회 필요` : '필요 없음'}</li>
							<li>• 과제: {study.assignmentRequired ? `${study.requiredAssignmentCount}개 필요` : '필요 없음'}</li>
						</ul>
					</div>
				</div>

				{/* Sessions and Attendance */}
				<StudySessionList study={study} isMember={isMember} isAdmin={isAdmin} />

				<div className="flex flex-col md:flex-row w-full gap-8 mt-10 mb-10">
					<div className="flex-1">
						<h2 className="text-2xl font-semibold border-b border-gray-600 pb-3 pl-2">관리자</h2>
						<ul className="mt-4 space-y-3">
							{study.members?.filter((m: any) => m.role === 'ADMIN').map((admin: any, index: number) => (
								<li key={index} className="flex items-center gap-4 bg-white bg-opacity-5 p-4 rounded-lg">
									<div className="w-12 h-12 rounded-full border-2 border-gray-500 bg-gray-700 flex items-center justify-center font-bold text-gray-300 uppercase">
										{admin.name.charAt(0)}
									</div>
									<div>
										<span className="block text-lg font-medium">{admin.name}</span>
										<span className="block text-sm text-gray-400">{admin.email}</span>
									</div>
								</li>
							))}
							{(!study.members || study.members.filter((m: any) => m.role === 'ADMIN').length === 0) && (
								<li className="text-gray-500 pl-2">관리자가 없습니다.</li>
							)}
						</ul>
					</div>

					<div className="flex-1">
						<h2 className="text-2xl font-semibold border-b border-gray-600 pb-3 pl-2">일반 멤버</h2>
						<ul className="mt-4 space-y-3">
							{study.members?.filter((m: any) => m.role === 'MEMBER').map((member: any, index: number) => (
								<li key={index} className="flex items-center gap-4 p-4 bg-white bg-opacity-5 rounded-lg">
									<div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center font-bold text-gray-300 uppercase">
										{member.name.charAt(0)}
									</div>
									<div>
										<span className="block text-md font-medium text-gray-200">{member.name}</span>
										<span className="block text-sm text-gray-500">{member.email}</span>
									</div>
								</li>
							))}
							{(!study.members || study.members.filter((m: any) => m.role === 'MEMBER').length === 0) && (
								<li className="text-gray-500 pl-2">일반 멤버가 없습니다.</li>
							)}
						</ul>
					</div>
				</div>

				{/* Member Management UI (Admin Only) */}
				{isAdmin && <MemberManagement studyId={study.id} />}
			</main>

			<footer className="w-full text-left mt-10">
				<Footer />
			</footer>
		</div>
	);
};

export default StudyDetail;
