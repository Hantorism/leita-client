import { useState, useEffect } from 'react';
import { studySessionApi } from '@apis';
import { Study } from '@types';
import { Logger } from '@utils';
import { useAlert } from '@contexts';

interface StudyProgressTabProps {
	study: Study;
	onOpenProgressModal: (member: any, sessionId?: number) => void;
}

interface SessionProgress {
	id: number;
	startDateTime: string;
	attendanceStatus: string;
	assignmentCreated: boolean;
	attendanceRecords: Record<string, string>;
}

const StudyProgressTab = ({ study, onOpenProgressModal }: StudyProgressTabProps) => {
	const { showAlert } = useAlert();
	const [sessionsProgress, setSessionsProgress] = useState<SessionProgress[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchProgress = async () => {
			setLoading(true);
			try {
				const res = await studySessionApi.getStudySessions(study.id, 0, 100);
				const sessions = res.data?.content || res.content || [];

				const progressData: SessionProgress[] = await Promise.all(
					sessions.map(async (sec: any) => {
						const attendanceRecords: Record<string, string> = {};

						if (sec.attendanceStatus === 'OPEN' || sec.attendanceStatus === 'CLOSED') {
							try {
								const attRes = await studySessionApi.getAttendance(sec.id);
								const records = attRes.data?.records || attRes.records || [];
								records.forEach((r: any) => {
									attendanceRecords[r.userEmail] = r.status;
								});
							} catch (e) {
								Logger.error('Failed to fetch attendance for session', sec.id);
							}
						}

						return {
							id: sec.id,
							startDateTime: sec.startDateTime,
							attendanceStatus: sec.attendanceStatus,
							assignmentCreated: sec.assignmentCreated,
							attendanceRecords,
						};
					})
				);

				progressData.sort((a, b) => a.id - b.id);
				setSessionsProgress(progressData);
			} catch (err) {
				Logger.error('Failed to fetch study progress', err);
				showAlert('error', '현황을 불러오지 못했습니다.');
			} finally {
				setLoading(false);
			}
		};

		fetchProgress();
	}, [study.id, showAlert]);

	const getCellColor = (session: SessionProgress, email: string) => {
		if (session.attendanceStatus === 'BEFORE') {
			return 'bg-[#2A2A2A] border-[#3A3A3A]'; // Future session (grayish)
		}

		const attStatus = session.attendanceRecords[email];
		const isAttended = attStatus === 'PRESENT' || attStatus === 'LATE';
		const isAbsent = attStatus === 'ABSENT';

		const isAssignmentCompleted = false; // Mocked since individual submission API is missing

		if (!session.assignmentCreated) {
			if (isAttended) return 'bg-[#CAFF33] border-[#CAFF33]';
			if (isAbsent) return 'bg-red-500 border-red-500';
			return 'bg-[#2A2A2A] border-[#3A3A3A]';
		} else {
			if (isAttended && isAssignmentCompleted) return 'bg-[#CAFF33] border-[#CAFF33]';
			if (!isAttended && !isAssignmentCompleted && isAbsent) return 'bg-red-500 border-red-500';
			if (isAttended || isAssignmentCompleted) return 'bg-yellow-400 border-yellow-400';

			return 'bg-[#2A2A2A] border-[#3A3A3A]';
		}
	};

	const currentUserEmail = (() => {
		const storedUser = localStorage.getItem('user');
		const user = storedUser ? JSON.parse(storedUser) : null;
		return user?.data?.email?.toLowerCase().trim();
	})();

	const sortedMembers = [...study.members].sort((a, b) => {
		const aEmail = a.email?.toLowerCase().trim();
		const bEmail = b.email?.toLowerCase().trim();
		if (aEmail === currentUserEmail) return -1;
		if (bEmail === currentUserEmail) return 1;
		return 0;
	});

	if (loading) {
		return <div className="text-center text-gray-400 py-10">데이터를 불러오는 중입니다...</div>;
	}

	return (
		<>
			<div className="w-full animate-fadeIn font-Pretendard bg-[#1f1f1f] border border-gray-700/50 rounded-2xl p-6 overflow-hidden">
				<div className="flex border border-gray-700/50 rounded-lg overflow-hidden">
					{/* 1열: 멤버 목록 (왼쪽 고정) */}
					<div className="w-32 flex-shrink-0 bg-[#1f1f1f] border-r border-gray-700/50">
						<table className="w-full text-left border-collapse">
							<thead>
								<tr className="h-[64px]">
									<th className="px-4 text-gray-400 font-semibold text-sm border-b border-gray-700">멤버</th>
								</tr>
							</thead>
							<tbody>
								{sortedMembers.map((member) => (
									<tr key={member.userId} className="h-[64px]">
										<td className="px-3 border-b border-gray-700/50 max-w-[128px]">
											<div className="flex flex-col justify-center w-full min-w-0">
												<span className="block text-white font-medium text-sm truncate leading-tight w-full" title={member.name}>
													{member.name}
												</span>
												<span className="block text-gray-400 text-[10px] truncate leading-tight mt-0.5 w-full" title={member.email}>
													{member.email}
												</span>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* 나머지 열: 주차별 데이터 (가로 스크롤 가능) */}
					<div className="flex-grow overflow-x-auto custom-scrollbar bg-[#1a1a1a]">
						<table className="w-full text-center border-collapse min-w-max">
							<thead>
								<tr className="h-[64px]">
									{sessionsProgress.map((sec: any, idx: number) => (
										<th key={sec.id} className="px-4 text-gray-400 font-semibold text-xs border-b border-gray-700 min-w-[60px]">
											{idx + 1}회차
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{sortedMembers.map((member) => (
									<tr key={member.userId} className="h-[64px] hover:bg-white/5 transition-colors">
										{sessionsProgress.map((sec: any) => (
											<td key={sec.id} className="px-3 border-b border-gray-700/50">
												<div className="flex justify-center">
													<div
														onClick={() => onOpenProgressModal(member, sec.id)}
														className={`w-5 h-5 rounded-sm border ${getCellColor(sec, member.email)} transition-all cursor-pointer hover:scale-125 hover:shadow-[0_0_8px_rgba(202,255,51,0.5)]`}
													/>
												</div>
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{sessionsProgress.length === 0 && (
					<div className="text-center text-gray-500 py-10">진행된 세션이 없습니다.</div>
				)}

				<div className="mt-8 flex flex-wrap gap-5 text-xs text-gray-400 border-t border-gray-700/50 pt-5">
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-sm bg-[#CAFF33]"></div>
						<span>출석 과제 모두 완료</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-sm bg-yellow-400"></div>
						<span>하나만 완료</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-sm bg-red-500"></div>
						<span>모두 미완료</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-sm bg-[#2A2A2A] border border-[#3A3A3A]"></div>
						<span>미진행</span>
					</div>
				</div>
			</div>
		</>
	);
};

export default StudyProgressTab;
