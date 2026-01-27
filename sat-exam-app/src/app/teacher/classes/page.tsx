'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Users, Trash2, ArrowRight } from 'lucide-react';

interface Class {
    id: string;
    name: string;
    code: string;
    description: string;
    _count: {
        students: number;
    };
}

export default function ClassesPage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/classes')
            .then((res) => res.json())
            .then((data) => {
                setClasses(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <>
            <DashboardHeader
                title="Quản Lý Lớp Học"
                subtitle="Danh sách các lớp học của bạn"
                action={{ label: "Tạo Lớp Mới", href: "/teacher/classes/new" }}
            />

            {loading ? (
                <div className="text-center py-20 text-slate-400 font-bold">Đang tải dữ liệu...</div>
            ) : classes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-4 border-dashed border-cb-blue/20 dark:border-white/20 rounded-lg">
                    <div className="w-16 h-16 bg-cb-blue/5 dark:bg-white/5 flex items-center justify-center rounded-full mb-4">
                        <Users size={32} className="text-cb-blue/40 dark:text-white/40" />
                    </div>
                    <h3 className="text-lg font-bold text-cb-blue dark:text-white uppercase mb-2">Chưa có lớp học nào</h3>
                    <p className="text-slate-400 text-sm max-w-xs text-center mb-6">Bắt đầu bằng cách tạo lớp học mới để thêm học sinh vào hệ thống.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map((cls) => (
                        <Link key={cls.id} href={`/teacher/classes/${cls.id}`} className="group block">
                            <div className="h-full bg-white dark:bg-cb-blue-900 border-4 border-cb-blue dark:border-cb-yellow/50 shadow-academic hover:shadow-academic-bold hover:-translate-y-1 transition-all p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 bg-cb-yellow text-cb-blue text-[10px] font-black uppercase tracking-widest">
                                    {cls.code}
                                </div>

                                <h3 className="text-xl font-black italic text-cb-blue dark:text-white mb-2 pr-8">{cls.name}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2 min-h-[40px]">{cls.description || 'Không có mô tả'}</p>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2 text-cb-blue dark:text-cb-yellow font-bold text-xs uppercase tracking-wider">
                                        <Users size={16} />
                                        <span>{cls._count.students} Students</span>
                                    </div>
                                    <span className="text-cb-blue dark:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight size={20} />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
}
