
'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, Search, Filter, Calendar } from 'lucide-react';
import Link from 'next/link';

interface ClassData {
    id: string;
    name: string;
    teacher: string;
    description: string;
    studentCount: number;
    joinedAt: string;
}

export default function StudentClassesPage() {
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, []);

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

                            <button className="w-full py-3 bg-gray-50 text-cb-blue font-black uppercase tracking-widest text-xs rounded-xl hover:bg-cb-blue hover:text-white transition-all">
                                Xem chi tiết lớp học
                            </button>
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
        </div>
    );
}
