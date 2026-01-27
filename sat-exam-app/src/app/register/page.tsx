'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Loader2, GraduationCap, School } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] overflow-hidden relative">
            {/* Background blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse delay-700"></div>

            <div className="w-full max-w-lg p-8 z-10">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Tạo Tài Khoản
                        </h1>
                        <p className="text-slate-400">Tham gia hệ thống thi trực tuyến SAT</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${formData.role === 'STUDENT'
                                        ? 'bg-blue-600/20 border-blue-500 text-white'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                    }`}
                            >
                                <GraduationCap className="mb-2" size={24} />
                                <span className="text-sm font-medium">Học Sinh</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'TEACHER' })}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${formData.role === 'TEACHER'
                                        ? 'bg-purple-600/20 border-purple-500 text-white'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                    }`}
                            >
                                <School className="mb-2" size={24} />
                                <span className="text-sm font-medium">Giáo Viên</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Họ và tên</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    placeholder="Nguyễn Văn A"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Mật khẩu</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm py-2 px-4 rounded-xl">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>Đăng Ký Tài Khoản</>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-sm">
                            Đã có tài khoản?{' '}
                            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
