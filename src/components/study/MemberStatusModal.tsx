import { useState, useEffect } from 'react';
import { studyApi, studySessionApi } from '@apis';
import { StudyUser } from '@types';
import { useAlert } from '@contexts';

interface SessionData {
	id: number;
	startDateTime: string;
	attendanceStatus: string;
	assignmentCreated: boolean;
	userAttendance: string | null;
	assignmentTitle: string | null;
}

interface MemberStatusModalProps {
	studyId: number;
	member: StudyUser;
	onClose: () => void;
}

const MemberStatusModal = ({ studyId, member, onClose }: MemberStatusModalProps) => {
	const { showAlert } = useAlert();
	const [memberSessions, setMemberSessions] = useState<SessionData[]>([]);
	const [loadingProgress, setLoadingProgress] = useState(false);

	useEffect(() => {
		const fetchMemberProgress = async () => {
			setLoadingProgress(true);
			try {
				const sessionsRes = await studySessionApi.getStudySessions(studyId, 0, 100);
				const sessions = sessionsRes.data?.content || sessionsRes.content || [];
				
				const sessionDataList: SessionData[] = await Promise.all(
					sessions.map(async (sec: any) => {
						let userAttendance = null;
						if (sec.attendanceStatus === 'OPEN' || sec.attendanceStatus === 'CLOSED') {
							try {
								const attRes = await studySessionApi.getAttendance(sec.id);
								const attData = attRes.data || attRes;
								const record = attData.records?.find((r: any) => r.userEmail === member.email);
								userAttendance = record ? record.status : 'ABSENT';
							} catch {
								userAttendance = 'UNKNOWN';
							}
						}
						
						let assignmentTitle = null;
						if (sec.assignmentCreated) {
							try {
								const asgRes = await studySessionApi.getAssignment(sec.id);
								const asgData = asgRes.data || asgRes;
								assignmentTitle = asgData.title;
							} catch {
								assignmentTitle = '조회 실패';
							}
						}

						return {
							id: sec.id,
							startDateTime: sec.startDateTime,
							attendanceStatus: sec.attendanceStatus,
							assignmentCreated: sec.assignmentCreated,
							userAttendance,
							assignmentTitle
						};
					})
				);
				
				// 최신 세션이 위로 오도록 정렬
				sessionDataList.sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime());
				setMemberSessions(sessionDataList);
			} catch (err) {
				showAlert('error', '현황을 불러오지 못했습니다.');
				onClose();
			} finally {
				setLoadingProgress(false);
			}
		};

		fetchMemberProgress();
	}, [studyId, member, showAlert, onClose]);

	return (
		<div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 font-NanumSquare backdrop-blur-sm animate-fadeIn p-4">
			<div className="bg-[#1f1f1f] border border-gray-700/50 rounded-2xl p-8 w-full max-w-lg shadow-2xl text-white flex flex-col max-h-[90vh]">
				<h2 className="text-xl font-bold mb-6 text-[#CAFF33] text-center">
					{member.name} 님의 현황
				</h2>
				
				<div className="flex-1 overflow-y-auto pr-2 min-h-[150px] custom-scrollbar space-y-4">
					{loadingProgress ? (
						<div className="text-center text-gray-400 py-10 font-bold">세션 데이터를 불러오는 중입니다...</div>
					) : memberSessions.length === 0 ? (
						<div className="text-center text-gray-400 py-10">진행된 스터디 세션이 없습니다.</div>
					) : (
						memberSessions.map(sec => (
							<div key={sec.id} className="bg-[#2a2a2a] border border-gray-700/50 rounded-xl p-5">
								<div className="text-sm text-[#CAFF33] mb-3 font-semibold pb-2 border-b border-gray-700">
									{new Date(sec.startDateTime).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
								</div>
								
								<div className="grid grid-cols-2 gap-4">
									{/* 출석 현황 */}
									<div className="flex flex-col gap-1.5">
										<span className="text-xs text-gray-500 font-bold uppercase tracking-wider">출석 현황</span>
										{sec.userAttendance === 'PRESENT' ? (
											<span className="text-green-400 font-bold text-sm">출석 완료 ✅</span>
										) : sec.userAttendance === 'LATE' ? (
											<span className="text-yellow-400 font-bold text-sm">지각 ⚠️</span>
										) : sec.userAttendance === 'ABSENT' ? (
											<span className="text-red-400 font-bold text-sm">결석 ❌</span>
										) : sec.userAttendance === 'UNKNOWN' ? (
											<span className="text-gray-500 font-bold text-sm">확인 불가</span>
										) : (
											<span className="text-gray-500 font-bold text-sm">출석 미진행</span>
										)}
									</div>
									
									{/* 과제 현황 */}
									<div className="flex flex-col gap-1.5 min-w-0">
										<span className="text-xs text-gray-500 font-bold uppercase tracking-wider">과제</span>
										{sec.assignmentTitle ? (
											<div className="flex flex-col min-w-0">
												<span className="text-gray-200 font-medium text-sm truncate" title={sec.assignmentTitle}>
													{sec.assignmentTitle}
												</span>
												<span className="text-[10px] text-gray-500 mt-1 whitespace-nowrap">개인별 제출 상태 지원 안됨</span>
											</div>
										) : (
											<span className="text-gray-500 font-bold text-sm">과제 없음</span>
										)}
									</div>
								</div>
							</div>
						))
					)}
				</div>
				
				<div className="mt-8 pt-4 border-t border-gray-700">
					<button
						className="w-full px-4 py-2.5 bg-gray-600 text-white rounded-full font-bold hover:bg-gray-500 transition"
						onClick={onClose}
					>
						닫기
					</button>
				</div>
			</div>
		</div>
	);
};

export default MemberStatusModal;
