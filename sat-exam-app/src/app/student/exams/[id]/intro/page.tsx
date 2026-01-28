
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, BookOpen, AlertCircle, Play, ChevronLeft, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import { useFullscreenLock } from '@/hooks/useFullscreenLock';

interface ExamDetails {
    id: string;
    title: string;
    duration: number;
    description: string | null;
    questionCount: number;
}

export default function ExamIntroPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [exam, setExam] = useState<ExamDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [unwrappedParams, setUnwrappedParams] = useState<{ id: string } | null>(null);
    const { enterFullscreen, isSupported } = useFullscreenLock();

    useEffect(() => {
        params.then(setUnwrappedParams);
    }, [params]);

    useEffect(() => {
        if (!unwrappedParams) return;

        // Fetch exam basic info (we can allow public fetch for title/duration even if not started)
        // Or we can reuse the dashboard API logic or create a specific public endpoint.
        // For simplicity, let's try to fetch via a new lightweight endpoint or just reuse dashboard if possible?
        // Actually, better to have a dedicated endpoint or just fetch from the 'status' endpoint if we had one.
        // Let's assume we can fetch basic details. For now, I'll fetch from a new endpoint or mock it?
        // Wait, I didn't create a "get exam info" endpoint.
        // I can stick to "attempt" to get info? No, "attempt" starts it.
        // Let's create a quick "info" endpoint or just fetch it in the component if I had a general "get exam" API.
        // The `POST /attempt` returns success/fail.
        // I'll make a helper to fetch exam public info.
        // Actually, let's make `GET /api/student/exams/[id]/info` first?
        // Or just render the cached data if passed? No.
        // Let's create `GET /api/student/exams/[id]/info` quickly.

        // TEMPORARY: I will fetch from /api/student/exams/[id]/info if it existed.
        // Since I don't have it, I'll create it now quickly OR just use server component to fetch?
        // No, this is 'use client'.
        // Let's just create the route.ts safely.

        const fetchInfo = async () => {
            try {
                const res = await fetch(`/api/student/exams/${unwrappedParams.id}/info`);
                if (!res.ok) {
                    if (res.status === 404) throw new Error("Bài thi không tồn tại");
                    throw new Error("Không thể tải thông tin bài thi");
                }
                const data = await res.json();
                setExam(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, [unwrappedParams]);

    const handleStartExam = async () => {
        if (!unwrappedParams) return;
        setIsStarting(true);
        try {
            // Enter fullscreen first
            if (isSupported) {
                await enterFullscreen();
            }

            const res = await fetch(`/api/student/exams/${unwrappedParams.id}/attempt`, {
                method: 'POST'
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to start exam');
            }

            router.push(`/student/exams/${unwrappedParams.id}/take`);
        } catch (err: any) {
            alert(err.message);
            setIsStarting(false);
        }
    };

    if (!unwrappedParams) return null;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cb-blue"></div>
            </div>
        );
    }

    if (error || !exam) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 mb-2">Đã có lỗi xảy ra</h2>
                    <p className="text-gray-500 mb-6">{error || 'Không tìm thấy bài thi'}</p>
                    <Link href="/student/dashboard" className="text-cb-blue font-bold hover:underline">
                        Quay lại trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-cb-blue to-blue-700"></div>
                <div className="absolute top-24 left-8 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-cb-blue ring-4 ring-blue-50">
                    <BookOpen size={32} />
                </div>

                <div className="pt-24 px-8 pb-8">
                    <Link href="/student/dashboard" className="absolute top-6 left-6 text-white/80 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors">
                        <ChevronLeft size={16} /> Quay lại
                    </Link>

                    <div className="mt-6 mb-8">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">{exam.title}</h1>
                        <p className="text-gray-500">{exam.description || 'Không có mô tả thêm.'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-3 mb-1 text-blue-800">
                                <Clock size={20} />
                                <span className="font-bold text-sm uppercase tracking-wider">Thời gian</span>
                            </div>
                            <p className="text-2xl font-black text-blue-900">{exam.duration} phút</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                            <div className="flex items-center gap-3 mb-1 text-yellow-800">
                                <AlertCircle size={20} />
                                <span className="font-bold text-sm uppercase tracking-wider">Số câu hỏi</span>
                            </div>
                            <p className="text-2xl font-black text-yellow-900">{exam.questionCount} câu</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <AlertCircle size={16} className="text-cb-blue" />
                                Lưu ý quan trọng:
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                                <li>Đảm bảo kết nối mạng ổn định trong suốt quá trình làm bài.</li>
                                <li>Hệ thống sẽ tự động nộp bài khi hết giờ.</li>
                                <li className="font-semibold text-red-600">Không thoát khỏi chế độ toàn màn hình hoặc chuyển tab. Vi phạm nhiều lần sẽ bị tự động nộp bài.</li>
                            </ul>
                        </div>

                        {/* Fullscreen Warning Banner */}
                        <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                            <div className="flex items-start gap-3">
                                <Maximize2 className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-red-800 mb-1">Chế độ Fullscreen bắt buộc</h4>
                                    <p className="text-sm text-red-700">
                                        Bài thi sẽ được thực hiện ở chế độ toàn màn hình. Bạn sẽ bị cảnh báo nếu thoát khỏi fullscreen
                                        hoặc chuyển sang tab/cửa sổ khác. <strong>Sau 3 lần vi phạm, bài thi sẽ tự động được nộp.</strong>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleStartExam}
                            disabled={isStarting}
                            className="w-full bg-cb-blue hover:bg-blue-700 text-white font-black text-lg py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isStarting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Đang vào phòng thi...
                                </>
                            ) : (
                                <>
                                    BẮT ĐẦU LÀM BÀI <Play size={20} fill="currentColor" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
