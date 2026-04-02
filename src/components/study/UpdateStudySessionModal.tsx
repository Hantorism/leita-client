import { useState } from 'react';
import { studySessionApi } from '@apis';
import { StudySession } from '@types';
import { Logger } from '@utils';
import { useAlert } from '@contexts';
import { Modal } from '@components';

interface UpdateStudySessionModalProps {
	session: StudySession;
	onClose: () => void;
	onUpdated: () => void;
}

const UpdateStudySessionModal = ({ session, onClose, onUpdated }: UpdateStudySessionModalProps) => {
	const { showAlert } = useAlert();

	const formatDateTime = (dateStr: string) => {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		const offset = date.getTimezoneOffset() * 60000;
		return new Date(date.getTime() - offset).toISOString().slice(0, 16);
	};

	const [startDateTime, setStartDateTime] = useState(formatDateTime(session.startDateTime));
	const [endDateTime, setEndDateTime] = useState(formatDateTime(session.endDateTime));

	const handleSubmit = async () => {
		if (!startDateTime || !endDateTime) {
			showAlert('info', '시작 시간과 종료 시간을 모두 입력해주세요.');
			return;
		}

		if (new Date(startDateTime) >= new Date(endDateTime)) {
			showAlert('info', '종료 시간은 시작 시간보다 늦어야 합니다.');
			return;
		}

		try {
			await studySessionApi.updateStudySession(session.id, { startDateTime, endDateTime });
			showAlert('success', '세션 정보가 수정되었습니다.');
			onUpdated();
			onClose();
		} catch (err: any) {
			Logger.error('Failed to update session', err);
			showAlert('error', '세션 수정에 실패했습니다.');
		}
	};

	return (
		<Modal
			title="세션 정보 수정"
			onClose={onClose}
			buttons={[
				{ text: '세션 수정', variant: 'primary', onClick: handleSubmit },
				{ text: '취소', variant: 'secondary', onClick: onClose },
			]}
		>
			<div className="space-y-6">
				<div>
					<label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">시작 시간</label>
					<input
						type="datetime-local"
						className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-[#CAFF33]/50 transition [color-scheme:dark]"
						value={startDateTime}
						onChange={(e) => setStartDateTime(e.target.value)}
					/>
				</div>

				<div>
					<label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">종료 시간</label>
					<input
						type="datetime-local"
						className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-[#CAFF33]/50 transition [color-scheme:dark]"
						value={endDateTime}
						onChange={(e) => setEndDateTime(e.target.value)}
					/>
				</div>
			</div>
		</Modal>
	);
};

export default UpdateStudySessionModal;
