'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { LogOut, BookOpen, User as UserIcon, Shield, LayoutDashboard } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield size={20} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SAT Exam
              </span>
            </div>

            <div className="flex items-center gap-4">
              {session ? (
                <div className="flex items-center gap-6">
                  <div className="hidden md:flex items-center gap-2 text-sm text-slate-300">
                    <UserIcon size={16} />
                    <span>{session.user?.name} ({session.user?.role})</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition-all"
                  >
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className="text-sm font-medium hover:text-blue-400 transition-colors">
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-all"
                  >
                    Bắt đầu
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -z-10 animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Hệ Thống Thi <span className="text-blue-500">Bảo Mật</span> <br />
            Cho Kỳ Thi SAT
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Nền tảng thi trực tuyến chuyên nghiệp cho giáo viên quản lý bài thi Midterm và Final với các tính năng chống gian lận tiên tiến.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {session ? (
              <Link
                href={session.user?.role === 'TEACHER' ? '/teacher' : '/student'}
                className="group px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
              >
                <LayoutDashboard size={20} />
                Vào Dashboard {session.user?.role === 'TEACHER' ? 'Giáo Viên' : 'Học Sinh'}
              </Link>
            ) : (
              <Link
                href="/register"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
              >
                Tạo tài khoản ngay
              </Link>
            )}
            <Link
              href="#features"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl text-center">
              <div className="text-4xl font-bold text-blue-500 mb-2">100%</div>
              <div className="text-slate-400 font-medium">Bảo mật & Chống gian lận</div>
            </div>
            <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl text-center">
              <div className="text-4xl font-bold text-purple-500 mb-2">Simple</div>
              <div className="text-slate-400 font-medium">Dễ dàng tạo & chấm bài</div>
            </div>
            <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl text-center">
              <div className="text-4xl font-bold text-emerald-500 mb-2">Real-time</div>
              <div className="text-slate-400 font-medium">Theo dõi bài thi trực tiếp</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
