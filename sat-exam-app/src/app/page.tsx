'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { LogOut, BookOpen, User as UserIcon, Shield, LayoutDashboard, ChevronRight, Activity, Lock, Users } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cb-blue flex items-center justify-center bg-noise">
        <div className="w-12 h-12 border-4 border-cb-yellow border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground bg-blueprint bg-noise selection:bg-cb-yellow selection:text-cb-blue">
      {/* Navigation */}
      <nav className="border-b-2 border-cb-blue bg-white/80 dark:bg-cb-blue-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cb-blue text-cb-yellow flex items-center justify-center border-2 border-cb-blue shadow-[3px_3px_0px_#fddb00]">
              <Shield size={22} fill="currentColor" fillOpacity={0.2} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-black tracking-tighter text-cb-blue dark:text-cb-yellow uppercase italic">SAT EXAM</span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-cb-blue/60 dark:text-cb-yellow/60 uppercase">Classroom Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-6">
              <Link href="#about" className="text-xs font-bold uppercase tracking-widest text-cb-blue hover:text-cb-blue-700 dark:text-cb-yellow/80 transition-colors">Về chúng tôi</Link>
            </div>

            <div className="h-6 w-[1px] bg-cb-blue/20 dark:bg-cb-yellow/20" />

            <div className="flex items-center gap-4">
              {session ? (
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end leading-tight">
                    <span className="text-xs font-black text-cb-blue dark:text-cb-yellow italic uppercase">{session.user?.name}</span>
                    <span className="text-[10px] font-bold text-cb-blue/60 dark:text-cb-yellow/60 uppercase tracking-widest">{session.user?.role}</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="p-2 border-2 border-cb-blue hover:bg-cb-blue hover:text-cb-yellow dark:border-cb-yellow dark:text-cb-yellow dark:hover:bg-cb-yellow dark:hover:text-cb-blue transition-all"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className="btn-cb-primary py-2 px-8 text-xs">
                    Đăng nhập
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 container max-w-[1400px] mx-auto px-6 overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-20">
          <div className="flex-1 z-10">
            <div className="inline-block bg-cb-blue text-cb-yellow px-4 py-1 font-black italic tracking-widest uppercase text-xs mb-8">
              Thi thử 100% • Official Platform
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-[100px] font-black leading-[1.3] md:leading-[1.2] tracking-tighter text-cb-blue dark:text-white uppercase italic">
              HỆ THỐNG THI <br />
              <span className="inline-block text-white bg-cb-blue dark:bg-cb-yellow dark:text-cb-blue px-6 py-2 -ml-4 shadow-[12px_12px_0px_#fddb00] dark:shadow-[12px_12px_0px_white] my-4">THỬ</span> <br />
              CHO KỲ THI SAT.
            </h1>
            <p className="mt-12 text-lg md:text-xl text-cb-blue/80 dark:text-slate-300 max-w-xl font-medium leading-relaxed border-l-4 border-cb-blue dark:border-cb-yellow pl-6">
              Nền tảng thi trực tuyến chuyên nghiệp cho giáo viên quản lý bài thi Midterm và Final với các tính năng chống gian lận tiên tiến.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-6">
              {session ? (
                <Link
                  href={session.user?.role === 'TEACHER' ? '/teacher' : '/student'}
                  className="btn-cb-accent group w-full sm:w-auto inline-flex items-center justify-center gap-3"
                >
                  <LayoutDashboard size={20} />
                  <span>VÀO DASHBOARD {session.user?.role === 'TEACHER' ? 'GIÁO VIÊN' : 'HỌC SINH'}</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="btn-cb-accent group w-full sm:w-auto inline-flex items-center justify-center gap-3"
                >
                  <span>ĐĂNG NHẬP NGAY</span>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <Link
                href="#about"
                className="btn-cb-primary w-full sm:w-auto inline-flex items-center justify-center"
              >
                TÌM HIỂU THÊM
              </Link>
            </div>
          </div>

          {/* Staggered Floating Cards */}
          <div className="flex-1 relative hidden lg:block h-[600px]">
            <div className="absolute top-0 right-0 w-[400px] h-[300px] border-4 border-cb-blue bg-white z-20 shadow-academic-bold p-8 flex flex-col justify-between">
              <Activity className="text-cb-blue" size={32} />
              <div>
                <div className="text-4xl font-black italic text-cb-blue">100%</div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Thi thử & Chống gian lận</div>
              </div>
            </div>

            <div className="absolute top-[100px] right-[100px] w-[400px] h-[300px] border-4 border-cb-blue bg-cb-yellow z-10 shadow-academic-bold p-8 flex flex-col justify-between -rotate-3">
              <Lock className="text-cb-blue" size={32} />
              <div>
                <div className="text-4xl font-black italic text-cb-blue">SIMPLE</div>
                <div className="text-xs font-bold uppercase tracking-widest text-cb-blue/60">Dễ dàng tạo & chấm bài</div>
              </div>
            </div>

            <div className="absolute top-[200px] right-[200px] w-[400px] h-[300px] border-4 border-cb-blue bg-cb-blue text-white z-0 shadow-[12px_12px_0px_#fddb00] p-8 flex flex-col justify-between rotate-3">
              <Users className="text-cb-yellow" size={32} />
              <div>
                <div className="text-4xl font-black italic text-cb-yellow">REAL-TIME</div>
                <div className="text-xs font-bold uppercase tracking-widest text-white/60">Theo dõi bài thi trực tiếp</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-24 bg-white dark:bg-cb-blue-950 border-t-2 border-cb-blue">
        <div className="container max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/3">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-cb-blue dark:text-cb-yellow italic uppercase">
                VỀ CHÚNG TÔI
              </h2>
              <div className="mt-6 h-2 w-24 bg-cb-blue dark:bg-cb-yellow shadow-[4px_4px_0px_#fddb00]"></div>
            </div>
            <div className="lg:w-2/3 space-y-8">
              <p className="text-xl md:text-2xl font-bold leading-relaxed text-cb-blue dark:text-slate-100 italic">
                Atlas Plus Consulting là đơn vị đào tạo SAT được xây dựng bởi những người đã trực tiếp trải qua quá trình luyện thi và ứng tuyển vào các trường đại học Mỹ.
                Chúng mình hiểu rằng SAT không chỉ là một kỳ thi chuẩn hóa, mà là một bước chiến lược trong toàn bộ hồ sơ du học.
              </p>

              <div className="grid md:grid-cols-2 gap-12 text-cb-blue/80 dark:text-slate-400">
                <div className="space-y-4">
                  <p className="leading-relaxed">
                    Tại Atlas, SAT được tiếp cận bằng tư duy hệ thống. Chúng mình không dạy theo kiểu luyện đề đơn thuần, mà tập trung vào nền tảng học thuật, khả năng tư duy phân tích và chiến lược làm bài dưới áp lực thời gian.
                  </p>
                  <p className="leading-relaxed">
                    Mỗi học viên đều có lộ trình cá nhân hóa dựa trên trình độ hiện tại, mục tiêu và kế hoạch dài hạn.
                  </p>
                </div>
                <div className="space-y-4">
                  <p className="leading-relaxed">
                    Đội ngũ giảng viên của Atlas có kinh nghiệm luyện thi thực tế và hiểu rõ cấu trúc đề, cách ra bẫy cũng như phương pháp tối ưu điểm số.
                    Quan trọng hơn, chúng mình đồng hành sát sao để học viên không chỉ cải thiện kết quả, mà còn xây dựng sự tự tin và năng lực học thuật bền vững.
                  </p>
                  <p className="leading-relaxed font-bold text-cb-blue dark:text-cb-yellow italic">
                    Atlas không chỉ giúp bạn tăng điểm. Chúng mình giúp bạn hiểu bản chất bài thi và làm chủ kỳ thi một cách chiến lược.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer Branding */}
      <footer className="border-t-2 border-cb-blue bg-white dark:bg-cb-blue-950 py-12">
        <div className="container max-w-[1400px] mx-auto px-6 flex flex-col items-center gap-6">
          <div className="text-4xl font-black italic tracking-tighter text-cb-blue dark:text-cb-yellow uppercase opacity-20">SAT EXAM PLATFORM</div>
          <p className="text-[10px] font-bold tracking-[0.4em] text-slate-400 uppercase">© 2026 Developed with Excellence</p>
        </div>
      </footer>
    </main>
  );
}
