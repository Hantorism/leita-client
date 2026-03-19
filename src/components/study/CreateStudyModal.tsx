import { useState } from 'react';
import { Logger } from '@utils';
import { studyApi } from '@apis';

interface CreateStudyModalProps {
	onClose: () => void;
	onCreated: () => void;
}

const CreateStudyModal = ({ onClose, onCreated }: CreateStudyModalProps) => {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [requirement, setRequirement] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	
	// Requirement settings
	const [attendanceRequired, setAttendanceRequired] = useState(false);
	const [requiredAttendanceCount, setRequiredAttendanceCount] = useState<number | ''>('');
	const [assignmentRequired, setAssignmentRequired] = useState(false);
	const [requiredAssignmentCount, setRequiredAssignmentCount] = useState<number | ''>('');

	const handleSubmit = async () => {
		if (!title.trim() || !description.trim() || !requirement.trim() || !startDate || !endDate) {
			alert('👾 모든 필드를 입력해주세요.');
			return;
		}

		if (new Date(startDate) >= new Date(endDate)) {
			alert('👾 스터디 종료일은 시작일보다 늦어야 합니다.');
			return;
		}

		if (attendanceRequired && requiredAttendanceCount === '') {
			alert('👾 필수 출석 횟수를 입력해주세요.');
			return;
		}

		if (assignmentRequired && requiredAssignmentCount === '') {
			alert('👾 필수 과제 개수를 입력해주세요.');
			return;
		}

		const payload = {
			title,
			description,
			requirement,
			startDate: new Date(startDate).toISOString(),
			endDate: new Date(endDate).toISOString(),
			attendanceRequired: attendanceRequired,
			assignmentRequired,
			requiredAttendanceCount: attendanceRequired ? Number(requiredAttendanceCount) : 0,
			requiredAssignmentCount: assignmentRequired ? Number(requiredAssignmentCount) : 0,
		};

		try {
			await studyApi.createStudy(payload);

			alert('👾 생성 완료되었습니다!');
			onClose();
			onCreated();
		} catch (err: any) {
			Logger.error('API Error:', err);
			alert('👾 생성 실패: ' + (err.response?.data?.message || err.message || '알 수 없는 오류'));
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 font-NanumSquare">
			<div className="bg-gray-100 rounded-xl p-8 w-full max-w-md shadow-lg overflow-y-auto max-h-[90vh] text-gray-900">
				<h2 className="text-xl font-bold mb-4">스터디 그룹 생성</h2>
				
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-bold text-gray-700 mb-1">스터디 이름</label>
						<input
							className="w-full p-2 border rounded bg-white text-gray-900"
							placeholder="Title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
					</div>
					
					<div>
						<label className="block text-sm font-bold text-gray-700 mb-1">설명</label>
						<textarea
							className="w-full p-2 border rounded resize-none bg-white text-gray-900"
							placeholder="Description"
							rows={3}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>

					<div>
						<label className="block text-sm font-bold text-gray-700 mb-1">모집 조건</label>
						<input
							className="w-full p-2 border rounded bg-white text-gray-900"
							placeholder="Requirement"
							value={requirement}
							onChange={(e) => setRequirement(e.target.value)}
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-sm font-bold text-gray-700 mb-1">스터디 시작일</label>
							<input
								type="datetime-local"
								className="w-full p-2 border rounded bg-white text-gray-900 text-sm"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
							/>
						</div>
						<div>
							<label className="block text-sm font-bold text-gray-700 mb-1">스터디 종료일</label>
							<input
								type="datetime-local"
								className="w-full p-2 border rounded bg-white text-gray-900 text-sm"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
							/>
						</div>
					</div>

					<div className="border-t pt-4">
						<h3 className="font-bold text-gray-700 mb-2">수료 조건 설정</h3>
						
						{/* Attendance Requirement */}
						<div className="mb-4 bg-white p-3 rounded shadow-sm">
							<label className="flex items-center space-x-2 cursor-pointer mb-2">
								<input 
									type="checkbox" 
									className="form-checkbox text-gray-600 rounded"
									checked={attendanceRequired}
									onChange={(e) => setAttendanceRequired(e.target.checked)}
								/>
								<span className="text-sm font-medium">출석 체크 필수 여부</span>
							</label>
							
							{attendanceRequired && (
								<div className="pl-6 mt-2">
									<input
										type="number"
										min="0"
										className="w-full p-2 border rounded text-sm bg-white text-gray-900"
										placeholder="필수 출석 횟수를 입력하세요"
										value={requiredAttendanceCount}
										onChange={(e) => setRequiredAttendanceCount(e.target.value ? Number(e.target.value) : '')}
									/>
								</div>
							)}
						</div>

						{/* Assignment Requirement */}
						<div className="bg-white p-3 rounded shadow-sm">
							<label className="flex items-center space-x-2 cursor-pointer mb-2">
								<input 
									type="checkbox" 
									className="form-checkbox text-gray-600 rounded"
									checked={assignmentRequired}
									onChange={(e) => setAssignmentRequired(e.target.checked)}
								/>
								<span className="text-sm font-medium">과제 필수 여부</span>
							</label>

							{assignmentRequired && (
								<div className="pl-6 mt-2">
									<input
										type="number"
										min="0"
										className="w-full p-2 border rounded text-sm bg-white text-gray-900"
										placeholder="필수 과제 개수를 입력하세요"
										value={requiredAssignmentCount}
										onChange={(e) => setRequiredAssignmentCount(e.target.value ? Number(e.target.value) : '')}
									/>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="flex justify-end gap-2 mt-6 font-Pretendard">
					<button
						className="px-4 py-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition"
						onClick={onClose}
					>
						Cancel
					</button>
					<button
						className="px-4 py-2 bg-gray-600 text-white rounded-full hover:text-[#CAFF33] transition"
						onClick={handleSubmit}
					>
						Create
					</button>
				</div>
			</div>
		</div>
	);
};

export default CreateStudyModal;
