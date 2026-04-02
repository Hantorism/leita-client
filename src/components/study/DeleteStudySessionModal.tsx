import { useState } from 'react';
import { Modal } from '@components';

interface DeleteStudySessionModalProps {
	sessionNumber: number;
	isDeleting: boolean;
	onConfirm: () => void;
	onClose: () => void;
}

const DeleteStudySessionModal = ({ sessionNumber, isDeleting, onConfirm, onClose }: DeleteStudySessionModalProps) => {
	const [confirmText, setConfirmText] = useState('');
	const targetText = `${sessionNumber}회차 삭제`;
	const isMatched = confirmText === targetText;

	return (
		<Modal
			title="세션 삭제"
			onClose={onClose}
			buttons={[
				{
					text: isDeleting ? '삭제 중...' : '세션 삭제',
					variant: 'danger',
					onClick: onConfirm,
					disabled: !isMatched || isDeleting,
				},
				{ text: '취소', variant: 'secondary', onClick: onClose },
			]}
		>
			<div className="text-center">
				<div className="text-4xl mb-4">⚠️</div>
				<p className="text-gray-400 mb-1 text-sm">
					삭제를 완료하려면 아래에 문구를 정확히 입력하세요:
				</p>
				<p className="text-white font-bold mb-4 bg-red-900 bg-opacity-20 py-2 rounded-lg border border-red-800/30">
					{targetText}
				</p>

				<input
					type="text"
					value={confirmText}
					onChange={(e) => setConfirmText(e.target.value)}
					placeholder="문구를 입력하세요"
					className="w-full px-4 py-2.5 mb-4 bg-[#2a2a2a] border border-gray-700/50 rounded-xl text-white text-center focus:outline-none focus:border-red-600 transition"
					autoFocus
				/>

				<p className="text-gray-400 text-xs">
					해당 회차의 모든 데이터(출석, 과제 등)가 영구적으로 삭제됩니다.<br />
					<span className="text-red-400 font-semibold mt-1 block">되돌릴 수 없습니다.</span>
				</p>
			</div>
		</Modal>
	);
};

export default DeleteStudySessionModal;
