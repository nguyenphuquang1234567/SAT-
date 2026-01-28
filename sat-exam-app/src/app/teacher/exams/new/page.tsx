'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save } from 'lucide-react';
import InfoModal from '@/components/exam/InfoModal';

interface Class {
    id: string;
    name: string;
}

export default function NewExamPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState<Class[]>([]);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('QUIZ');
    const [duration, setDuration] = useState('60');
    const [classId, setClassId] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
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
        // Fetch classes for dropdown
        fetch('/api/classes')
            .then(res => res.json())
            .then(data => {
                setClasses(data);
                if (data.length > 0) {
                    setClassId(data[0].id);
                }
            })
            .catch(err => console.error(err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/exams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    type,
                    duration,
                    classId,
                    startTime: startTime || null,
                    endTime: endTime || null,
                }),
            });

            if (res.ok) {
                router.push('/teacher/exams'); // Redirect to list
            } else {
                const text = await res.text();
                setInfoModal({
                    isOpen: true,
                    title: 'Lỗi',
                    message: `Lỗi: ${text}`,
                    type: 'error'
                });
            }
        } catch (error) {
            console.error(error);
            setInfoModal({
                isOpen: true,
                title: 'Lỗi',
                message: 'Có lỗi xảy ra khi tạo bài thi',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/teacher/exams" className="text-slate-500 hover:text-cb-blue font-bold text-xs uppercase tracking-widest flex items-center gap-1 mb-6">
                <ChevronLeft size={16} /> Quay lại danh sách
            </Link>

            <h1 className="text-3xl font-black italic text-cb-blue dark:text-white uppercase tracking-tighter mb-8">
                Tạo Bài Thi Mới
            </h1>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-cb-blue-900 border-4 border-cb-blue dark:border-cb-blue-800 p-8 shadow-academic-bold">

                {/* General Info */}
                <div className="mb-6">
                    <label className="block text-cb-blue dark:text-white text-xs font-black uppercase tracking-widest mb-2">Tên Bài Thi</label>
                    <input
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-cb-blue-950 border-2 border-slate-200 dark:border-cb-blue-800 p-3 font-bold text-cb-blue dark:text-white focus:outline-none focus:border-cb-blue dark:focus:border-cb-yellow"
                        placeholder="Ví dụ: Quiz Toán Tuần 1"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Mô Tả (Không bắt buộc)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-cb-blue-950 border-2 border-slate-200 dark:border-cb-blue-800 p-3 font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cb-blue dark:focus:border-cb-yellow"
                        placeholder="Nội dung bài thi, dặn dò..."
                    />
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Loại Bài Thi</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-cb-blue-950 border-2 border-slate-200 dark:border-cb-blue-800 p-3 font-bold text-cb-blue dark:text-white focus:outline-none focus:border-cb-blue dark:focus:border-cb-yellow"
                        >
                            <option value="QUIZ">Quiz</option>
                            <option value="MIDTERM">Midterm</option>
                            <option value="FINAL">Final</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Thời gian (phút)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-cb-blue-950 border-2 border-slate-200 dark:border-cb-blue-800 p-3 font-bold text-cb-blue dark:text-white focus:outline-none focus:border-cb-blue dark:focus:border-cb-yellow"
                        />
                    </div>
                </div>

                {/* Class Assignment */}
                <div className="mb-6">
                    <label className="block text-cb-blue dark:text-white text-xs font-black uppercase tracking-widest mb-2">Gán Cho Lớp</label>
                    {classes.length === 0 ? (
                        <p className="text-red-500 text-xs font-bold italic">Bạn cần tạo lớp học trước khi tạo bài thi.</p>
                    ) : (
                        <select
                            value={classId}
                            onChange={(e) => setClassId(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-cb-blue-950 border-2 border-slate-200 dark:border-cb-blue-800 p-3 font-bold text-cb-blue dark:text-white focus:outline-none focus:border-cb-blue dark:focus:border-cb-yellow"
                        >
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Schedule */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Bắt đầu (Optional)</label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-cb-blue-950 border-2 border-slate-200 dark:border-cb-blue-800 p-3 font-medium text-sm text-cb-blue dark:text-white focus:outline-none focus:border-cb-blue dark:focus:border-cb-yellow"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Kết thúc (Optional)</label>
                        <input
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-cb-blue-950 border-2 border-slate-200 dark:border-cb-blue-800 p-3 font-medium text-sm text-cb-blue dark:text-white focus:outline-none focus:border-cb-blue dark:focus:border-cb-yellow"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t font-bold border-slate-100 dark:border-white/10">
                    <button
                        type="submit"
                        disabled={loading || classes.length === 0}
                        className="bg-cb-yellow hover:bg-yellow-400 text-cb-blue px-8 py-3 font-black uppercase tracking-widest shadow-academic hover:shadow-academic-hover hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? 'Đang lưu...' : <><Save size={18} /> Lưu Bài Thi (Nháp)</>}
                    </button>
                </div>
            </form>

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
