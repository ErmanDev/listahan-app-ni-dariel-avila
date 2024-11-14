'use client';

import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
}: ModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl">
        <div className="p-6">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-3">{title}</h2>
          <p className="text-sm md:text-base text-zinc-400 mb-6">{message}</p>
          <div className="flex flex-col-reverse md:flex-row md:justify-end gap-3">
            <button
              onClick={onClose}
              className="w-full md:w-auto px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-all duration-200 text-sm md:text-base font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="w-full md:w-auto px-4 py-2.5 bg-white text-black rounded-lg hover:bg-zinc-200 transition-all duration-200 text-sm md:text-base font-medium"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
