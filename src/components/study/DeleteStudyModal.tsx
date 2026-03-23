import { useState } from 'react';
import { Study } from '@types';

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
		<div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 font-NanumSquare">
			<div className="bg-[#1f1f1f] border border-red-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl text-white text-center">
				<div className="text-4xl mb-4">⚠️</div>
				<h2 className="text-xl font-bold mb-2">스터디 삭제</h2>
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
					className="w-full px-4 py-2 mb-6 bg-gray-800 border border-gray-700 rounded-lg text-white text-center focus:outline-none focus:border-red-600 transition"
					autoFocus
				/>

				<p className="text-gray-400 text-xs mb-6">
					정말 삭제하시겠습니까?<br />
					<span className="text-red-400 font-semibold underline">되돌릴 수 없습니다.</span>
				</p>

				<div className="flex gap-3 justify-center">
					<button
						onClick={onClose}
						className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition"
					>
						취소
					</button>
					<button
						onClick={onConfirm}
						disabled={!isMatched || isDeleting}
						className={`flex-1 px-4 py-2 text-white rounded-full transition ${
							isMatched && !isDeleting
								? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20'
								: 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
						}`}
					>
						{isDeleting ? '삭제 중...' : '삭제'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default DeleteStudyModal;
