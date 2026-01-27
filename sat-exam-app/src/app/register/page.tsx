'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Loader2, GraduationCap, School, Shield, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'STUDENT',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push('/login');
            } else {
                const data = await response.text();
                setError(data || 'Đăng ký thất bại');
            }
        } catch (err) {
            setError('Đã có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background bg-blueprint bg-noise p-6 py-20">
            <div className="w-full max-w-[540px] z-10">
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
                        <h1 className="text-2xl font-black italic uppercase text-cb-blue dark:text-cb-yellow tracking-tight">Tạo Tài Khoản</h1>
                        <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mt-2 italic">Tham gia hệ thống thi trực tuyến SAT</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Role Selection */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                                className={`flex flex-col items-center justify-center p-6 border-2 transition-all group ${formData.role === 'STUDENT'
                                    ? 'bg-cb-blue border-cb-blue text-white shadow-[4px_4px_0px_#fddb00]'
                                    : 'bg-white border-cb-blue/10 text-cb-blue hover:border-cb-blue'
                                    }`}
                            >
                                <GraduationCap className={`mb-3 ${formData.role === 'STUDENT' ? 'text-cb-yellow' : 'text-cb-blue/40'}`} size={28} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Học Sinh</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'TEACHER' })}
                                className={`flex flex-col items-center justify-center p-6 border-2 transition-all group ${formData.role === 'TEACHER'
                                    ? 'bg-cb-blue border-cb-blue text-white shadow-[4px_4px_0px_#fddb00]'
                                    : 'bg-white border-cb-blue/10 text-cb-blue hover:border-cb-blue'
                                    }`}
                            >
                                <School className={`mb-3 ${formData.role === 'TEACHER' ? 'text-cb-yellow' : 'text-cb-blue/40'}`} size={28} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Giáo Viên</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-cb-blue dark:text-cb-yellow">Họ và tên</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cb-blue/30 group-focus-within:text-cb-blue transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-cb-blue-900/10 border-2 border-cb-blue/20 dark:border-cb-yellow/20 text-cb-blue dark:text-white placeholder-slate-400 focus:outline-none focus:border-cb-blue dark:focus:border-cb-yellow transition-all font-medium"
                                    placeholder="Nguyễn Văn A"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-cb-blue dark:text-cb-yellow">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cb-blue/30 group-focus-within:text-cb-blue transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-cb-blue-900/10 border-2 border-cb-blue/20 dark:border-cb-yellow/20 text-cb-blue dark:text-white placeholder-slate-400 focus:outline-none focus:border-cb-blue dark:focus:border-cb-yellow transition-all font-medium"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-cb-blue dark:text-cb-yellow">Mật khẩu</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cb-blue/30 group-focus-within:text-cb-blue transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                            className="w-full btn-cb-primary py-4 flex items-center justify-center gap-3 relative group mt-4"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Đăng Ký Tài Khoản</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t-2 border-cb-blue/10 dark:border-cb-yellow/10 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Đã có tài khoản?{' '} <br />
                            <Link href="/login" className="text-cb-blue dark:text-cb-yellow hover:underline decoration-2 underline-offset-4 decoration-cb-yellow mt-2 inline-block">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Extra Footer Decoration */}
                <div className="mt-8 text-center opacity-30 select-none">
                    <div className="text-[8px] font-black tracking-[0.5em] text-cb-blue uppercase underline decoration-1">SECURE REGISTRATION PROTOCOL V1.4</div>
                </div>
            </div>
        </div>
    );
}
