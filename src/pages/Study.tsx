import { useEffect, useState } from 'react';
import { CreateStudyModal, JoinStudyModal, UpdateStudyModal, DeleteStudyModal, Header, Footer } from '@components';
import { studyApi } from '@apis';
import { Study, StudyUser } from '@types';
import { Logger } from '@utils';
import { useAlert } from '@contexts';

interface StudyWithDetail extends Study {
	adminNames: string[];
	memberCount: number;
	isCurrentUserAdmin: boolean;
}

const StudyPage = () => {
	const { showAlert } = useAlert();
	const [studies, setStudies] = useState<Study[]>([]);
	const [studyDetails, setStudyDetails] = useState<Record<number, StudyWithDetail>>({});
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
	const [page, setPage] = useState<number>(0);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
	const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
	const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
	const [updateTargetStudy, setUpdateTargetStudy] = useState<Study | null>(null);
	const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
	const [deleteTargetStudy, setDeleteTargetStudy] = useState<Study | null>(null);
	const [isDeleting, setIsDeleting] = useState<boolean>(false);

	const getCurrentUserEmail = (): string | null => {
		const storedUser = localStorage.getItem('user');
		const currentUser = storedUser ? JSON.parse(storedUser) : null;
		return currentUser?.data?.email?.toLowerCase().trim() ?? null;
	};

	const fetchStudies = async () => {
		setLoading(true);
		try {
			const result = await studyApi.getStudies(page, 10);
			const content: Study[] = result.data?.content || result.content || [];
			setStudies(content);
			setTotalPages(result.data?.totalPages || result.totalPages || 1);

			// 각 스터디의 상세 정보(members + roles)를 병렬로 가져옴
			const currentUserEmail = getCurrentUserEmail();
			const detailEntries = await Promise.all(
				content.map(async (study: Study) => {
					try {
						const detail = await studyApi.getStudy(study.id);
						const detailData = detail.data || detail;
						const members: StudyUser[] = detailData.members || [];
						const admins = members.filter((m) => m.role === 'ADMIN');
						const memberCount = members.filter((m) => m.role === 'MEMBER').length;
						const isCurrentUserAdmin = currentUserEmail
							? admins.some((a) => a.email.toLowerCase().trim() === currentUserEmail)
							: false;
						return [study.id, {
							...detailData,
							adminNames: admins.map((a) => a.name),
							memberCount,
							isCurrentUserAdmin,
						}] as [number, StudyWithDetail];
					} catch {
						return [study.id, {
							...study,
							adminNames: [],
							memberCount: 0,
							isCurrentUserAdmin: false,
						}] as [number, StudyWithDetail];
					}
				})
			);
			setStudyDetails(Object.fromEntries(detailEntries));
		} catch (err: any) {
			Logger.error('Failed to fetch studies:', err);
			setError(err instanceof Error ? err.message : 'Unknown error');
		} finally {
			setLoading(false);
		}
	};

	const handleStudyClick = (study: Study) => {
		const detail = studyDetails[study.id];
		const currentUserEmail = getCurrentUserEmail();
		if (currentUserEmail && detail) {
			const members: StudyUser[] = (detail as any).members || [];
			const userInStudy = members.find(
				(m) => m.email.toLowerCase().trim() === currentUserEmail
			);
			if (userInStudy?.role === 'ADMIN' || userInStudy?.role === 'MEMBER') {
				window.location.href = `/study/${study.id}`;
				return;
			}
		}
		setSelectedStudy(study);
		setShowJoinModal(true);
	};

	useEffect(() => {
		fetchStudies();
	}, [page]);

	const handleDeleteStudy = async () => {
		if (!deleteTargetStudy) return;
		setIsDeleting(true);
		try {
			await studyApi.deleteStudy(deleteTargetStudy.id);
			setShowDeleteModal(false);
			setDeleteTargetStudy(null);
			fetchStudies();
		} catch (err: any) {
			Logger.error('Delete Error:', err);
			showAlert('error', '삭제 실패: ' + (err.response?.data?.message || err.message || '알 수 없는 오류'));
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="flex flex-col items-start min-h-screen bg-[#1A1A1A] font-Pretendard">
			<header className="pl-[10%] pr-[10%] w-full text-left">
				<Header />
			</header>

			<main className="flex-grow w-full max-w-5xl mx-auto px-5 pt-10 pb-20">
				{/* 타이틀 & Create 버튼 */}
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-white">스터디 그룹</h1>
						<p className="text-gray-400 mt-1 text-sm">참여할 스터디를 선택하거나 직접 스터디를 만들어 보세요.</p>
					</div>
					<button
						onClick={() => setShowCreateModal(true)}
						className="bg-[#CAFF33] text-black px-5 py-2 rounded-full font-bold hover:bg-[#b0e82e] transition"
					>
						+ Create Study
					</button>
				</div>

				{/* 로딩 / 에러 / 빈 상태 */}
				{loading && (
					<p className="text-center text-gray-400 mt-20">스터디 목록을 불러오는 중...</p>
				)}
				{!loading && error && (
					<p className="text-center text-red-400 mt-20">{error}</p>
				)}
				{!loading && !error && studies.length === 0 && (
					<p className="text-center text-gray-400 mt-20">🚀 진행 중인 스터디가 없습니다.</p>
				)}

				{/* 카드 그리드 */}
				{!loading && !error && studies.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						{studies.map((study) => {
							const detail = studyDetails[study.id];
							return (
								<div
									key={study.id}
									className="bg-[#2A2A2A] border border-gray-700 rounded-xl p-6 flex flex-col gap-3 cursor-pointer hover:border-[#CAFF33] hover:shadow-[0_0_14px_rgba(202,255,51,0.15)] transition-all duration-200"
									onClick={() => handleStudyClick(study)}
								>
									{/* 상단 - 제목 + 수정 버튼 */}
									<div className="flex justify-between items-start">
										<h2 className="text-lg font-bold text-white leading-tight">{study.title}</h2>
										{detail?.isCurrentUserAdmin && (
											<div className="flex items-center gap-1 ml-3 shrink-0">
												<button
													onClick={(e) => {
														e.stopPropagation();
														setUpdateTargetStudy(detail as unknown as Study);
														setShowUpdateModal(true);
													}}
													className="text-xs px-3 py-1 bg-gray-700 text-gray-300 rounded-full hover:bg-[#CAFF33] hover:text-black transition"
												>
													수정
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation();
														setDeleteTargetStudy(detail as unknown as Study);
														setShowDeleteModal(true);
													}}
													className="text-xs px-3 py-1 bg-gray-700 text-gray-300 rounded-full hover:bg-red-600 hover:text-white transition"
												>
													삭제
												</button>
											</div>
										)}
									</div>

									{/* 설명 */}
									<p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
										{study.description || '설명이 없습니다.'}
									</p>

									{/* 하단 - 관리자 / 멤버수 */}
									<div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-700 text-sm">
										<div className="text-gray-400">
											<span className="text-gray-500">Admin</span>{' '}
											<span className="text-gray-200 font-medium">
												{detail?.adminNames?.length
													? detail.adminNames.join(', ')
													: '—'
												}
											</span>
										</div>
										<div className="text-gray-400">
											<span className="text-gray-500">Members</span>{' '}
											<span className="text-gray-200 font-medium">
												{detail ? `${detail.memberCount}명` : '—'}
											</span>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}

				{/* 페이지네이션 */}
				{totalPages > 1 && (
					<div className="flex justify-center mt-10 gap-2">
						<button
							onClick={() => setPage((p) => Math.max(p - 1, 0))}
							disabled={page === 0}
							className="px-3 py-1.5 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-40 transition"
						>
							이전
						</button>
						{Array.from({ length: totalPages }, (_, i) => (
							<button
								key={i}
								onClick={() => setPage(i)}
								className={`px-3 py-1.5 rounded-full transition ${page === i ? 'bg-[#CAFF33] text-black font-bold' : 'bg-gray-700 text-white hover:bg-gray-600'
									}`}
							>
								{i + 1}
							</button>
						))}
						<button
							onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
							disabled={page === totalPages - 1}
							className="px-3 py-1.5 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-40 transition"
						>
							다음
						</button>
					</div>
				)}
			</main>

			{/* 모달 */}
			{showCreateModal && (
				<CreateStudyModal
					onClose={() => setShowCreateModal(false)}
					onCreated={fetchStudies}
				/>
			)}
			{showJoinModal && selectedStudy && (
				<JoinStudyModal
					study={selectedStudy}
					onClose={() => setShowJoinModal(false)}
				/>
			)}
			{showUpdateModal && updateTargetStudy && (
				<UpdateStudyModal
					study={updateTargetStudy}
					onClose={() => setShowUpdateModal(false)}
					onUpdated={fetchStudies}
				/>
			)}

			{/* 삭제 확인 모달 */}
			{showDeleteModal && deleteTargetStudy && (
				<DeleteStudyModal
					study={deleteTargetStudy}
					isDeleting={isDeleting}
					onConfirm={handleDeleteStudy}
					onClose={() => {
						setShowDeleteModal(false);
						setDeleteTargetStudy(null);
					}}
				/>
			)}

			<footer className="w-full text-left mt-auto">
				<Footer />
			</footer>
		</div>
	);
};

export default StudyPage;