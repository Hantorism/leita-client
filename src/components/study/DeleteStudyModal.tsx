import { useState } from 'react';
import { Study } from '@types';
import { Modal } from '@components';

interface DeleteStudyModalProps {
	study: Study;
	isDeleting: boolean;
	onConfirm: () => void;
	onClose: () => void;
}

const DeleteStudyModal = ({ study, isDeleting, onConfirm, onClose }: DeleteStudyModalProps) => {
	const [confirmTitle, setConfirmTitle] = useState('');
	const isMatched = confirmTitle === study.title;

	return (
		<Modal
			title="스터디 삭제"
			onClose={onClose}
			buttons={[
				{
					text: isDeleting ? '삭제 중...' : '스터디 삭제',
					variant: 'danger',
					onClick: onConfirm,
					disabled: !isMatched || isDeleting,
				},
				{ text: '취소', variant: 'secondary', onClick: onClose },
			]}
		>
			<div className="text-center">
				<div className="text-4xl mb-4">⚠️</div>
				<p className="text-gray-300 mb-1 text-sm">
					삭제를 승인하려면 아래에 스터디 이름을 입력하세요:
				</p>
				<p className="text-white font-bold mb-4 bg-red-900 bg-opacity-20 py-1 rounded">
					{study.title}
				</p>

				<input
					type="text"
					value={confirmTitle}
					onChange={(e) => setConfirmTitle(e.target.value)}
					placeholder="스터디 이름을 입력하세요"
					className="w-full px-4 py-2 mb-4 bg-[#2a2a2a] border border-gray-700/50 rounded-xl text-white text-center focus:outline-none focus:border-red-600 transition"
					autoFocus
				/>

				<p className="text-gray-400 text-xs">
					정말 삭제하시겠습니까?<br />
					<span className="text-red-400 font-semibold">되돌릴 수 없습니다.</span>
				</p>
			</div>
		</Modal>
	);
};

export default DeleteStudyModal;
