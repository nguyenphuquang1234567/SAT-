'use client';

import { AlertTriangle, Maximize2 } from 'lucide-react';

interface ViolationWarningModalProps {
    isOpen: boolean;
    violationCount: number;
    maxViolations: number;
    onReturnToFullscreen: () => void;
    isReturning?: boolean;
}

export default function ViolationWarningModal({
    isOpen,
    violationCount,
    maxViolations,
    onReturnToFullscreen,
    isReturning = false
}: ViolationWarningModalProps) {
    if (!isOpen) return null;

    const remainingChances = maxViolations - violationCount;
    const isLastChance = remainingChances <= 1;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal */}
            <div className={`
                relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden
                animate-[shake_0.5s_ease-in-out]
            `}>
                {/* Red Header */}
                <div className={`
                    px-6 py-4 flex items-center gap-3
                    ${isLastChance ? 'bg-red-600' : 'bg-yellow-500'}
                `}>
                    <div className="p-2 bg-white/20 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            {isLastChance ? 'CẢNH BÁO CUỐI CÙNG!' : 'Phát Hiện Vi Phạm!'}
                        </h2>
                        <p className="text-sm text-white/80">
                            Bạn đã thoát khỏi chế độ toàn màn hình
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
                            <span className={`text-3xl font-black ${isLastChance ? 'text-red-600' : 'text-yellow-600'}`}>
                                {violationCount}/{maxViolations}
                            </span>
                        </div>
                        <p className="text-gray-700 font-medium">
                            Bạn đã vi phạm <span className="font-bold text-red-600">{violationCount}</span> lần
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                            {isLastChance
                                ? 'Đây là cảnh báo cuối cùng! Vi phạm thêm lần nữa sẽ tự động NỘP BÀI.'
                                : `Còn ${remainingChances} lần cảnh báo trước khi bài thi bị nộp tự động.`
                            }
                        </p>
                    </div>

                    {/* Warning Text */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm text-gray-600">
                            <strong className="text-gray-800">Lưu ý:</strong> Trong quá trình thi, bạn không được phép:
                        </p>
                        <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                            <li>Thoát khỏi chế độ toàn màn hình</li>
                            <li>Chuyển sang tab hoặc cửa sổ khác</li>
                            <li>Mở DevTools hoặc các công cụ khác</li>
                        </ul>
                    </div>

                    {/* Return Button */}
                    <button
                        onClick={onReturnToFullscreen}
                        disabled={isReturning}
                        className={`
                            w-full py-4 rounded-xl font-bold text-white text-lg
                            flex items-center justify-center gap-2
                            transition-all shadow-lg
                            ${isLastChance
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        {isReturning ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <Maximize2 className="w-5 h-5" />
                                Quay Lại Fullscreen
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Keyframe animation for shake effect */}
            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
            `}</style>
        </div>
    );
}
