'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    BarChart3,
    ArrowLeft,
    Download,
    Search,
    UserCheck,
    AlertCircle,
    Trophy,
    TrendingDown
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExamStats {
    totalStudents: number;
    completed: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
}

interface StudentResult {
    id: string; // studentExamId
    studentId: string;
    name: string;
    email: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED';
    score: number | null;
    startedAt: string;
    submittedAt: string | null;
    violationCount: number;
}

export default function ExamResultsPage() {
    const params = useParams();
    const router = useRouter();
    const examId = params.id as string;

    const [stats, setStats] = useState<ExamStats | null>(null);
    const [students, setStudents] = useState<StudentResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await fetch(`/api/exams/${examId}/results`);
                if (!res.ok) throw new Error('Failed to fetch results');
                const data = await res.json();
                setStats(data.stats);
                setStudents(data.students);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        if (examId) fetchResults();
    }, [examId]);

    const handleExportExcel = () => {
        if (!stats || students.length === 0) return;

        const wb = XLSX.utils.book_new();

        // Sheet 1: Detailed Results
        const wsData = students.map(s => ({
            'Name': s.name,
            'Email': s.email,
            'Status': s.status,
            'Score': s.score ?? 'N/A',
            'Violations': s.violationCount,
            'Submitted At': s.submittedAt ? new Date(s.submittedAt).toLocaleString() : 'N/A'
        }));

        const ws = XLSX.utils.json_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "Student Results");

        // Sheet 2: Summary Stats
        const statsData = [
            { Metric: 'Total Students', Value: stats.totalStudents },
            { Metric: 'Completed', Value: stats.completed },
            { Metric: 'Average Score', Value: stats.averageScore.toFixed(2) },
            { Metric: 'Highest Score', Value: stats.highestScore },
            { Metric: 'Lowest Score', Value: stats.lowestScore }
        ];

        const wsStats = XLSX.utils.json_to_sheet(statsData);
        XLSX.utils.book_append_sheet(wb, wsStats, "Statistics");

        XLSX.writeFile(wb, `Exam_${examId}_Results.xlsx`);
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F7FA] pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-xl font-bold text-[#003366]">Kết Quả Bài Thi</h1>
                    </div>
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export Excel
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">Điểm Trung Bình</h3>
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-[#003366]">
                            {stats?.averageScore.toFixed(1)}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">Điểm Cao Nhất</h3>
                            <Trophy className="w-5 h-5 text-yellow-600" />
                        </div>
                        <p className="text-2xl font-bold text-[#003366]">
                            {stats?.highestScore}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">Điểm Thấp Nhất</h3>
                            <TrendingDown className="w-5 h-5 text-red-600" />
                        </div>
                        <p className="text-2xl font-bold text-[#003366]">
                            {stats?.lowestScore}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">Đã Hoàn Thành</h3>
                            <UserCheck className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-[#003366]">
                            {stats?.completed} <span className="text-base font-normal text-gray-400">/ {stats?.totalStudents}</span>
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm học sinh..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none"
                    />
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Học Sinh</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Trạng Thái</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Điểm Số</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Vi phạm</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Thời Gian Nộp</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm w-20"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                                        onClick={() => router.push(`/teacher/exams/${examId}/results/${student.studentId}`)}
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-[#003366]">{student.name}</p>
                                                <p className="text-sm text-gray-500">{student.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border
                                                ${student.status === 'SUBMITTED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    student.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        'bg-gray-50 text-gray-600 border-gray-200'
                                                }`}>
                                                {student.status === 'SUBMITTED' ? 'Đã Nộp' :
                                                    student.status === 'IN_PROGRESS' ? 'Đang Làm' : 'Chưa Làm'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold ${student.score !== null ? 'text-[#003366]' : 'text-gray-400'}`}>
                                                {student.score ?? '--'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {student.violationCount > 0 ? (
                                                <span className="flex items-center gap-1 text-red-600 font-medium">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {student.violationCount}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">0</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {student.submittedAt
                                                ? new Date(student.submittedAt).toLocaleString('vi-VN')
                                                : '--'
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-blue-600 text-sm font-medium hover:underline">Chi tiết</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                                        Không tìm thấy học sinh nào
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
