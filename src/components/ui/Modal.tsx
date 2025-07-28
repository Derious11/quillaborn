"use client";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-lg w-full">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">✕</button>
        {children}
      </div>
    </div>
  );
}
