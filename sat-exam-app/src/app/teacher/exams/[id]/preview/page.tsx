'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Eye, CheckCircle, Loader2 } from 'lucide-react';

interface Exam {
    id: string;
    title: string;
    description: string | null;
    duration: number;
    class: { name: string };
}

interface Question {
    id: string;
    content: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    order: number;
}

export default function ExamPreviewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: examId } = use(params);
    const router = useRouter();

    const [exam, setExam] = useState<Exam | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAnswers, setShowAnswers] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

    useEffect(() => {
        async function fetchData() {
            try {
                const [examRes, questionsRes] = await Promise.all([
                    fetch(`/api/exams/${examId}`),
                    fetch(`/api/exams/${examId}/questions`),
                ]);

                if (examRes.ok) {
                    const examData = await examRes.json();
                    setExam(examData.exam);
                }

                if (questionsRes.ok) {
                    const questionsData = await questionsRes.json();
                    setQuestions(questionsData.questions || []);
                }
            } catch (err) {
                console.error('Failed to load:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [examId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#003366]" />
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Không tìm thấy bài thi</p>
            </div>
        );
    }

    const optionLabels = ['A', 'B', 'C', 'D'] as const;
    const optionKeys = ['optionA', 'optionB', 'optionC', 'optionD'] as const;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(`/teacher/exams/${examId}/questions`)}
                        className="p-2 hover:bg-[#003366]/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#003366]" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-sm text-[#003366]/60 mb-1">
                            <Eye className="w-4 h-4" />
                            XEM TRƯỚC BÀI THI
                        </div>
                        <h1 className="text-2xl font-bold text-[#003366]">{exam.title}</h1>
                    </div>
                </div>

                <button
                    onClick={() => setShowAnswers(!showAnswers)}
                    className={`flex items-center gap-2 px-4 py-2 border-2 transition-colors font-semibold
            ${showAnswers
                            ? 'border-green-500 text-green-600 bg-green-50'
                            : 'border-[#003366]/30 text-[#003366]/60 hover:border-[#003366] hover:text-[#003366]'
                        }`}
                >
                    <CheckCircle className="w-4 h-4" />
                    {showAnswers ? 'Ẩn Đáp Án' : 'Hiện Đáp Án'}
                </button>
            </div>

            {/* Exam Info Card */}
            <div className="bg-[#003366] text-white p-6 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white/60 text-sm mb-1">LỚP</p>
                        <p className="font-bold text-lg">{exam.class.name}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-white/60 text-sm mb-1">THỜI GIAN</p>
                        <div className="flex items-center gap-2 font-bold text-lg">
                            <Clock className="w-5 h-5" />
                            {exam.duration} phút
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-white/60 text-sm mb-1">SỐ CÂU HỎI</p>
                        <p className="font-bold text-lg">{questions.length}</p>
                    </div>
                </div>

                {exam.description && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-white/80">{exam.description}</p>
                    </div>
                )}
            </div>

            {/* Questions */}
            {questions.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-[#003366]/20">
                    <p className="text-[#003366]/60">Chưa có câu hỏi nào</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {questions.map((question, qIndex) => (
                        <div
                            key={question.id}
                            className="bg-white border-2 border-[#003366]/20 p-6"
                        >
                            {/* Question Header */}
                            <div className="flex items-start gap-4 mb-4">
                                <span className="w-10 h-10 flex items-center justify-center bg-[#003366] text-white font-bold shrink-0">
                                    {qIndex + 1}
                                </span>
                                <p className="text-[#003366] font-medium whitespace-pre-wrap">
                                    {question.content}
                                </p>
                            </div>

                            {/* Options */}
                            <div className="grid gap-2 ml-14">
                                {optionLabels.map((label, i) => {
                                    const key = optionKeys[i];
                                    const isCorrect = question.correctAnswer === label;
                                    const isSelected = selectedAnswers[question.id] === label;

                                    return (
                                        <button
                                            key={label}
                                            onClick={() =>
                                                setSelectedAnswers({
                                                    ...selectedAnswers,
                                                    [question.id]: label,
                                                })
                                            }
                                            className={`
                        flex items-center gap-3 p-3 border-2 rounded-none transition-colors text-left
                        ${showAnswers && isCorrect
                                                    ? 'border-green-500 bg-green-50'
                                                    : isSelected
                                                        ? 'border-[#003366] bg-[#003366]/5'
                                                        : 'border-[#003366]/10 hover:border-[#003366]/30'
                                                }
                      `}
                                        >
                                            <span
                                                className={`
                          w-8 h-8 flex items-center justify-center font-bold rounded-none
                          ${showAnswers && isCorrect
                                                        ? 'bg-green-500 text-white'
                                                        : isSelected
                                                            ? 'bg-[#003366] text-white'
                                                            : 'bg-[#003366]/10 text-[#003366]'
                                                    }
                        `}
                                            >
                                                {label}
                                            </span>
                                            <span className="flex-1 text-[#003366]/80">
                                                {question[key]}
                                            </span>
                                            {showAnswers && isCorrect && (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-8 border-t-2 border-[#003366]/10 text-center">
                <p className="text-[#003366]/60 text-sm">
                    Đây là bản xem trước. Học sinh sẽ không thấy đáp án đúng khi làm bài.
                </p>
            </div>
        </div>
    );
}
