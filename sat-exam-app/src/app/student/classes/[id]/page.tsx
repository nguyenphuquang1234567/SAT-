'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    BookOpen,
    Clock,
    Calendar,
    ChevronRight,
    AlertCircle,
    CheckCircle,
    BarChart3,
    ArrowLeft,
    Users,
    FileText,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface Exam {
    id: string;
    title: string;
    description: string;
    duration: number;
    startTime: string | null;
    questionCount: number;
    status: string;
    attemptStatus: string;
}

interface CompletedExam {
    id: string;
    title: string;
    duration: number;
    questionCount: number;
    score: number;
    maxScore: number;
    submittedAt: string;
    violationCount: number;
}

interface ClassDetail {
    class: {
        id: string;
        name: string;
        description: string;
        code: string;
        teacher: string;
    };
    availableExams: Exam[];
    completedExams: CompletedExam[];
}

export default function StudentClassDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<ClassDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!params.id) return;

        setLoading(true);
        fetch(`/api/student/classes/${params.id}`)
            .then(async res => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || 'Failed to fetch class details');
                }
                return res.json();
            })
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cb-blue"></div>
            </div>
        );
    }

    if (!data) return (
        <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-4">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h2 className="text-2xl font-black text-cb-blue mb-2">
                {error || "Không tìm thấy lớp học"}
            </h2>
            <p className="text-gray-500 mb-6 max-w-md">
                Có lỗi xảy ra khi tải dữ liệu. Vui lòng kiểm tra lại quyền truy cập hoặc thử lại sau.
            </p>
            <button
                onClick={() => router.push('/student/classes')}
                className="px-6 py-3 bg-cb-blue text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-900/10 hover:bg-blue-700 transition-all flex items-center gap-2"
            >
                <ArrowLeft size={16} /> Quay lại danh sách lớp
            </button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/student/classes')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-cb-blue" />
                </button>
                <div>
                    <h1 className="text-4xl font-black text-cb-blue uppercase italic tracking-tight">{data.class.name}</h1>
                    <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm font-bold text-gray-500 italic">Mã lớp: {data.class.code}</span>
                        <span className="text-sm font-bold text-gray-500 italic">Gv: {data.class.teacher}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Available Exams */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 mb-6">
                            <Clock className="text-cb-blue" />
                            BÀI THI CẦN THỰC HIỆN
                        </h2>

                        {data.availableExams.length > 0 ? (
                            <div className="grid gap-6">
                                {data.availableExams.map((exam) => (
                                    <div key={exam.id} className="bg-white rounded-2xl p-6 border-2 border-gray-50 shadow-sm hover:shadow-xl hover:border-cb-blue/20 transition-all group overflow-hidden relative">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-cb-yellow"></div>

                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-4">
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-black text-cb-blue group-hover:text-blue-700 transition-colors">
                                                    {exam.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-400">
                                                    <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                        <Clock size={16} className="text-cb-yellow" />
                                                        {exam.duration} phút
                                                    </span>
                                                    <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                        <FileText size={16} className="text-cb-yellow" />
                                                        {exam.questionCount} câu hỏi
                                                    </span>
                                                    {exam.status === 'ACTIVE' && (
                                                        <span className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg uppercase tracking-wider text-[10px]">
                                                            Đang diễn ra
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <Link
                                                href={`/student/exams/${exam.id}/intro`}
                                                className="flex items-center justify-center gap-2 px-8 py-3 bg-cb-blue text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-900/10 hover:bg-blue-700 transition-all self-start md:self-center"
                                            >
                                                {exam.attemptStatus === 'IN_PROGRESS' ? 'Tiếp tục thi' : 'Bắt đầu làm bài'}
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl py-12 px-8 text-center border-2 border-dashed border-gray-100">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="text-lg font-black text-cb-blue">Tất cả bài thi đã hoàn thành!</h3>
                                <p className="text-gray-400 font-medium">Hiện không có bài thi mới nào trong lớp học này.</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar: Completed Exams */}
                <div className="lg:col-span-1 space-y-8">
                    <section className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 mb-6">
                            <BarChart3 className="text-cb-blue" />
                            KẾT QUẢ ĐÃ NỘP
                        </h2>

                        <div className="space-y-6">
                            {data.completedExams.length > 0 ? (
                                data.completedExams.map((result) => (
                                    <div key={result.id} className="relative pl-4 border-l-4 border-gray-100 hover:border-cb-blue transition-colors py-1 group">
                                        <Link href={`/student/exams/${result.id}/result`} className="block">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                                                {new Date(result.submittedAt).toLocaleDateString('vi-VN')}
                                            </p>
                                            <h4 className="font-black text-cb-blue mb-3 group-hover:text-blue-700 transition-colors">
                                                {result.title}
                                            </h4>

                                            <div className="flex items-center gap-4">
                                                <div className={`px-3 py-1.5 rounded-lg flex flex-col items-center justify-center min-w-[60px] ${(result.score / result.maxScore) >= 0.8 ? 'bg-green-50 text-green-700' :
                                                    (result.score / result.maxScore) >= 0.5 ? 'bg-yellow-50 text-yellow-700' :
                                                        'bg-red-50 text-red-700'
                                                    }`}>
                                                    <span className="text-xs font-black uppercase tracking-tighter">Điểm số</span>
                                                    <span className="font-black text-lg">{result.score}/{result.maxScore}</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase">Tóm tắt</div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                                                            <Clock size={12} /> {result.duration}m
                                                        </div>
                                                        {result.violationCount > 0 && (
                                                            <div className="flex items-center gap-1 text-[11px] font-bold text-red-500">
                                                                <AlertCircle size={12} /> {result.violationCount} lỗi
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <div className="inline-block p-4 rounded-full bg-gray-50 text-gray-300 mb-2">
                                        <BarChart3 size={24} />
                                    </div>
                                    <p className="text-sm font-bold text-gray-400 italic">Chưa có bài thi nào được nộp.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
