'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Plus, FileText, Clock, Users, BookOpen, Upload, Calendar } from 'lucide-react';

interface Exam {
    id: string;
    title: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED';
    duration: number;
    class: {
        name: string;
    };
    _count: {
        questions: number;
        studentExams: number;
    };
    createdAt: string;
}

export default function ExamsManagementPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/exams')
            .then((res) => res.json())
            .then((data) => {
                setExams(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setExams([]);
                setLoading(false);
            });
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return 'text-green-500 border-green-200 bg-green-50 dark:bg-green-900/20';
            case 'ACTIVE': return 'text-blue-500 border-blue-200 bg-blue-50 dark:bg-blue-900/20';
            case 'COMPLETED': return 'text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-800';
            default: return 'text-slate-500 border-slate-200 bg-slate-50 dark:bg-white/5'; // DRAFT
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-black italic text-cb-blue dark:text-white uppercase tracking-tighter">
                        Quản Lý Bài Thi
                    </h1>
                    <p className="text-slate-500 font-medium">Tạo và quản lý các bài kiểm tra cho học sinh.</p>
                </div>
                <Link
                    href="/teacher/exams/new"
                    className="bg-cb-yellow hover:bg-yellow-400 text-cb-blue px-6 py-3 font-black uppercase tracking-widest text-sm shadow-academic hover:translate-y-[-2px] hover:shadow-academic-hover transition-all flex items-center gap-2"
                >
                    <Plus size={20} /> Tạo Bài Thi Mới
                </Link>
            </div>


            {loading ? (
                <div className="text-center p-10 font-bold text-slate-400">Loading data...</div>
            ) : exams.length === 0 ? (
                <div className="bg-white dark:bg-cb-blue-900 border-4 border-dashed border-slate-300 dark:border-cb-blue-800 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-cb-blue dark:text-white mb-2">Chưa có bài thi nào</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        Hãy tạo bài thi đầu tiên để đánh giá năng lực học sinh. Bạn có thể tạo Quiz, Midterm hoặc Final Exam.
                    </p>
                    <Link
                        href="/teacher/exams/new"
                        className="text-cb-blue dark:text-cb-yellow font-black uppercase tracking-widest text-xs hover:underline"
                    >
                        + Tạo bài thi ngay
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {exams.map((exam) => (
                        <Link
                            href={`/teacher/exams/${exam.id}`}
                            key={exam.id}
                            className="block bg-white dark:bg-cb-blue-900 border-l-4 border-cb-blue hover:border-cb-yellow shadow-sm hover:shadow-md transition-all p-6 group"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-1 border text-[10px] font-black uppercase tracking-widest ${getStatusColor(exam.status)}`}>
                                            {exam.status}
                                        </span>
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                            <BookOpen size={12} /> {exam.class.name}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-cb-blue dark:text-white group-hover:text-cb-yellow transition-colors mb-2">
                                        {exam.title}
                                    </h3>
                                    <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} />
                                            {exam.duration} phút
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FileText size={16} />
                                            {exam._count.questions} câu hỏi
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users size={16} />
                                            {exam._count.studentExams} bài nộp
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-slate-400 font-mono">
                                        Created: {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
