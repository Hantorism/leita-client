import { useState, useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import { studySessionApi, problemApi } from '@apis';
import { StudySession, Study, StudyUser } from '@types';
import { useAlert } from '@contexts';
import { Button } from '@components';

interface StudyProgressModalProps {
	study: Study;
	member: StudyUser;
	initialSessionId?: number;
	onClose: () => void;
}

// ── Searchable Dropdown Helper ──
const SearchableDropdown = ({ options, value, onChange, placeholder }: any) => {
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState('');
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const filteredOptions = options.filter((opt: any) =>
		opt.label.toLowerCase().includes(search.toLowerCase())
	);
	const selectedOption = options.find((opt: any) => opt.value === value);

	return (
		<div className="relative w-full" ref={ref}>
			<div
				className="bg-[#2A2A2A] border border-gray-600 rounded-lg p-2.5 flex justify-between items-center cursor-pointer text-sm font-medium"
				onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
			>
				<span className="truncate pr-2 text-gray-200">{selectedOption ? selectedOption.label : placeholder}</span>
				<span className="text-gray-400 text-xs text-opacity-50">▼</span>
			</div>
			{isOpen && (
				<div className="absolute top-12 left-0 w-full bg-[#2A2A2A] border border-gray-600 rounded-lg shadow-2xl z-50 max-h-60 flex flex-col overflow-hidden">
					<input
						type="text"
						className="bg-[#1f1f1f] text-white p-2.5 border-b border-gray-600 text-sm outline-none placeholder-gray-500"
						placeholder="검색..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						onClick={(e) => e.stopPropagation()}
						autoFocus
					/>
					<div className="overflow-y-auto custom-scrollbar flex-1">
						{filteredOptions.length > 0 ? (
							filteredOptions.map((opt: any) => (
								<div
									key={opt.value}
									className="p-2.5 hover:bg-[#3A3A3A] cursor-pointer text-sm truncate text-gray-300 transition-colors"
									onClick={() => { onChange(opt.value); setIsOpen(false); }}
								>
									{opt.label}
								</div>
							))
						) : (
							<div className="p-3 text-gray-500 text-sm text-center">결과 없음</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

const StudyProgressModal = ({ study, member: initialMember, initialSessionId, onClose }: StudyProgressModalProps) => {
	const { showAlert } = useAlert();
	const [sessions, setSessions] = useState<StudySession[]>([]);
	const [selectedSessionId, setSelectedSessionId] = useState<number | ''>(initialSessionId || '');
	const [selectedMemberEmail, setSelectedMemberEmail] = useState<string>(initialMember.email);

	const [loading, setLoading] = useState(false);

	// Data states
	const [sessionDetail, setSessionDetail] = useState<any>(null);
	const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
	const [assignment, setAssignment] = useState<any>(null);
	const [assignmentProblems, setAssignmentProblems] = useState<any[]>([]);

	const currentUserStr = localStorage.getItem('user');
	const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
	const currentLoggedInEmail = currentUser?.data?.email?.toLowerCase().trim();
	const isAdmin = study.members.find(m => m.email.toLowerCase().trim() === currentLoggedInEmail)?.role === 'ADMIN';

	useEffect(() => {
		const fetchSessions = async () => {
			try {
				const res = await studySessionApi.getStudySessions(study.id, 0, 100);
				const data = res.data?.content || res.content || [];
				// 최신 세션이 위로 오도록 정렬
				data.sort((a: any, b: any) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime());
				setSessions(data);
				if (data.length > 0 && !initialSessionId) {
					setSelectedSessionId(data[0].id);
				}
			} catch (err) {
				showAlert('error', '세션 목록을 불러오지 못했습니다.');
			}
		};
		fetchSessions();
	}, [study.id, showAlert, initialSessionId]);

	useEffect(() => {
		if (selectedSessionId === '') return;

		const fetchSessionData = async () => {
			setLoading(true);
			try {
				const currentSession = sessions.find(s => s.id === selectedSessionId);
				setSessionDetail(currentSession || null);

				// Fetch Attendance
				if (currentSession?.attendanceStatus === 'OPEN' || currentSession?.attendanceStatus === 'CLOSED') {
					try {
						const attRes = await studySessionApi.getAttendance(Number(selectedSessionId));
						setAttendanceRecords(attRes.data?.records || attRes.records || []);
					} catch {
						setAttendanceRecords([]);
					}
				} else {
					setAttendanceRecords([]);
				}

				// Fetch Assignment
				if (currentSession?.assignmentCreated) {
					try {
						const asgRes = await studySessionApi.getAssignment(Number(selectedSessionId));
						const asgData = asgRes.data || asgRes;
						setAssignment(asgData);

						if (asgData.problemIds && asgData.problemIds.length > 0) {
							const problemsRes = await Promise.all(
								asgData.problemIds.map((pid: number) => problemApi.getProblem(pid).catch(() => null))
							);
							setAssignmentProblems(problemsRes.map(p => p?.data || p).filter(Boolean));
						} else if (asgData.problems) {
							setAssignmentProblems(asgData.problems);
						} else {
							setAssignmentProblems([]);
						}
					} catch {
						setAssignment(null);
						setAssignmentProblems([]);
					}
				} else {
					setAssignment(null);
					setAssignmentProblems([]);
				}
			} finally {
				setLoading(false);
			}
		};
		fetchSessionData();
	}, [selectedSessionId, sessions]);

	// Prepare Dropdown Options
	const sessionOptions = sessions.map((s, idx) => ({
		value: s.id,
		label: `${sessions.length - idx}회차 세션 (${new Date(s.startDateTime).toLocaleDateString()})`
	}));

	const memberOptions = study.members.map(m => ({
		value: m.email,
		label: `${m.name} (${m.email})`
	}));

	// Derived Data for Selected Member
	const userAttRecord = attendanceRecords.find(r => r.userEmail === selectedMemberEmail);
	const userAttendanceStatus = userAttRecord ? userAttRecord.status : (sessionDetail?.attendanceStatus === 'BEFORE' ? '미진행' : '결석/미출석');

	// --- Mock Handlers for Admin features ---
	const handleUpdateAttendance = (newStatus: string) => {
		if (!isAdmin) return;
		showAlert('success', '출석 정보가 변경되었습니다. (UI 전용 - API 미연동)');
		setAttendanceRecords(prev => {
			const exists = prev.find(r => r.userEmail === selectedMemberEmail);
			if (exists) {
				return prev.map(r => r.userEmail === selectedMemberEmail ? { ...r, status: newStatus } : r);
			} else {
				return [...prev, { userEmail: selectedMemberEmail, status: newStatus }];
			}
		});
	};

	const handleUpdateAssignmentPass = (passed: boolean) => {
		if (!isAdmin) return;
		showAlert('success', `과제 평가가 '${passed ? 'Pass' : 'Fail'}'로 변경되었습니다. (UI 전용 - API 미연동)`);
	};

	// Mock Problem Result
	const getMockProblemStatus = (problemId: number) => {
		const hash = selectedMemberEmail.length + problemId + Number(selectedSessionId);
		if (hash % 3 === 0) return 'CORRECT';
		if (hash % 3 === 1) return 'WRONG';
		return 'UNATTEMPTED';
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 font-Pretendard backdrop-blur-sm animate-fadeIn p-4">
			<div className="bg-[#1a1a1a] border border-gray-700/50 rounded-2xl w-full max-w-5xl shadow-2xl text-white flex flex-col h-[85vh] max-h-[800px] overflow-hidden">
				
				{/* ── Header ── */}
				<div className="p-6 border-b border-gray-700/50 bg-[#1f1f1f] flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0 relative pr-14 sm:pr-16">
					<h2 className="text-xl font-bold text-[#CAFF33] shrink-0">출석/과제 현황</h2>
					
					{/* Dropdowns */}
					<div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
						<div className="w-full sm:w-[260px]">
							<SearchableDropdown 
								options={sessionOptions} 
								value={selectedSessionId} 
								onChange={(val: number) => setSelectedSessionId(val)} 
								placeholder="세션을 선택하세요" 
							/>
						</div>
						<div className="w-full sm:w-[260px]">
							<SearchableDropdown 
								options={memberOptions} 
								value={selectedMemberEmail} 
								onChange={(val: string) => setSelectedMemberEmail(val)} 
								placeholder="멤버를 선택하세요" 
							/>
						</div>
					</div>

					{/* Close Button (X) */}
					<Button 
						variant="ghost"
						onClick={onClose}
						className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors !px-0 !py-0 shadow-none border-none hover:bg-transparent"
						aria-label="Close"
					>
						<FiX size={24} />
					</Button>
				</div>

				{/* ── Content Body ── */}
				<div className="flex-1 overflow-hidden flex flex-row p-6 gap-6 bg-[#171717]">
					
					{/* Left Panel: Attendance */}
					<div className="bg-[#1f1f1f] rounded-xl border border-gray-700/50 p-6 flex flex-col overflow-y-auto custom-scrollbar w-80 shrink-0">
						<h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-200">
							<span className="text-xl">⏱️</span> 출석 정보
						</h3>
						
						{loading ? (
							<div className="text-gray-500 text-sm text-center py-10">데이터 로딩 중...</div>
						) : !sessionDetail ? (
							<div className="text-gray-500 text-sm py-10 text-center">세션 정보가 없습니다.</div>
						) : (
							<div className="space-y-6 flex-1 flex flex-col">
								{/* Session Basic Info */}
								<div className="bg-black/30 rounded-lg p-4 border border-gray-700/30">
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<span className="block text-gray-500 text-xs mb-1">시작 시간</span>
											<span className="text-gray-300">{new Date(sessionDetail.startDateTime).toLocaleString()}</span>
										</div>
										<div>
											<span className="block text-gray-500 text-xs mb-1">종료 시간</span>
											<span className="text-gray-300">{new Date(sessionDetail.endDateTime).toLocaleString()}</span>
										</div>
									</div>
								</div>

								{/* Member Attendance Status */}
								<div>
									<h4 className="text-sm font-semibold text-gray-400 mb-3">유저 출석 상태</h4>
									<div className="flex items-center gap-3 bg-black/30 p-4 rounded-lg border border-gray-700/30">
										<div className={`px-3 py-1.5 rounded text-sm font-bold flex items-center gap-1.5 border
											${userAttendanceStatus === 'PRESENT' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
											  userAttendanceStatus === 'LATE' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 
											  userAttendanceStatus === '미진행' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
											  'bg-red-500/20 text-red-400 border-red-500/30'}`}
										>
											{userAttendanceStatus === 'PRESENT' ? '출석 완료 ✅' : userAttendanceStatus === 'LATE' ? '지각 ⚠️' : userAttendanceStatus === '미진행' ? '진행 전 ⏳' : '결석 ❌'}
										</div>
									</div>
								</div>

								{/* Admin Updates */}
								{isAdmin ? (
									<div className="pt-4 border-t border-gray-700/50 mt-auto">
										<h4 className="text-sm font-semibold text-[#CAFF33] mb-3">🛠️ [관리자] 출석 상태 변경</h4>
										<div className="flex gap-2">
											<Button 
												className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors border ${userAttendanceStatus === 'PRESENT' ? 'bg-green-500 text-black border-green-500 hover:bg-green-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border-gray-700'}`}
												onClick={() => handleUpdateAttendance('PRESENT')}
											>
												출석
											</Button>
											<Button 
												className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors border ${userAttendanceStatus === 'LATE' ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-300' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border-gray-700'}`}
												onClick={() => handleUpdateAttendance('LATE')}
											>
												지각
											</Button>
											<Button 
												className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors border ${userAttendanceStatus === 'ABSENT' || (!userAttRecord && sessionDetail?.attendanceStatus !== 'BEFORE') ? 'bg-red-500 text-white border-red-500 hover:bg-red-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border-gray-700'}`}
												onClick={() => handleUpdateAttendance('ABSENT')}
											>
												결석
											</Button>
										</div>
									</div>
								) : (
									<div className="mt-auto"></div>
								)}
							</div>
						)}
					</div>

					{/* Right Panel: Assignment */}
					<div className="flex-1 bg-[#1f1f1f] rounded-xl border border-gray-700/50 p-6 flex flex-col overflow-y-auto custom-scrollbar">
						<h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-200">
							<span className="text-xl">📚</span> 과제 현황
						</h3>
						
						{loading ? (
							<div className="text-gray-500 text-sm text-center py-10">데이터 로딩 중...</div>
						) : !assignment ? (
							<div className="text-gray-500 text-sm py-10 text-center flex flex-col items-center">
								<span className="text-4xl mb-4 opacity-30">📁</span>
								등록된 과제가 없습니다.
							</div>
						) : (
							<div className="space-y-5 flex-1 flex flex-col h-full">
								<div className="bg-black/30 rounded-lg p-4 border border-gray-700/30">
									<h4 className="font-semibold text-lg text-white mb-1">{assignment.title}</h4>
									{assignment.description && <p className="text-sm text-gray-400">{assignment.description}</p>}
								</div>

								<div className="flex-1 overflow-hidden flex flex-col">
									<h4 className="text-sm font-semibold text-gray-400 mb-3">포함된 문제 목록 (상태는 Mock)</h4>
									<div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
										{assignmentProblems.length === 0 ? (
											<div className="text-gray-500 text-sm text-center py-5">과제에 추가된 문제가 없습니다.</div>
										) : (
											assignmentProblems.map(prob => {
												const status = getMockProblemStatus(prob.id);
												return (
													<div key={prob.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#2a2a2a] p-3.5 rounded-lg border border-gray-700/50 hover:border-gray-500 transition-colors">
														<div className="min-w-0 pr-4 flex-1">
															<div className="text-sm font-medium text-gray-200 truncate" title={prob.title}>{prob.title}</div>
															<div className="text-xs text-gray-500 mt-1">Level: {prob.level ?? '정보 없음'}</div>
														</div>
														<div className="shrink-0 flex items-center">
															{status === 'CORRECT' && <span className="px-3 py-1.5 bg-green-500/10 text-green-400 text-xs font-bold rounded border border-green-500/30 whitespace-nowrap shadow-sm">정답 🟢</span>}
															{status === 'WRONG' && <span className="px-3 py-1.5 bg-red-500/10 text-red-500 text-xs font-bold rounded border border-red-500/30 whitespace-nowrap shadow-sm">오답 🔴</span>}
															{status === 'UNATTEMPTED' && <span className="px-3 py-1.5 bg-gray-600/20 text-gray-300 text-xs font-bold rounded border border-gray-600/40 whitespace-nowrap shadow-sm">미시도 ⚪</span>}
														</div>
													</div>
												);
											})
										)}
									</div>
								</div>

								{/* Admin Final Evaluation */}
								{isAdmin ? (
									<div className="pt-4 border-t border-gray-700/50 mt-auto shrink-0">
										<h4 className="text-sm font-semibold text-[#CAFF33] mb-3">🛠️ [관리자] 과제 결과 부여</h4>
										<div className="flex gap-2">
											<Button 
												className="flex-1 py-2.5 text-sm rounded-lg bg-[#2a2a2a] text-gray-300 hover:bg-green-500/20 hover:text-green-400 border border-gray-600/50 hover:border-green-500/50 transition-all shadow-sm"
												onClick={() => handleUpdateAssignmentPass(true)}
											>
												✅ Pass
											</Button>
											<Button 
												className="flex-1 py-2.5 text-sm rounded-lg bg-[#2a2a2a] text-gray-300 hover:bg-red-500/20 hover:text-red-400 border border-gray-600/50 hover:border-red-500/50 transition-all shadow-sm"
												onClick={() => handleUpdateAssignmentPass(false)}
											>
												❌ Fail
											</Button>
										</div>
									</div>
								) : (
									<div className="mt-auto shrink-0"></div>
								)}
							</div>
						)}
					</div>
				</div>

				{/* ── Footer ── */}
				{/* Footer removed per user request, closed via X button */}
			</div>
		</div>
	);
};

export default StudyProgressModal;
