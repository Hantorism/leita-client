import { Study } from '@types';

interface DeleteStudyModalProps {
	study: Study;
	isDeleting: boolean;
	onConfirm: () => void;
	onClose: () => void;
}

const DeleteStudyModal = ({ study, isDeleting, onConfirm, onClose }: DeleteStudyModalProps) => {
	return (
		<div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 font-NanumSquare">
			<div className="bg-[#1f1f1f] border border-red-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl text-white text-center">
				<div className="text-4xl mb-4">⚠️</div>
				<h2 className="text-xl font-bold mb-2">스터디 삭제</h2>
				<p className="text-gray-300 mb-1 font-semibold">
					<span className="text-white">{study.title}</span>
				</p>
				<p className="text-gray-400 text-sm mb-6">
					정말 삭제하시겠습니까?<br />
					<span className="text-red-400 font-semibold">되돌릴 수 없습니다.</span>
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
						disabled={isDeleting}
						className="flex-1 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-500 transition disabled:opacity-50"
					>
						{isDeleting ? '삭제 중...' : '삭제'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default DeleteStudyModal;
