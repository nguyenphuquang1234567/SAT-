'use client';

import { useEffect, useState } from 'react';
import { Users, FileText, Clock, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

interface Activity {
    id: string;
    studentName: string;
    examTitle: string;
    submittedAt: string;
    status: string;
}

interface DashboardData {
    stats: {
        totalStudents: number;
        activeExams: number;
    };
    recentActivity: Activity[];
}

export default function TeacherDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/teacher/dashboard')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-cb-blue border-t-transparent animate-spin"></div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <>
            <DashboardHeader
                title="Tổng Quan"
                subtitle="Chào mừng trở lại, Giáo viên."
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
                <StatCard
                    title="Tổng Học Sinh"
                    value={data.stats.totalStudents.toString()}
                    icon={Users}
                    variant="blue"
                />
                <StatCard
                    title="Bài Thi Đang Mở"
                    value={data.stats.activeExams.toString()}
                    icon={FileText}
                    variant="yellow"
                />
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white dark:bg-cb-blue-900 border-4 border-cb-blue dark:border-cb-yellow/20 shadow-academic-bold p-8">
                <h2 className="text-xl font-black italic uppercase text-cb-blue dark:text-white mb-6 flex items-center gap-3">
                    <Clock size={24} className="text-cb-yellow" />
                    Hoạt động gần đây
                </h2>

                <div className="space-y-4">
                    {data.recentActivity.length > 0 ? (
                        data.recentActivity.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-4 border-b border-cb-blue/5 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <div className="w-2 h-2 rounded-full bg-cb-yellow" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-cb-blue dark:text-white">
                                        {item.studentName} đã nộp bài thi {item.examTitle}
                                    </p>
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
                                        {new Date(item.submittedAt).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-none">
                                    {item.status === 'GRADED' ? 'Đã chấm' : 'Đã nộp'}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-400 font-medium italic">
                            Chưa có hoạt động nào gần đây.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
