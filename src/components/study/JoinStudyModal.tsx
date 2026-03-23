import { studyApi } from '@apis';
import { useAlert } from '@contexts';

// Using frontend's standard study format if possible, or an inline type if needed.
interface JoinStudyModalProps {
	study: any; // Allow the fetched Study format to be passed safely
	onClose: () => void;
}

const JoinStudyModal = ({ study, onClose }: JoinStudyModalProps) => {
	if (!study) return null;
	const { showAlert } = useAlert();

	const handleJoin = async () => {
		try {
			await studyApi.joinStudy(study.id);
			showAlert('success', '가입 요청을 전송했습니다.');
			onClose();
		} catch (err: any) {
			console.error('Failed to join study:', err);
			showAlert('error', '가입 요청 중 오류가 발생했습니다: ' + (err.response?.data?.message || err.message || '알 수 없는 오류'));
		}
	};

	return (
		<div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
			<div className="bg-gray-100 rounded-xl p-8 w-full max-w-md shadow-lg ">
				<h2 className="text-xl font-extrabold mb-4 font-NanumSquare">{study.title}</h2>
				<p className="mb-3 font-bold text-gray-600 font-NanumSquare">{study.description}</p>
				<p className="mb-10 text-sm text-gray-600 font-NanumSquare">
					모집 조건: {study.requirement || '없음'}
				</p>
				<div className="flex justify-end space-x-2">
					<button
						className="px-4 py-2 bg-gray-300  rounded-full hover:bg-gray-500"
						onClick={onClose}
					>
						Close
					</button>
					<button
						className="px-4 py-2  bg-gray-600 text-white rounded-full  hover:text-[#CAFF33]"
						onClick={handleJoin}
					>
						Join
					</button>
				</div>
			</div>
		</div>
	);
};

export default JoinStudyModal;
