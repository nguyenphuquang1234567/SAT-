
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Calendar, ChevronRight, AlertCircle, CheckCircle, BarChart3, ArrowRight, Plus, X } from 'lucide-react';

interface DashboardData {
    classes: {
        id: string;
        name: string;
        code: string;
        teacher: string;
        studentCount: number;
        examCount: number;
    }[];
    upcomingExams: {
        id: string;
        title: string;
        className: string;
        duration: number;
        startTime: string | null;
        endTime: string | null;
        questionCount: number;
        status: string;
        attemptStatus: string;
    }[];
    history: {
        id: string;
        examId: string;
        examTitle: string;
        score: number;
        maxScore: number;
        submittedAt: string;
        violationCount: number;
    }[];
}

export default function StudentDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [joinError, setJoinError] = useState<string | null>(null);

    const fetchDashboardData = () => {
        setLoading(true);
        fetch('/api/student/dashboard')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch dashboard');
                return res.json();
            })
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleJoinClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode.trim()) return;

        setIsJoining(true);
        setJoinError(null);

        try {
            const res = await fetch('/api/classes/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: joinCode })
            });

            if (!res.ok) {
                const message = await res.text();
                throw new Error(message || 'Failed to join class');
            }

            setShowJoinModal(false);
            setJoinCode('');
            fetchDashboardData(); // Refresh data
            alert('Tham gia lớp học thành công!');
        } catch (err: any) {
            setJoinError(err.message);
        } finally {
            setIsJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cb-blue"></div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-cb-blue mb-2">Xin chào! 👋</h1>
                    <p className="text-gray-500">Đây là tổng quan tình hình học tập của bạn.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Upcoming & Classes */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Section: Upcoming Exams */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                                <Clock className="text-cb-blue" />
                                BÀI THI SẮP TỚI
                            </h2>
                        </div>

                        {data.upcomingExams.length > 0 ? (
                            <div className="grid gap-4">
                                {data.upcomingExams.map((exam) => (
                                    <div key={exam.id} className="group bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all border-l-4 border-l-cb-yellow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-gray-50 mb-2">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{exam.className}</span>
                                                </div>
                                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-cb-blue transition-colors">{exam.title}</h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-500 font-medium">
                                                    {exam.startTime && (
                                                        <span className="flex items-center gap-1 text-cb-blue font-bold">
                                                            <Calendar size={14} /> Deadline: {new Date(exam.startTime).toLocaleString('vi-VN', {
                                                                weekday: 'short',
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} /> {exam.duration} phút
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <BookOpen size={14} /> {exam.questionCount} câu hỏi
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {exam.endTime && new Date() > new Date(exam.endTime) ? (
                                                    <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-sm border border-red-100 flex items-center gap-2">
                                                        <X size={16} /> Hết hạn
                                                    </div>
                                                ) : (
                                                    <Link
                                                        href={`/student/exams/${exam.id}/intro`}
                                                        className="bg-cb-blue text-white px-5 py-2 rounded-lg font-bold text-sm shadow-lg shadow-blue-900/10 hover:bg-blue-700 transition-all flex items-center gap-2"
                                                    >
                                                        Làm bài <ArrowRight size={16} />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-200">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-gray-400">
                                    <CheckCircle size={24} />
                                </div>
                                <p className="font-medium text-gray-500">Không có bài thi nào sắp tới.</p>
                            </div>
                        )}
                    </section>

                    {/* Section: Enrolled Classes */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                                <BookOpen className="text-cb-blue" />
                                LỚP HỌC CỦA TÔI
                            </h2>
                            <button
                                onClick={() => setShowJoinModal(true)}
                                className="text-xs font-bold text-cb-blue flex items-center gap-1 hover:underline"
                            >
                                <Plus size={14} /> Tham gia lớp mới
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.classes.length > 0 ? (
                                data.classes.map((cls) => (
                                    <div key={cls.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                        <div className="bg-cb-blue/5 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-cb-blue font-black">
                                            {cls.code.substring(0, 2)}
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-1">{cls.name}</h3>
                                        <p className="text-sm text-gray-500 mb-4">GV: {cls.teacher}</p>

                                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <span>{cls.studentCount} Học viên</span>
                                            <span>{cls.examCount} Bài thi</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-200">
                                    <p className="font-medium text-gray-500">Bạn chưa tham gia lớp học nào.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column: History */}
                <div className="lg:col-span-1">
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
                        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 mb-6">
                            <BarChart3 className="text-cb-blue" />
                            KẾT QUẢ GẦN ĐÂY
                        </h2>

                        <div className="space-y-4">
                            {data.history.length > 0 ? (
                                data.history.map((result) => (
                                    <div key={result.id} className="relative group pl-4 border-l-2 border-gray-100 hover:border-cb-blue transition-colors py-1">
                                        <Link href={`/student/exams/${result.examId}/result`} className="block">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                {new Date(result.submittedAt).toLocaleDateString()}
                                            </p>
                                            <h4 className="font-bold text-sm text-gray-900 mb-2 group-hover:text-cb-blue transition-colors">
                                                {result.examTitle}
                                            </h4>

                                            <div className="flex items-center gap-3">
                                                <div className={`px-3 py-1 rounded-md font-bold text-sm ${(result.score / result.maxScore) >= 0.8 ? 'bg-green-100 text-green-700' :
                                                    (result.score / result.maxScore) >= 0.5 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {result.score}/{result.maxScore}
                                                </div>

                                                {result.violationCount > 0 && (
                                                    <div className="flex items-center gap-1 text-xs font-bold text-red-500" title={`${result.violationCount} vi phạm`}>
                                                        <AlertCircle size={12} /> {result.violationCount}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="inline-block p-3 rounded-full bg-gray-50 text-gray-400 mb-2">
                                        <BarChart3 size={20} />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">Chưa có kết quả nào.</p>
                                </div>
                            )}
                        </div>

                        {data.history.length > 0 && (
                            <Link
                                href="/student/history"
                                className="block w-full text-center py-3 mt-6 text-sm font-bold text-gray-500 hover:text-cb-blue hover:bg-gray-50 rounded-lg transition-all"
                            >
                                Xem tất cả lịch sử
                            </Link>
                        )}
                    </section>
                </div>
            </div>
            {/* Join Class Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cb-blue/20 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-cb-blue uppercase italic tracking-tight">Tham gia lớp học</h2>
                                <button onClick={() => setShowJoinModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <p className="text-gray-500 font-medium mb-6">Nhập mã lớp được cung cấp bởi giáo viên của bạn để tham gia vào lớp học.</p>

                            <form onSubmit={handleJoinClass} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-cb-blue uppercase tracking-widest mb-2">Mã lớp</label>
                                    <input
                                        type="text"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value)}
                                        placeholder="Ví dụ: LOP123"
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-cb-blue focus:ring-0 transition-all font-bold text-cb-blue placeholder:text-gray-300"
                                        autoFocus
                                    />
                                    {joinError && <p className="mt-2 text-xs font-bold text-red-500 italic">{joinError}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isJoining || !joinCode.trim()}
                                    className="w-full py-4 bg-cb-blue text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-blue-900/10 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isJoining ? 'Đang xử lý...' : 'Tham gia ngay'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
