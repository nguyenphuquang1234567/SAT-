'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Correct import for App Router
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { ChevronLeft, Trash2, Copy, Check } from 'lucide-react';

interface Student {
    id: string;
    student: {
        id: string;
        name: string;
        email: string;
    };
    joinedAt: string;
}

interface ClassDetail {
    id: string;
    name: string;
    code: string;
    description: string;
    students: Student[];
}

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter(); // Initialize router
    const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch(`/api/classes/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then((data) => {
                setClassDetail(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const handleCopyCode = () => {
        if (classDetail?.code) {
            navigator.clipboard.writeText(classDetail.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDeleteClass = async () => {
        if (confirm("Bạn có chắc chắn muốn xóa lớp này? Hành động này không thể hoàn tác.")) {
            try {
                const res = await fetch(`/api/classes/${id}`, {
                    method: 'DELETE',
                });
                if (res.ok) {
                    router.push('/teacher/classes'); // Correct usage
                } else {
                    alert("Xóa thất bại");
                }
            } catch (error) {
                console.error("Delete error", error);
                alert("Có lỗi xảy ra");
            }
        }
    };

    const handleRemoveStudent = async (studentId: string) => {
        if (confirm("Xóa học sinh này khỏi lớp?")) {
            try {
                const res = await fetch(`/api/classes/${id}/students/${studentId}`, {
                    method: 'DELETE',
                });
                if (res.ok) {
                    // Update state locally
                    setClassDetail(prev => prev ? ({
                        ...prev,
                        students: prev.students.filter(s => s.student.id !== studentId)
                    }) : null);
                } else {
                    alert("Xóa thất bại");
                }
            } catch (error) {
                console.error("Remove student error", error);
            }
        }
    }


    const [addEmail, setAddEmail] = useState('');
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState('');

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError('');

        try {
            const res = await fetch(`/api/classes/${id}/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: addEmail }),
            });

            if (res.ok) {
                const newEnrollment = await res.json();
                setClassDetail(prev => prev ? ({
                    ...prev,
                    students: [...prev.students, newEnrollment]
                }) : null);
                setAddEmail('');
            } else {
                const errorText = await res.text();
                setAddError(errorText || "Thêm học sinh thất bại");
            }
        } catch (error) {
            setAddError("Có lỗi xảy ra");
        } finally {
            setAddLoading(false);
        }
    };

    if (loading) return <div className="p-10 font-bold text-slate-400">Loading...</div>;
    if (!classDetail) return <div className="p-10 text-red-500 font-bold">Class not found</div>;

    return (
        <>
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <Link href="/teacher/classes" className="text-slate-500 hover:text-cb-blue font-bold text-xs uppercase tracking-widest flex items-center gap-1 mb-2">
                        <ChevronLeft size={16} /> Danh sách lớp
                    </Link>
                    <h1 className="text-4xl font-black italic text-cb-blue dark:text-white uppercase tracking-tighter mb-2">
                        {classDetail.name}
                    </h1>
                    <p className="text-slate-500 font-medium">{classDetail.description}</p>
                </div>

                <button
                    onClick={handleDeleteClass}
                    className="px-4 py-2 border-2 border-red-200 text-red-500 hover:bg-red-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                    <Trash2 size={16} /> Xóa Lớp
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Class Code Banner */}
                <div className="lg:col-span-2 bg-cb-blue dark:bg-cb-yellow p-6 shadow-academic flex items-center justify-between">
                    <div>
                        <p className="text-white/60 dark:text-cb-blue/60 text-xs font-black uppercase tracking-[0.2em] mb-1">Mã Lớp (Class Code)</p>
                        <p className="text-4xl font-black text-white dark:text-cb-blue tracking-widest font-mono">{classDetail.code}</p>
                    </div>
                    <button
                        onClick={handleCopyCode}
                        className="bg-white/10 hover:bg-white/20 text-white dark:text-cb-blue p-3 rounded-none transition-colors"
                        title="Copy Code"
                    >
                        {copied ? <Check size={24} /> : <Copy size={24} />}
                    </button>
                </div>

                {/* Quick Add Student */}
                <div className="bg-white dark:bg-cb-blue-900 border-4 border-cb-blue dark:border-cb-blue-800 p-6 shadow-academic">
                    <p className="text-cb-blue dark:text-cb-yellow text-[10px] font-black uppercase tracking-widest mb-4">Thêm Học Sinh Nhanh</p>
                    <form onSubmit={handleAddStudent} className="flex flex-col gap-3">
                        <input
                            value={addEmail}
                            onChange={(e) => setAddEmail(e.target.value)}
                            type="email"
                            placeholder="Email học sinh..."
                            required
                            className="bg-slate-50 dark:bg-cb-blue-950 border-2 border-slate-200 dark:border-cb-blue-800 p-2 text-sm font-bold text-cb-blue dark:text-white focus:outline-none focus:border-cb-blue dark:focus:border-cb-yellow"
                        />
                        <button
                            disabled={addLoading}
                            type="submit"
                            className="bg-cb-blue dark:bg-cb-yellow text-white dark:text-cb-blue py-2 text-xs font-black uppercase tracking-widest hover:bg-cb-blue-800 dark:hover:bg-yellow-400 transition-colors"
                        >
                            {addLoading ? 'Đang thêm...' : 'Thêm vào lớp'}
                        </button>
                    </form>
                    {addError && <p className="mt-2 text-[10px] text-red-500 font-bold">{addError}</p>}
                </div>
            </div>

            {/* Student List */}
            <div className="bg-white dark:bg-cb-blue-900 border-4 border-cb-blue dark:border-cb-yellow/20 shadow-academic-bold p-8">
                <h2 className="text-xl font-black italic uppercase text-cb-blue dark:text-white mb-6 border-b-2 border-slate-100 dark:border-white/10 pb-4">
                    Danh Sách Học Sinh ({classDetail.students.length})
                </h2>

                {classDetail.students.length === 0 ? (
                    <p className="text-slate-400 italic">Chưa có học sinh nào tham gia.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-cb-blue text-cb-blue dark:text-cb-yellow uppercase text-xs font-black tracking-widest">
                                    <th className="pb-4 pl-4">Họ và Tên</th>
                                    <th className="pb-4">Email</th>
                                    <th className="pb-4">Ngày tham gia</th>
                                    <th className="pb-4 text-right pr-4">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {classDetail.students.map((item) => (
                                    <tr key={item.id} className="border-b border-dashed border-slate-200 dark:border-white/10 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="py-4 pl-4 font-bold text-cb-blue dark:text-white">{item.student.name}</td>
                                        <td className="py-4 text-slate-500 font-mono text-xs">{item.student.email}</td>
                                        <td className="py-4 text-slate-400">{new Date(item.joinedAt).toLocaleDateString('vi-VN')}</td>
                                        <td className="py-4 text-right pr-4">
                                            <button
                                                onClick={() => handleRemoveStudent(item.student.id)}
                                                className="text-red-400 hover:text-red-600 font-bold text-xs uppercase tracking-wider"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
