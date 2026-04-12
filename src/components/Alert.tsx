import { Button } from '@components';
import type { AlertType } from '@contexts';
import { createPortal } from 'react-dom';

interface AlertProps {
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

const Alert = ({ type, message, onClose }: AlertProps) => {
  const { border, icon, title, buttonBg } = config[type];

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[10000] font-NanumSquare animate-fadeIn pointer-events-auto">
      <div
        className={`bg-[var(--color-bg-card)] border ${border} rounded-2xl p-8 w-full max-w-sm shadow-2xl text-white text-center`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-4xl mb-4">{icon}</div>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-300 text-sm mb-8 leading-relaxed whitespace-pre-line">{message}</p>
        <Button
          onClick={onClose}
          size="lg"
          fullWidth
          className={`text-white rounded-full ${buttonBg}`}
        >
          확인
        </Button>
      </div>
    </div>,
    document.body,
  );
};

export default Alert;
