'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, Clock, ShieldAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface StudentAnswerDetail {
    questionId: string;
    questionContent: string;
    questionOrder: number;
    options: {
        A: string;
        B: string;
        C: string;
        D: string;
    };
    selectedAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean | null;
    points: number;
}

interface StudentExamDetail {
    id: string;
    score: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    violationCount: number;
    student: {
        name: string;
        email: string;
    };
    answers: StudentAnswerDetail[];
}

export default function StudentResultDetail() {
    const params = useParams();
    const router = useRouter();
    const { id: examId, studentId } = params as { id: string; studentId: string };

    const [detail, setDetail] = useState<StudentExamDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await fetch(`/api/exams/${examId}/results/${studentId}`);
                if (!res.ok) throw new Error('Failed to load detail');
                const data = await res.json();
                setDetail(data.studentExam);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [examId, studentId]);

    const formatLatex = (text: string) => {
        return text.replace(/\$\$/g, '$').replace(/\\\[/g, '$').replace(/\\\]/g, '$');
    };

    if (loading) return (
        <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]"></div>
        </div>
    );

    if (!detail) return <div className="p-8 text-center">Không tìm thấy dữ liệu bài làm.</div>;

    const correctCount = detail.answers.filter(a => a.isCorrect).length;
    const totalQuestions = detail.answers.length;
    const durationMin = Math.round((new Date(detail.updatedAt).getTime() - new Date(detail.createdAt).getTime()) / 60000);

    return (
        <div className="min-h-screen bg-[#F5F7FA] pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 shadow-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-[#003366]">{detail.student.name}</h1>
                            <p className="text-sm text-gray-500">{detail.student.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                            <p className="text-gray-500">Điểm số</p>
                            <p className="font-bold text-xl text-[#003366]">{detail.score}</p>
                        </div>
                        <div className="text-right border-l pl-6">
                            <p className="text-gray-500">Câu đúng</p>
                            <p className="font-bold text-lg text-green-600">{correctCount}/{totalQuestions}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Meta Cards */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">Thời gian làm bài</p>
                            <p className="font-bold text-gray-800">{durationMin} phút</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${detail.violationCount > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">Vi phạm</p>
                            <p className={`font-bold ${detail.violationCount > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                                {detail.violationCount} lần cảnh báo
                            </p>
                        </div>
                    </div>
                </div>

                {/* Question Review List */}
                <div className="space-y-6">
                    {detail.answers.map((ans, idx) => (
                        <div key={idx} className={`bg-white rounded-xl border p-6 
                            ${ans.isCorrect ? 'border-green-200 shadow-sm' : 'border-red-200 shadow-sm'}`}>

                            <div className="flex justify-between items-start mb-4">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 font-bold text-gray-600 text-sm">
                                    {ans.questionOrder}
                                </span>
                                {ans.isCorrect ? (
                                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded">
                                        <CheckCircle className="w-4 h-4" /> Chính xác
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-red-600 text-sm font-medium bg-red-50 px-2 py-1 rounded">
                                        <XCircle className="w-4 h-4" /> {ans.selectedAnswer ? 'Sai' : 'Sai (Chưa làm)'}
                                    </span>
                                )}
                            </div>

                            {/* Question Content */}
                            <div className="prose prose-sm max-w-none text-gray-800 mb-6">
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {formatLatex(ans.questionContent)}
                                </ReactMarkdown>
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                                    const isSelected = ans.selectedAnswer === opt;
                                    const isCorrect = ans.correctAnswer === opt;

                                    let styleClass = "border-gray-200 hover:bg-gray-50";
                                    if (isCorrect) styleClass = "border-green-500 bg-green-50 ring-1 ring-green-500";
                                    else if (isSelected && !isCorrect) styleClass = "border-red-500 bg-red-50 ring-1 ring-red-500";

                                    return (
                                        <div
                                            key={opt}
                                            className={`relative p-4 rounded-lg border transition-all ${styleClass}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0
                                                    ${isCorrect ? 'bg-green-500 text-white' :
                                                        isSelected ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                    {opt}
                                                </span>
                                                <div className="text-sm pt-0.5">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkMath]}
                                                        rehypePlugins={[rehypeKatex]}
                                                    >
                                                        {formatLatex(ans.options[opt])}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
