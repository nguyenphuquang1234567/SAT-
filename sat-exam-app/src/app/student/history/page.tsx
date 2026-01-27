
'use client';

import { useEffect, useState } from 'react';
import { Clock, Calendar, AlertCircle, BarChart3, ChevronLeft, Search } from 'lucide-react';
import Link from 'next/link';

interface ExamResult {
    id: string;
    examId: string;
    examTitle: string;
    score: number;
    maxScore: number;
    submittedAt: string;
    violationCount: number;
    status: string;
}

export default function StudentHistoryPage() {
    const [results, setResults] = useState<ExamResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // We reuse the dashboard API for now or we could have a specific history API
        // For simplicity, let's fetch the dashboard data and just use the history part
        fetch('/api/student/dashboard')
            .then(res => res.json())
            .then(data => {
                setResults(data.history || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filteredResults = results.filter(r =>
        r.examTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cb-blue"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-cb-blue uppercase italic tracking-tight">Lịch Sử Làm Bài</h1>
                    <p className="text-gray-500 font-medium">Xem lại kết quả các bài thi bạn đã hoàn thành.</p>
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài thi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border-2 border-gray-100 rounded-xl focus:border-cb-blue outline-none transition-all w-full md:w-64"
                    />
                </div>
            </div>

            {/* Results Table/List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Bài thi</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Ngày nộp</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 text-center">Tỉ lệ</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 text-center">Điểm số</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 text-center">Vi phạm</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredResults.length > 0 ? (
                                filteredResults.map((result) => (
                                    <tr key={result.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-cb-blue">{result.examTitle}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                                <Calendar size={14} />
                                                {new Date(result.submittedAt).toLocaleDateString('vi-VN')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="text-sm font-bold text-gray-700">
                                                {Math.round((result.score / result.maxScore) * 100)}%
                                            </div>
                                            <div className="w-20 h-1.5 bg-gray-100 rounded-full mx-auto mt-1 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${(result.score / result.maxScore) >= 0.8 ? 'bg-green-500' :
                                                            (result.score / result.maxScore) >= 0.5 ? 'bg-yellow-500' :
                                                                'bg-red-500'
                                                        }`}
                                                    style={{ width: `${(result.score / result.maxScore) * 100}%` }}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`px-3 py-1 rounded-lg font-black text-sm ${(result.score / result.maxScore) >= 0.8 ? 'bg-green-100 text-green-700' :
                                                    (result.score / result.maxScore) >= 0.5 ? 'bg-yellow-101 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {result.score}/{result.maxScore}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {result.violationCount > 0 ? (
                                                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs font-black">
                                                    <AlertCircle size={14} />
                                                    {result.violationCount}
                                                </div>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <Link
                                                href={`/student/exams/${result.examId}/result`}
                                                className="inline-flex items-center gap-1 text-xs font-black text-cb-blue hover:underline uppercase tracking-widest"
                                            >
                                                Chi tiết <ChevronLeft className="rotate-180" size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">
                                        {searchQuery ? 'Không tìm thấy kết quả nào khớp với từ khóa.' : 'Bạn chưa tham gia bài thi nào.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
