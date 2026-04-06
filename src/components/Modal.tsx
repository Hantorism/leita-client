import { Button } from '@components';
import { Icon } from '@iconify/react';
import type { ComponentProps } from 'react';
import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  buttons?: (Omit<ComponentProps<typeof Button>, 'children'> & { text: string })[];
}

const Modal = ({ title, children, onClose, buttons }: ModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-start pt-20 z-[9999] font-NanumSquare animate-fadeIn p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#1f1f1f] border border-gray-700/50 rounded-2xl w-full max-w-md shadow-2xl text-white relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-8 pt-8 pb-2">
          <h2 className="text-xl font-bold text-[#CAFE33]">{title}</h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-500 hover:text-white transition text-2xl leading-none ml-4 !px-0 !py-0 shadow-none border-none hover:bg-transparent"
            aria-label="닫기"
          >
            <Icon
              icon="material-symbols-light:close-rounded"
              className="w-8 h-8"
            />
          </Button>
        </div>

        <div className="px-8 py-6">{children}</div>

        {buttons && buttons.length > 0 && (
          <div className="flex flex-col gap-3 px-8 pb-8">
            {buttons.map((btn, idx) => {
              const { text, ...props } = btn;
              return (
                <Button
                  key={idx}
                  size="lg"
                  fullWidth
                  className="rounded-full"
                  variant="secondary"
                  {...props}
                >
                  {text}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
