'use client';

import { AlertCircle, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    variant = 'primary'
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-full ${variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-cb-blue'}`}>
                            {variant === 'danger' ? <AlertCircle size={24} /> : <HelpCircle size={24} />}
                        </div>
                        <h2 className="text-xl font-black text-gray-900 leading-none">{title}</h2>
                    </div>

                    <p className="text-gray-600 mb-8 font-medium leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${variant === 'danger'
                                    ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30'
                                    : 'bg-cb-blue hover:bg-blue-700 shadow-blue-500/30'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
