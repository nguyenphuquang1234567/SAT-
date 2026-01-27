'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    Shield,
    Menu,
    X,
    ChevronRight
} from 'lucide-react';

interface SidebarItemProps {
    icon: any;
    label: string;
    href: string;
    active: boolean;
}

function SidebarItem({ icon: Icon, label, href, active }: SidebarItemProps) {
    return (
        <Link
            href={href}
            className={`
        flex items-center gap-3 px-6 py-4 border-l-4 transition-all duration-200 group
        ${active
                    ? 'border-cb-yellow bg-cb-blue-800 text-white'
                    : 'border-transparent text-white/60 hover:bg-cb-blue-800/50 hover:text-white'
                }
      `}
        >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} className={active ? 'text-cb-yellow' : ''} />
            <span className={`text-xs font-bold uppercase tracking-widest ${active ? 'text-white' : ''}`}>
                {label}
            </span>
            {active && <ChevronRight className="ml-auto text-cb-yellow animate-pulse" size={16} />}
        </Link>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: 'Tổng quan', href: '/teacher' },
        { icon: Users, label: 'Lớp học', href: '/teacher/classes' },
        { icon: FileText, label: 'Bài thi', href: '/teacher/exams' },
        { icon: Settings, label: 'Cài đặt', href: '/teacher/settings' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-cb-blue-950 flex font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-cb-blue-950/80 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-cb-blue shadow-2xl transform transition-transform duration-300 lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col border-r-4 border-cb-blue-800
      `}>
                {/* Sidebar Header */}
                <div className="h-24 flex items-center px-8 bg-cb-blue-950 border-b-2 border-cb-blue-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-cb-yellow text-cb-blue flex items-center justify-center font-black rounded-none">
                            <Shield size={18} />
                        </div>
                        <div className="leading-none text-white">
                            <div className="font-black italic text-xl tracking-tighter">TEACHER</div>
                            <div className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60">Control Center</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden ml-auto text-white/60 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-8 flex flex-col gap-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            {...item}
                            active={pathname === item.href}
                        />
                    ))}
                </nav>

                {/* User Profile Footer */}
                <div className="p-6 border-t-2 border-cb-blue-800 bg-cb-blue-900/50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-cb-yellow to-orange-500 border-2 border-white/20 flex items-center justify-center text-cb-blue font-black text-lg">
                            {session?.user?.name?.[0] || 'T'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-bold truncate">{session?.user?.name}</div>
                            <div className="text-white/40 text-[10px] uppercase tracking-wider font-bold truncate">{session?.user?.role}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-white/10 hover:bg-red-500 hover:border-red-500 hover:text-white text-white/60 text-xs font-bold uppercase tracking-widest transition-all"
                    >
                        <LogOut size={14} />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 bg-white dark:bg-cb-blue-900 border-b-2 border-cb-blue/10 flex items-center justify-between px-6 sticky top-0 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-cb-blue dark:text-cb-yellow"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-black italic text-cb-blue dark:text-white text-lg">DASHBOARD</span>
                    <div className="w-6" /> {/* Spacer */}
                </header>

                <div className="p-6 md:p-10 lg:p-12 overflow-y-auto h-[calc(100vh-64px)] lg:h-screen bg-blueprint">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
