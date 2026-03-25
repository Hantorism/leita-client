import { useState } from 'react';
import { Logger } from '@utils';
import { studyApi } from '@apis';
import { Study } from '@types';
import { useAlert } from '@contexts';

interface UpdateStudyModalProps {
	study: Study;
	onClose: () => void;
	onUpdated: () => void;
}

const UpdateStudyModal = ({ study, onClose, onUpdated }: UpdateStudyModalProps) => {
	const { showAlert } = useAlert();
	const [title, setTitle] = useState(study.title);
	const [description, setDescription] = useState(study.description);
	const [requirement, setRequirement] = useState(study.requirement || '');
	const formatDate = (dateStr: string) => {
		if (!dateStr) return '';
		return dateStr.split('T')[0]; // ISO 8601의 날짜 부분만 추출
	};
	const [startDate, setStartDate] = useState(formatDate(study.startDate));
	const [endDate, setEndDate] = useState(formatDate(study.endDate));

	const handleSubmit = async () => {
		if (!title.trim() || !description.trim() || !requirement.trim() || !startDate || !endDate) {
			showAlert('info', '모든 필드를 입력해주세요.');
			return;
		}

		if (new Date(startDate) >= new Date(endDate)) {
			showAlert('info', '스터디 종료일은 시작일보다 늦어야 합니다.');
			return;
		}


		const payload = {
			title,
			description,
			requirement,
			startDate: startDate,
			endDate: endDate,
		};

		try {
			await studyApi.updateStudy(study.id, payload);
			showAlert('success', '수정 완료되었습니다!');
			onClose();
			onUpdated();
		} catch (err: any) {
			Logger.error('Update Error:', err);
			showAlert('error', '수정 실패: ' + (err.response?.data?.message || err.message || '알 수 없는 오류'));
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 font-NanumSquare backdrop-blur-sm animate-fadeIn p-4">
			<div className="bg-[#1f1f1f] border border-gray-700/50 rounded-2xl p-8 w-full max-w-md shadow-2xl text-white">
				<h2 className="text-xl font-bold mb-6 text-center text-[#CAFF33]">스터디 그룹 수정</h2>

				<div className="space-y-5">
					<div>
						<label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">스터디 이름</label>
						<input
							className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#CAFF33]/50 transition"
							placeholder="Title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
					</div>

					<div>
						<label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">상세 설명</label>
						<textarea
							className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700/50 rounded-xl text-white placeholder-gray-600 resize-none focus:outline-none focus:border-[#CAFF33]/50 transition"
							placeholder="Description"
							rows={3}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>

					<div>
						<label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">모집 조건</label>
						<input
							className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#CAFF33]/50 transition"
							placeholder="Requirement"
							value={requirement}
							onChange={(e) => setRequirement(e.target.value)}
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">시작일</label>
							<input
								type="date"
								className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-[#CAFF33]/50 transition text-sm [color-scheme:dark]"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
							/>
						</div>
						<div>
							<label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">종료일</label>
							<input
								type="date"
								className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-[#CAFF33]/50 transition text-sm [color-scheme:dark]"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
							/>
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-3 mt-8">
					<button
						className="w-full px-4 py-2.5 bg-[#CAFF33] text-black rounded-full font-bold hover:bg-[#b0e82e] transition shadow-lg shadow-[#CAFF33]/10"
						onClick={handleSubmit}
					>
						수정 완료하기
					</button>
					<button
						className="w-full px-4 py-2.5 bg-gray-800 text-gray-400 rounded-full font-bold hover:bg-gray-700 hover:text-white transition border border-gray-700"
						onClick={onClose}
					>
						취소
					</button>
				</div>
			</div>
		</div>
	);
};

export default UpdateStudyModal;
