'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreateClassPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
        };

        try {
            const res = await fetch('/api/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error('Failed to create class');
            }

            router.push('/teacher/classes');
            router.refresh();
        } catch (err) {
            setError('Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mb-8">
                <Link href="/teacher/classes" className="text-slate-500 hover:text-cb-blue font-bold text-xs uppercase tracking-widest flex items-center gap-1 mb-2">
                    <ChevronLeft size={16} /> Quay lại
                </Link>
                <DashboardHeader title="Tạo Lớp Học Mới" />
            </div>

            <div className="max-w-2xl bg-white dark:bg-cb-blue-900 border-4 border-cb-blue dark:border-cb-yellow/30 shadow-academic p-8">
                {error && (
                    <div className="bg-red-100 text-red-600 p-4 border-2 border-red-200 mb-6 font-bold text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-cb-blue dark:text-cb-yellow font-black uppercase text-xs tracking-widest mb-2">
                            Tên Lớp Học <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            name="name"
                            id="name"
                            className="w-full bg-slate-50 dark:bg-cb-blue-950 border-2 border-slate-200 dark:border-cb-blue-800 p-3 font-bold text-cb-blue dark:text-white focus:outline-none focus:border-cb-blue dark:focus:border-cb-yellow transition-colors"
                            placeholder="VD: SAT Math K12 - 2024"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-cb-blue dark:text-cb-yellow font-black uppercase text-xs tracking-widest mb-2">
                            Mô Tả
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            rows={4}
                            className="w-full bg-slate-50 dark:bg-cb-blue-950 border-2 border-slate-200 dark:border-cb-blue-800 p-3 font-bold text-cb-blue dark:text-white focus:outline-none focus:border-cb-blue dark:focus:border-cb-yellow transition-colors"
                            placeholder="Mô tả ngắn gọn về lớp học..."
                        />
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 border-2 border-transparent text-slate-400 font-bold uppercase tracking-widest hover:text-cb-blue dark:hover:text-white transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-cb-blue dark:bg-cb-yellow text-white dark:text-cb-blue py-3 font-black uppercase tracking-widest hover:bg-cb-blue-800 dark:hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 shadow-academic hover:shadow-academic-bold hover:-translate-y-1 active:translate-y-0"
                        >
                            {loading ? 'Đang tạo...' : (
                                <>
                                    <Save size={18} />
                                    Tạo Lớp
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
