'use client';

import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface InfoModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onClose: () => void;
    type?: 'success' | 'error' | 'info';
    buttonText?: string;
}

export default function InfoModal({
    isOpen,
    title,
    message,
    onClose,
    type = 'info',
    buttonText = 'Đồng ý'
}: InfoModalProps) {
    if (!isOpen) return null;

    const iconMap = {
        success: <CheckCircle2 size={24} className="text-green-600" />,
        error: <AlertCircle size={24} className="text-red-600" />,
        info: <Info size={24} className="text-blue-600" />
    };

    const bgMap = {
        success: 'bg-green-100',
        error: 'bg-red-100',
        info: 'bg-blue-100'
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-full ${bgMap[type]}`}>
                            {iconMap[type]}
                        </div>
                        <h2 className="text-xl font-black text-gray-900 leading-none">{title}</h2>
                    </div>

                    <p className="text-gray-600 mb-8 font-medium leading-relaxed">
                        {message}
                    </p>

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-cb-blue hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all"
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
}
