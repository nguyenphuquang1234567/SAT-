import { Users, FileText, Clock, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function TeacherDashboard() {
    return (
        <>
            <DashboardHeader
                title="Tổng Quan"
                subtitle="Chào mừng trở lại, Giáo viên."
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    title="Tổng Học Sinh"
                    value="48"
                    icon={Users}
                    trend="+12% tuần này"
                    variant="blue"
                />
                <StatCard
                    title="Bài Thi Đang Mở"
                    value="3"
                    icon={FileText}
                    variant="yellow"
                />
                <StatCard
                    title="Bài Cần Chấm"
                    value="15"
                    icon={Clock}
                />
                <StatCard
                    title="Cảnh báo Vi Phạm"
                    value="2"
                    icon={AlertTriangle}
                    variant="white"
                />
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white dark:bg-cb-blue-900 border-4 border-cb-blue dark:border-cb-yellow/20 shadow-academic-bold p-8">
                <h2 className="text-xl font-black italic uppercase text-cb-blue dark:text-white mb-6 flex items-center gap-3">
                    <Clock size={24} className="text-cb-yellow" />
                    Hoạt động gần đây
                </h2>

                <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center gap-4 p-4 border-b border-cb-blue/5 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-cb-yellow" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-cb-blue dark:text-white">Nguyễn Văn A đã nộp bài thi Midterm Math</p>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">2 phút trước</p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-none">
                                Đã nộp
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
