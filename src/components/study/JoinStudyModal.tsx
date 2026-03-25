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
		<div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center backdrop-blur-sm p-4 animate-fadeIn">
			<div className="bg-[#1f1f1f] border border-gray-700/50 rounded-2xl p-8 w-full max-w-sm shadow-2xl text-white text-center">
				<h2 className="text-xl font-bold mb-2 font-NanumSquare">{study.title}</h2>
				<p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">{study.description}</p>

				<div className="bg-[#2a2a2a] rounded-xl p-4 mb-8 text-left">
					<p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">모집 조건</p>
					<p className="text-sm text-gray-200">{study.requirement || '제한 없음'}</p>
				</div>

				<div className="flex flex-col gap-3">
					<button
						className="w-full px-4 py-2.5 bg-[#CAFF33] text-black rounded-full font-bold hover:bg-[#b0e82e] transition shadow-lg shadow-[#CAFF33]/10"
						onClick={handleJoin}
					>
						가입 신청하기
					</button>
					<button
						className="w-full px-4 py-2.5 bg-gray-800 text-gray-400 rounded-full font-bold hover:bg-gray-700 hover:text-white transition border border-gray-700"
						onClick={onClose}
					>
						닫기
					</button>
				</div>
			</div>
		</div>
	);
};

export default JoinStudyModal;
