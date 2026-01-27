
import React from 'react';
import Link from 'next/link';
import { Home, BookOpen, Clock, User, LogOut } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SignOutButton from '@/components/auth/SignOutButton';

export default async function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    if (session.user.role !== 'STUDENT') {
        redirect('/teacher/dashboard'); // Redirect teachers back to their area
    }

    const navItems = [
        { href: '/student/dashboard', label: 'TỔNG QUAN', icon: Home },
        { href: '/student/classes', label: 'LỚP HỌC', icon: BookOpen },
        { href: '/student/history', label: 'LỊCH SỬ', icon: Clock },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 selection:bg-cb-yellow selection:text-cb-blue">
            {/* Sidebar */}
            <aside className="w-64 bg-cb-blue text-white fixed h-full shadow-2xl z-50 hidden md:block">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cb-yellow to-orange-400 rounded-lg shadow-lg flex items-center justify-center text-cb-blue font-black text-xl">
                            S
                        </div>
                        <div>
                            <h1 className="font-black text-xl tracking-tighter">STUDENT</h1>
                            <p className="text-xs text-white/60 font-medium tracking-widest uppercase">Portal</p>
                        </div>
                    </div>
                </div>

                <nav className="p-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all hover:bg-white/10 hover:shadow-inner hover:translate-x-1 group"
                        >
                            <item.icon size={20} className="text-white/70 group-hover:text-cb-yellow transition-colors" />
                            <span className="tracking-wide">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 w-full p-6 border-t border-white/10 bg-cb-blue/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                            <User size={20} className="text-cb-yellow" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-sm truncate">{session.user.name}</p>
                            <p className="text-xs text-white/50 truncate uppercase tracking-wider">Học sinh</p>
                        </div>
                    </div>

                    <SignOutButton className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-red-500/20 hover:border-red-500/50" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 animate-in fade-in duration-500">
                {children}
            </main>
        </div>
    );
}
