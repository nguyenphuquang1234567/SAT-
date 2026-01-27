'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Loader2, ArrowRight, Shield } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Sai email hoặc mật khẩu');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError('Đã có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background bg-blueprint bg-noise p-6">
            <div className="w-full max-w-[480px] z-10">
                {/* Branding above card */}
                <div className="flex items-center justify-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-cb-blue text-cb-yellow flex items-center justify-center border-2 border-cb-blue shadow-[3px_3px_0px_#fddb00]">
                        <Shield size={22} fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <span className="text-3xl font-black tracking-tighter text-cb-blue dark:text-cb-yellow uppercase italic">SAT EXAM</span>
                </div>

                <div className="bg-white dark:bg-cb-blue-950 border-4 border-cb-blue shadow-academic-bold p-10 relative overflow-hidden">
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-cb-yellow" />

                    <div className="mb-10 text-center">
                        <h1 className="text-2xl font-black italic uppercase text-cb-blue dark:text-cb-yellow tracking-tight">Đăng Nhập</h1>
                        <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mt-2 italic">Đăng nhập để bắt đầu phiên thi của bạn</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-cb-blue dark:text-cb-yellow">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cb-blue/30 group-focus-within:text-cb-blue transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-cb-blue-900/10 border-2 border-cb-blue/20 dark:border-cb-yellow/20 text-cb-blue dark:text-white placeholder-slate-400 focus:outline-none focus:border-cb-blue dark:focus:border-cb-yellow transition-all font-medium"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black uppercase tracking-widest text-cb-blue dark:text-cb-yellow">Mật khẩu</label>
                                <Link href="#" className="text-[10px] font-bold text-cb-blue/60 dark:text-cb-yellow/60 hover:underline uppercase tracking-widest">Quên mật khẩu?</Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cb-blue/30 group-focus-within:text-cb-blue transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-cb-blue-900/10 border-2 border-cb-blue/20 dark:border-cb-yellow/20 text-cb-blue dark:text-white placeholder-slate-400 focus:outline-none focus:border-cb-blue dark:focus:border-cb-yellow transition-all font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-600 dark:text-red-400 text-xs font-bold py-3 px-4 uppercase tracking-wider italic">
                                [LỖI]: {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-cb-accent py-4 flex items-center justify-center gap-3 relative group"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Đăng Nhập</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t-2 border-cb-blue/10 dark:border-cb-yellow/10 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Chưa có tài khoản?{' '} <br />
                            <Link href="/register" className="text-cb-blue dark:text-cb-yellow hover:underline decoration-2 underline-offset-4 decoration-cb-yellow mt-2 inline-block">
                                Tạo tài khoản mới
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Extra Footer Decoration */}
                <div className="mt-8 text-center opacity-30 select-none">
                    <div className="text-[8px] font-black tracking-[0.5em] text-cb-blue uppercase underline decoration-1">OFFICIAL EXAM TERMINAL V2.0</div>
                </div>
            </div>
        </div>
    );
}
