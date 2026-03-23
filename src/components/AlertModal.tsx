import { AlertType } from '@contexts';

interface AlertModalProps {
  type: AlertType;
  message: string;
  onClose: () => void;
}

const config = {
  success: {
    border: 'border-green-600',
    icon: '✅',
    title: '성공',
    buttonBg: 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/20',
  },
  error: {
    border: 'border-red-600',
    icon: '❌',
    title: '오류',
    buttonBg: 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20',
  },
  info: {
    border: 'border-gray-500',
    icon: 'ℹ️',
    title: '알림',
    buttonBg: 'bg-gray-600 hover:bg-gray-500 shadow-lg shadow-gray-900/20',
  },
};

const AlertModal = ({ type, message, onClose }: AlertModalProps) => {
  const { border, icon, title, buttonBg } = config[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100] font-NanumSquare animate-fadeIn">
      <div className={`bg-[#1f1f1f] border ${border} rounded-2xl p-8 w-full max-w-sm shadow-2xl text-white text-center`}>
        <div className="text-4xl mb-4">{icon}</div>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-300 text-sm mb-8 leading-relaxed whitespace-pre-line">{message}</p>
        <button
          onClick={onClose}
          className={`w-full px-4 py-2.5 text-white rounded-full transition font-bold ${buttonBg}`}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
