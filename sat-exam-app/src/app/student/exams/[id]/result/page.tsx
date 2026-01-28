'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, Award, ArrowLeft, Filter } from 'lucide-react';
import InfoModal from '@/components/exam/InfoModal';

interface ReviewQuestion {
    id: string;
    questionNumber: number;
    content: string;
    section: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    studentAnswer: string | null;
    isCorrect: boolean;
    points: number;
}

interface ResultData {
    exam: {
        title: string;
        duration: number;
    };
    result: {
        score: number;
        maxScore: number;
        submittedAt: string;
        timeSpent: number;
        questions: ReviewQuestion[];
    };
}

export default function ExamResultPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [unwrappedParams, setUnwrappedParams] = useState<{ id: string } | null>(null);
    const [data, setData] = useState<ResultData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'CORRECT' | 'INCORRECT'>('ALL');
    const [infoModal, setInfoModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    useEffect(() => {
        params.then(setUnwrappedParams);
    }, [params]);

    useEffect(() => {
        if (!unwrappedParams) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/student/exams/${unwrappedParams.id}/result`);
                if (!res.ok) {
                    if (res.status === 403) {
                        // Redirect if not submitted yet
                        router.push(`/student/exams/${unwrappedParams.id}/take`);
                        return;
                    }
                    throw new Error('Failed to load results');
                }
                const result = await res.json();
                setData(result);
            } catch (error) {
                console.error('Error:', error);
                setInfoModal({
                    isOpen: true,
                    title: 'Lỗi',
                    message: 'Không thể tải kết quả thi.',
                    type: 'error'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [unwrappedParams, router]);

    if (loading || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cb-blue"></div>
            </div>
        );
    }

    const { exam, result } = data;
    const percentage = Math.round((result.score / result.maxScore) * 100) || 0;

    // Format usage time
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
    };

    const filteredQuestions = result.questions.filter(q => {
        if (filter === 'CORRECT') return q.isCorrect;
        if (filter === 'INCORRECT') return !q.isCorrect;
        return true;
    });

    // Helper to render section title nicely
    const formatSection = (content: string, section: string) => {
        const match = content.match(/\[([^\]]+?)\s+(M\d+)/);
        if (match) return `${match[1]} ${match[2]}`;
        return section;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.push('/student/dashboard')}
                    className="flex items-center text-gray-500 hover:text-cb-blue mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Quay về Dashboard
                </button>

                {/* Header Summary Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{exam.title}</h1>
                    <p className="text-gray-500 mb-8">Kết quả bài làm</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Score Card */}
                        <div className="bg-blue-50 rounded-xl p-6 flex flex-col items-center justify-center border border-blue-100">
                            <span className="text-blue-600 font-medium mb-1">Điểm số</span>
                            <div className="text-4xl font-bold text-blue-900">
                                {result.score}<span className="text-2xl text-blue-400">/{result.maxScore}</span>
                            </div>
                            <span className="text-sm text-blue-600 mt-2 font-medium bg-blue-100 px-3 py-1 rounded-full">
                                {percentage}% Correct
                            </span>
                        </div>

                        {/* Status Card */}
                        <div className="bg-green-50 rounded-xl p-6 flex flex-col items-center justify-center border border-green-100">
                            <span className="text-green-600 font-medium mb-1">Trạng thái</span>
                            <div className="flex items-center gap-2 text-2xl font-bold text-green-900">
                                <CheckCircle className="w-8 h-8" />
                                Hoàn thành
                            </div>
                            <span className="text-sm text-green-600 mt-2">
                                {new Date(result.submittedAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>

                        {/* Time Card */}
                        <div className="bg-purple-50 rounded-xl p-6 flex flex-col items-center justify-center border border-purple-100">
                            <span className="text-purple-600 font-medium mb-1">Thời gian làm bài</span>
                            <div className="flex items-center gap-2 text-2xl font-bold text-purple-900">
                                <Clock className="w-8 h-8" />
                                {formatTime(result.timeSpent)}
                            </div>
                            <span className="text-sm text-purple-600 mt-2">
                                / {exam.duration} phút
                            </span>
                        </div>
                    </div>
                </div>

                {/* Detailed Review Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-gray-900">Chi tiết bài làm</h2>

                        {/* Filters */}
                        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                            <button
                                onClick={() => setFilter('ALL')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'ALL' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                Tất cả
                            </button>
                            <button
                                onClick={() => setFilter('CORRECT')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'CORRECT' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:bg-green-50'
                                    }`}
                            >
                                Đúng
                            </button>
                            <button
                                onClick={() => setFilter('INCORRECT')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'INCORRECT' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-500 hover:bg-red-50'
                                    }`}
                            >
                                Sai
                            </button>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {filteredQuestions.map((q) => (
                            <div key={q.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-4">
                                    {/* Question Number Badge */}
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg
                                        ${q.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                    `}>
                                        {q.isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-bold text-gray-900">Câu {q.questionNumber}</span>
                                            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-500 rounded uppercase">
                                                {formatSection(q.content, q.section)}
                                            </span>
                                        </div>

                                        {/* Question Content (Text for now, Image usually in iframe) */}
                                        {/* Since content is often [Info], we might not show full question text here if it's PDF based. 
                                            But we show the options and answer keys. */}

                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {(['Option A', 'Option B', 'Option C', 'Option D'] as const).map((label, idx) => {
                                                const choiceLetter = ['A', 'B', 'C', 'D'][idx];
                                                const optionText = q[`option${choiceLetter}` as keyof ReviewQuestion] as string;

                                                const isSelected = q.studentAnswer === choiceLetter;
                                                const isCorrectAnswer = q.correctAnswer === choiceLetter;

                                                let styleClass = "border-gray-200 bg-white text-gray-500";

                                                if (isCorrectAnswer) {
                                                    styleClass = "border-green-500 bg-green-50 text-green-700 font-medium ring-1 ring-green-500";
                                                } else if (isSelected && !isCorrectAnswer) {
                                                    styleClass = "border-red-500 bg-red-50 text-red-700 font-medium ring-1 ring-red-500";
                                                } else if (isSelected && isCorrectAnswer) {
                                                    styleClass = "border-green-500 bg-green-50 text-green-700 font-medium ring-1 ring-green-500";
                                                }

                                                return (
                                                    <div
                                                        key={choiceLetter}
                                                        className={`p-3 rounded-lg border text-sm flex items-start gap-2 ${styleClass}`}
                                                    >
                                                        <span className="font-bold min-w-[20px]">{choiceLetter}.</span>
                                                        <span>{optionText}</span>
                                                        {isSelected && (
                                                            <span className="ml-auto text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/5">
                                                                Bạn chọn
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredQuestions.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                Không có câu hỏi nào trong mục này.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <InfoModal
                isOpen={infoModal.isOpen}
                title={infoModal.title}
                message={infoModal.message}
                type={infoModal.type}
                onClose={() => setInfoModal(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
