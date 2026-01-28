
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Save, LogOut, Bookmark } from 'lucide-react';
import ExamTimer from '@/components/exam/ExamTimer';
import AnswerSheet from '@/components/exam/AnswerSheet';
import ViolationWarningModal from '@/components/exam/ViolationWarningModal';
import { useFullscreenLock } from '@/hooks/useFullscreenLock';

interface Answer {
    id: string;
    text: string;
    choice: string;
}

interface Question {
    id: string;
    questionNumber: number;
    imageUrl: string | null;
    content: string; // Added to parse true section
    section: string;
    answers: Answer[];
}

interface ExamData {
    exam: {
        id: string;
        title: string;
        pdfUrl: string;
        duration: number;
        maxViolations: number;
        questions: Question[];
    };
    startedAt: string;
    timeSpent: number;
    violationCount: number;
    savedAnswers: { questionId: string; selectedAnswer: string; isFlagged: boolean }[];
}

export default function ExamTakePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [unwrappedParams, setUnwrappedParams] = useState<{ id: string } | null>(null);
    const [data, setData] = useState<ExamData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeSpentSeconds, setTimeSpentSeconds] = useState(0); // Added state to sync with ref
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Fullscreen lock state
    const { isFullscreen, enterFullscreen, isSupported } = useFullscreenLock();
    const [showViolationModal, setShowViolationModal] = useState(false);
    const [violationCount, setViolationCount] = useState(0);
    const [maxViolations, setMaxViolations] = useState(3);
    const [isReturningToFullscreen, setIsReturningToFullscreen] = useState(false);
    const hasEnteredFullscreenRef = useRef(false);
    const isHandlingViolationRef = useRef(false);

    // Refs for auto-save and time tracking
    const answersRef = useRef(answers);
    const flaggedRef = useRef(flaggedQuestions);
    const timeSpentRef = useRef<number>(0); // Added
    const pendingSaveRef = useRef<boolean>(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        params.then(setUnwrappedParams);
    }, [params]);

    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    useEffect(() => {
        flaggedRef.current = flaggedQuestions;
    }, [flaggedQuestions]);

    // Periodic auto-save for time spent
    useEffect(() => {
        if (!unwrappedParams || loading) return;

        const interval = setInterval(() => {
            console.log('Periodic saving time:', timeSpentRef.current);
            saveProgress(answersRef.current, flaggedRef.current);
        }, 5000); // Save every 5 seconds

        return () => clearInterval(interval);
    }, [unwrappedParams, loading]);

    useEffect(() => {
        if (!unwrappedParams) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/student/exams/${unwrappedParams.id}/take`);
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to load exam');
                }
                const result = await res.json();

                // Initialize answers and flags from saved data
                const initialAnswers: Record<string, string> = {};
                const initialFlags: Record<string, boolean> = {};
                if (result.savedAnswers) {
                    result.savedAnswers.forEach((sa: any) => {
                        if (sa.selectedAnswer) initialAnswers[sa.questionId] = sa.selectedAnswer;
                        if (sa.isFlagged) initialFlags[sa.questionId] = true;
                    });
                }

                setData(result);
                setAnswers(initialAnswers);
                setFlaggedQuestions(initialFlags);
                setTimeSpentSeconds(result.timeSpent || 0);
                timeSpentRef.current = result.timeSpent || 0;
                setViolationCount(result.violationCount || 0);
                setMaxViolations(result.exam.maxViolations || 3);
                setLoading(false);
            } catch (err: any) {
                alert(err.message);
                router.push('/student/dashboard');
            }
        };

        fetchData();
    }, [unwrappedParams, router]);

    // Enter fullscreen on mount
    useEffect(() => {
        if (!loading && data && isSupported && !hasEnteredFullscreenRef.current) {
            hasEnteredFullscreenRef.current = true;
            enterFullscreen();
        }
    }, [loading, data, isSupported, enterFullscreen]);

    // Moved handleSubmit here to be accessible by handleViolation and wrapped in useCallback to prevent stale closures
    const handleSubmit = useCallback(async (autoSubmit = false) => {
        if (!unwrappedParams || !data) return;

        if (!autoSubmit && !confirm('Bạn có chắc chắn muốn nộp bài? Hành động này không thể hoàn tác.')) {
            return;
        }

        setIsSubmitting(true);
        try {
            // Force save latest answers first
            await fetch(`/api/student/exams/${unwrappedParams.id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answers: answersRef.current, // Use ref to ensure latest state
                    flagged: flaggedRef.current,
                    isFinalSubmission: true,
                    timeSpent: Math.floor(timeSpentRef.current)
                })
            });

            alert('Nộp bài thành công!');
            router.push(`/student/exams/${unwrappedParams.id}/result`);
        } catch (error) {
            console.error('Submission failed:', error);
            alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
            setIsSubmitting(false);
        }
    }, [unwrappedParams, data, router]);

    // Handle violation (call API and update state)
    const handleViolation = useCallback(async (type: string) => {
        if (!unwrappedParams || isHandlingViolationRef.current || isSubmitting) return;

        isHandlingViolationRef.current = true;

        try {
            const res = await fetch(`/api/student/exams/${unwrappedParams.id}/violation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type })
            });

            if (res.ok) {
                const result = await res.json();
                setViolationCount(result.violationCount);

                if (result.shouldAutoSubmit) {
                    // Max violations reached - auto submit
                    alert('Bạn đã vi phạm quá số lần cho phép. Bài thi sẽ được nộp tự động.');
                    handleSubmit(true);
                } else {
                    // Show warning modal
                    setShowViolationModal(true);
                }
            }
        } catch (error) {
            console.error('Failed to log violation:', error);
        } finally {
            isHandlingViolationRef.current = false;
        }
    }, [unwrappedParams, isSubmitting, handleSubmit]);

    // Listen for fullscreen exit
    useEffect(() => {
        if (loading || !data) return;

        const handleFullscreenChange = () => {
            // Only trigger violation if we've entered fullscreen before and now exited
            if (hasEnteredFullscreenRef.current && !document.fullscreenElement) {
                handleViolation('FULLSCREEN_EXIT');
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, [loading, data, handleViolation]);

    // Listen for tab/visibility change
    useEffect(() => {
        if (loading || !data) return;

        const handleVisibilityChange = () => {
            if (document.hidden && hasEnteredFullscreenRef.current) {
                handleViolation('TAB_SWITCH');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [loading, data, handleViolation]);

    // Handle return to fullscreen from modal
    const handleReturnToFullscreen = async () => {
        setIsReturningToFullscreen(true);
        const success = await enterFullscreen();
        if (success) {
            setShowViolationModal(false);
        }
        setIsReturningToFullscreen(false);
    };

    const saveProgress = async (currentAnswers: Record<string, string>, currentFlags: Record<string, boolean> = flaggedRef.current) => {
        if (!unwrappedParams || !data) return;
        setIsSaving(true);
        try {
            const response = await fetch(`/api/student/exams/${unwrappedParams.id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answers: currentAnswers,
                    flagged: currentFlags,
                    isFinalSubmission: false,
                    timeSpent: Math.floor(timeSpentRef.current)
                })
            });

            if (response.ok) {
                // Sync state so if component re-renders, it starts from latest saved point
                setTimeSpentSeconds(Math.floor(timeSpentRef.current));
                pendingSaveRef.current = false;
            }
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSelectAnswer = (choice: string, qId?: string) => {
        if (!data) return;

        const targetQuestionId = qId || data.exam.questions[currentQuestionIndex].id;

        const newAnswers = {
            ...answers,
            [targetQuestionId]: choice
        };

        setAnswers(newAnswers);

        // Auto-save logic: Debounce
        pendingSaveRef.current = true;
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            saveProgress(newAnswers, flaggedRef.current);
        }, 2000); // Auto-save after 2 seconds of inactivity
    };

    const handleToggleFlag = (qId: string) => {
        const newFlags = {
            ...flaggedQuestions,
            [qId]: !flaggedQuestions[qId]
        };
        setFlaggedQuestions(newFlags);

        // Auto-save logic: Debounce
        pendingSaveRef.current = true;
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            saveProgress(answersRef.current, newFlags);
        }, 2000);
    };



    const handleExit = async () => {
        if (confirm('Bạn có muốn tạm dừng làm bài? Tiến độ của bạn đã được lưu tự động.')) {
            await saveProgress(answersRef.current, flaggedRef.current); // Explicitly save before leaving
            router.push('/student/dashboard');
        }
    };

    const handleTick = (remainingSeconds: number) => {
        if (!data) return;
        const totalDurationSeconds = data.exam.duration * 60;
        timeSpentRef.current = totalDurationSeconds - remainingSeconds;
    };

    if (!unwrappedParams) return null;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cb-blue"></div>
            </div>
        );
    }

    if (!data) return null;

    const currentQuestion = data.exam.questions[currentQuestionIndex];

    return (
        <>
            {/* Violation Warning Modal */}
            <ViolationWarningModal
                isOpen={showViolationModal}
                violationCount={violationCount}
                maxViolations={maxViolations}
                onReturnToFullscreen={handleReturnToFullscreen}
                isReturning={isReturningToFullscreen}
            />

            <div className="min-h-screen bg-gray-100 flex flex-col h-screen overflow-hidden text-[#003366]">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 z-30 h-16 shadow-sm flex-shrink-0 relative">
                    <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleExit}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Thoát và Lưu"
                            >
                                <LogOut className="rotate-180" size={20} />
                            </button>
                            <h1 className="text-lg font-bold truncate max-w-sm hidden md:block" title={data.exam.title}>
                                {data.exam.title}
                            </h1>
                            <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>
                            <ExamTimer
                                durationMinutes={data.exam.duration}
                                timeSpentSeconds={timeSpentSeconds}
                                onExpire={() => handleSubmit(true)}
                                onTick={handleTick}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-xs font-semibold flex items-center gap-2">
                                {isSaving ? (
                                    <span className="text-yellow-600 flex items-center gap-1">
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                                        Đang lưu...
                                    </span>
                                ) : (
                                    <span className="text-green-600 flex items-center gap-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                                        Đã lưu
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={isSubmitting}
                                className="bg-cb-blue text-white px-6 py-2 rounded-lg font-bold text-sm tracking-wide hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
                            >
                                {isSubmitting ? 'ĐANG NỘP...' : 'NỘP BÀI'}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Layout: PDF + Sidebar */}
                <div className="flex-1 flex overflow-hidden">
                    {/* PDF Viewer (Left) */}
                    <div className="flex-1 bg-gray-200 relative">
                        {data.exam.pdfUrl ? (
                            <iframe
                                src={`${data.exam.pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                                className="w-full h-full border-none"
                                title="Descriptive Title"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <Save size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>Không tìm thấy file PDF</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-80 md:w-96 bg-white border-l border-gray-200 flex flex-col shadow-xl z-20">
                        {/* Current Question Control */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
                                        {currentQuestion.section}
                                    </span>
                                    <h2 className="text-2xl font-black text-gray-900 leading-none">
                                        Câu {currentQuestion.questionNumber}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => handleToggleFlag(currentQuestion.id)}
                                    className={`p-2 rounded-full transition-all ${flaggedQuestions[currentQuestion.id]
                                        ? 'bg-yellow-100 text-yellow-600'
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                        }`}
                                    title="Đánh dấu xem lại"
                                >
                                    <Bookmark size={20} className={flaggedQuestions[currentQuestion.id] ? 'fill-current' : ''} />
                                </button>
                            </div>

                            {/* Answer Options Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {['A', 'B', 'C', 'D'].map((choice) => (
                                    <button
                                        key={choice}
                                        onClick={() => handleSelectAnswer(choice)}
                                        className={`
                                        h-12 rounded-xl font-bold text-lg transition-all border-2 flex items-center justify-center
                                        ${answers[currentQuestion.id] === choice
                                                ? 'bg-cb-blue border-cb-blue text-white shadow-lg shadow-blue-500/30'
                                                : 'bg-white border-gray-200 text-gray-500 hover:border-cb-blue/50 hover:bg-blue-50'
                                            }
                                    `}
                                    >
                                        {choice}
                                    </button>
                                ))}
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                                    disabled={currentQuestionIndex === 0}
                                    className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
                                >
                                    Trước
                                </button>
                                <button
                                    onClick={() => setCurrentQuestionIndex(Math.min(data.exam.questions.length - 1, currentQuestionIndex + 1))}
                                    disabled={currentQuestionIndex === data.exam.questions.length - 1}
                                    className="flex-1 py-2 rounded-lg bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 disabled:opacity-40"
                                >
                                    Tiếp theo
                                </button>
                            </div>
                        </div>

                        {/* Question List (Answer Sheet) */}
                        <div className="flex-1 overflow-y-auto bg-white p-4">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <span className="text-xs font-bold text-gray-400 uppercase">Danh sách câu hỏi</span>
                                <span className="text-xs text-gray-400">
                                    {Object.keys(answers).length}/{data.exam.questions.length} đã làm
                                </span>
                            </div>

                            <AnswerSheet
                                variant="vertical"
                                questions={data.exam.questions}
                                answers={answers}
                                flaggedQuestions={flaggedQuestions}
                                currentQuestionIndex={currentQuestionIndex}
                                onNavigate={(index) => setCurrentQuestionIndex(index)}
                            />

                            <div className="mt-8 px-4 text-center">
                                <p className="text-xs text-gray-300 italic">
                                    * Click mốc câu hỏi để chuyển nhanh
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
