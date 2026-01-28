'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Edit, Clock, Calendar, CheckCircle, FileText, Settings, Trash2, ChartBar } from 'lucide-react';
import ConfirmModal from '@/components/exam/ConfirmModal';
import InfoModal from '@/components/exam/InfoModal';


interface Question {
    id: string;
    content: string;
    points: number;
}

interface ExamDetail {
    id: string;
    title: string;
    description: string | null;
    status: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED';
    duration: number;
    startTime: string | null;
    endTime: string | null;
    class: {
        id: string;
        name: string;
    };
    questions: Question[];
}

export default function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [exam, setExam] = useState<ExamDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
        fetch(`/api/exams/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load');
                return res.json();
            })
            .then(data => {
                setExam(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const handleStatusChange = async (newStatus: string) => {
        setPublishing(true);
        try {
            const res = await fetch(`/api/exams/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setExam(prev => prev ? { ...prev, status: newStatus as any } : null);
            } else {
                setInfoModal({
                    isOpen: true,
                    title: 'Lỗi',
                    message: 'Cập nhật trạng thái thất bại',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error(error);
            setInfoModal({
                isOpen: true,
                title: 'Lỗi',
                message: 'Lỗi hệ thống',
                type: 'error'
            });
        } finally {
            setPublishing(false);
        }
    };

    const handleDelete = async (isConfirmed = false) => {
        if (!isConfirmed) {
            setShowDeleteConfirm(true);
            return;
        }

        setShowDeleteConfirm(false);
        try {
            const res = await fetch(`/api/exams/${id}`, { method: 'DELETE' });
            if (res.ok) {
                router.push('/teacher/exams');
            } else {
                setInfoModal({
                    isOpen: true,
                    title: 'Lỗi',
                    message: 'Xóa bài thi thất bại',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error(error);
            setInfoModal({
                isOpen: true,
                title: 'Lỗi',
                message: 'Lỗi hệ thống',
                type: 'error'
            });
        }
    }

    if (loading) return <div className="p-10 text-slate-400 font-bold">Loading exam...</div>;
    if (!exam) return <div className="p-10 text-red-500 font-bold">Exam not found</div>;

    return (
        <div>
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <Link href="/teacher/exams" className="text-slate-500 hover:text-cb-blue font-bold text-xs uppercase tracking-widest flex items-center gap-1 mb-2">
                        <ChevronLeft size={16} /> Danh sách bài thi
                    </Link>
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-4xl font-black italic text-cb-blue dark:text-white uppercase tracking-tighter">
                            {exam.title}
                        </h1>
                        <span className={`px-3 py-1 text-xs font-black uppercase tracking-widest border ${exam.status === 'PUBLISHED' ? 'bg-green-100 text-green-600 border-green-200' :
                            exam.status === 'ACTIVE' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                                'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                            {exam.status}
                        </span>
                    </div>
                    <p className="text-slate-500 font-medium max-w-2xl">{exam.description || 'Chưa có mô tả'}</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => handleDelete()}
                        className="px-4 py-2 border-2 border-red-200 text-red-500 hover:bg-red-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
                    >
                        <Trash2 size={16} /> Xóa
                    </button>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-cb-blue-900 border-l-4 border-cb-yellow p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-cb-blue dark:text-cb-yellow">
                        <Clock size={24} />
                        <h3 className="font-black uppercase tracking-widest text-sm">Thời Gian</h3>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-bold dark:text-white">{exam.duration} phút</p>
                        {exam.startTime && (
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                Start: {new Date(exam.startTime).toLocaleString('vi-VN')}
                            </p>
                        )}
                        {exam.endTime && (
                            <p className="text-xs font-bold text-red-400 uppercase tracking-tighter">
                                End: {new Date(exam.endTime).toLocaleString('vi-VN')}
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-cb-blue-900 border-l-4 border-cb-blue p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-cb-blue dark:text-white">
                        <Calendar size={24} />
                        <h3 className="font-black uppercase tracking-widest text-sm">Lớp Học</h3>
                    </div>
                    <Link href={`/teacher/classes/${exam.class.id}`} className="text-2xl font-bold hover:underline dark:text-white">
                        {exam.class.name}
                    </Link>
                </div>

                <div className="bg-white dark:bg-cb-blue-900 border-l-4 border-slate-300 dark:border-slate-600 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-300">
                        <FileText size={24} />
                        <h3 className="font-black uppercase tracking-widest text-sm">Câu Hỏi</h3>
                    </div>
                    <p className="text-2xl font-bold dark:text-white">{exam.questions.length} câu</p>
                </div>
            </div>

            {/* Main Action Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Questions Preview (Placeholder) */}
                <div className="lg:col-span-2 bg-white dark:bg-cb-blue-900 border-4 border-slate-200 dark:border-cb-blue-800 p-8 shadow-academic">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
                        <h3 className="text-lg font-black italic uppercase text-cb-blue dark:text-white">Danh sách câu hỏi</h3>
                        <Link href={`/teacher/exams/${id}/questions`} className="text-xs font-bold text-cb-blue dark:text-cb-yellow uppercase tracking-widest hover:underline">
                            + Quản lý câu hỏi
                        </Link>
                    </div>

                    {exam.questions.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <p className="italic mb-4">Chưa có câu hỏi nào trong đề thi này.</p>
                            <Link href={`/teacher/exams/${id}/questions/new`}>
                                <button className="bg-cb-blue dark:bg-cb-yellow text-white dark:text-cb-blue px-6 py-2 font-bold text-xs uppercase tracking-widest hover:opacity-90">
                                    Thêm câu hỏi thủ công
                                </button>
                            </Link>
                            <p className="my-2 text-xs font-bold uppercase">-- Hoặc --</p>
                            <Link href={`/teacher/exams/${id}/questions`} className="inline-block text-cb-blue dark:text-cb-yellow font-black uppercase text-xs hover:underline">
                                Upload PDF (AI Parse)
                            </Link>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {exam.questions.map((q, i) => (
                                <li key={q.id} className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                    <span className="font-black text-cb-blue dark:text-cb-yellow mr-2">Câu {i + 1}:</span>
                                    <span className="text-slate-700 dark:text-slate-300 line-clamp-1">{q.content}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Publish Actions */}
                <div className="bg-cb-blue dark:bg-cb-yellow/10 p-6 text-white shadow-academic-bold h-fit">
                    <Link
                        href={`/teacher/exams/${id}/results`}
                        className="w-full bg-white text-cb-blue hover:bg-gray-100 py-3 mb-6 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg"
                    >
                        <ChartBar size={16} /> Xem Kết Quả & Thống Kê
                    </Link>

                    <h3 className="text-lg font-black italic uppercase mb-4 border-b border-white/20 pb-2">Trạng Thái</h3>


                    <div className="space-y-4">
                        {exam.status === 'DRAFT' && (
                            <div className="bg-white/10 p-4 mb-4 text-sm">
                                <p className="mb-2">Bài thi đang ở chế độ Nháp. Học sinh chưa thể nhìn thấy.</p>
                                <button
                                    onClick={() => handleStatusChange('PUBLISHED')}
                                    disabled={publishing}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <CheckCircle size={16} /> Xuất Bản (Publish)
                                </button>
                            </div>
                        )}

                        {exam.status === 'PUBLISHED' && (
                            <div className="bg-green-500/20 p-4 mb-4 border border-green-500/50 text-sm">
                                <p className="font-bold flex items-center gap-2 mb-2 text-green-300"><CheckCircle size={16} /> Đã Xuất Bản</p>
                                <p className="mb-4 text-white/80">Học sinh đã có thể nhìn thấy bài thi này.</p>
                                <button
                                    onClick={() => handleStatusChange('DRAFT')}
                                    disabled={publishing}
                                    className="w-full bg-white/20 hover:bg-white/30 text-white py-2 font-bold uppercase tracking-widest text-[10px]"
                                >
                                    Chuyển về Nháp
                                </button>
                            </div>
                        )}

                        <div className="text-xs text-white/50 pt-4 border-t border-white/10">
                            <p>Created: {new Date().toLocaleDateString('vi-VN')}</p>
                            <p>ID: {exam.id}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="Xóa bài thi?"
                message="CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn bài thi và mọi kết quả liên quan. Không thể hoàn tác!"
                confirmText="Xóa vĩnh viễn"
                cancelText="Hủy"
                variant="danger"
                onConfirm={() => handleDelete(true)}
                onCancel={() => setShowDeleteConfirm(false)}
            />

            {/* General Info Modal */}
            <InfoModal
                isOpen={infoModal.isOpen}
                title={infoModal.title}
                message={infoModal.message}
                type={infoModal.type}
                onClose={() => setInfoModal(prev => ({ ...prev, isOpen: false }))}
            />
        </div >
    );
}
