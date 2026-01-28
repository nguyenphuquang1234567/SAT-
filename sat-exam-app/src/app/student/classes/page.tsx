
'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, Search, Filter, Calendar, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ClassData {
    id: string;
    name: string;
    teacher: string;
    description: string;
    studentCount: number;
    joinedAt: string;
}

export default function StudentClassesPage() {
    const router = useRouter();
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchClasses = () => {
        setLoading(true);
        fetch('/api/student/dashboard')
            .then(res => res.json())
            .then(data => {
                setClasses(data.classes || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const handleJoinClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode.trim()) return;

        setIsJoining(true);
        setError(null);

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
            fetchClasses(); // Refresh list
            alert('Tham gia lớp học thành công!');
        } catch (err: any) {
            setError(err.message);
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

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-cb-blue uppercase italic tracking-tight">Lớp học của tôi</h1>
                    <p className="text-gray-500 font-medium">Danh sách các lớp học bạn đang tham gia.</p>
                </div>
                <button
                    onClick={() => setShowJoinModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-cb-blue text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-900/10 hover:bg-blue-700 transition-all"
                >
                    <Plus size={18} />
                    Tham gia bằng mã lớp
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.length > 0 ? (
                    classes.map((cls) => (
                        <div key={cls.id} className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-cb-blue/20 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-cb-blue/5 rounded-xl flex items-center justify-center text-cb-blue group-hover:bg-cb-blue group-hover:text-white transition-colors">
                                    <Users size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                    Active
                                </span>
                            </div>

                            <h3 className="text-xl font-black text-cb-blue mb-2 line-clamp-1">{cls.name}</h3>
                            <p className="text-sm text-gray-400 font-medium italic mb-6">Giáo viên: {cls.teacher}</p>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <BookOpen size={14} className="text-cb-yellow" />
                                    <span>{cls.description || 'Học phần SAT chính thức'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <Calendar size={14} className="text-cb-yellow" />
                                    <span>Tham gia: {new Date(cls.joinedAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>

                            <Link
                                href={`/student/classes/${cls.id}`}
                                className="block w-full text-center py-3 bg-gray-50 text-cb-blue font-black uppercase tracking-widest text-xs rounded-xl hover:bg-cb-blue hover:text-white transition-all"
                            >
                                Xem chi tiết lớp học
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Users size={40} />
                        </div>
                        <h3 className="text-xl font-black text-cb-blue">Chưa có lớp học nào</h3>
                        <p className="text-gray-400 font-medium mt-2">Hãy liên hệ với giáo viên để tham gia lớp học.</p>
                    </div>
                )}
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
                                    {error && <p className="mt-2 text-xs font-bold text-red-500 italic">{error}</p>}
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
