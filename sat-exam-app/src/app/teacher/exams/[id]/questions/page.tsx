'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Save,
    Plus,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import PDFUploadZone, { ParsedQuestion } from '@/components/questions/PDFUploadZone';
import QuestionCard from '@/components/questions/QuestionCard';

interface Exam {
    id: string;
    title: string;
    status: string;
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

export default function QuestionsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: examId } = use(params);
    const router = useRouter();

    const [exam, setExam] = useState<Exam | null>(null);
    const [savedQuestions, setSavedQuestions] = useState<Question[]>([]);
    const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Fetch exam and existing questions
    useEffect(() => {
        async function fetchData() {
            try {
                const [examRes, questionsRes] = await Promise.all([
                    fetch(`/api/exams/${examId}`),
                    fetch(`/api/exams/${examId}/questions`),
                ]);

                if (!examRes.ok) throw new Error('Exam not found');

                const examData = await examRes.json();
                setExam(examData);

                if (questionsRes.ok) {
                    const questionsData = await questionsRes.json();
                    setSavedQuestions(questionsData.questions || []);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [examId]);

    // Handle parsed questions from PDF
    const handleParseComplete = useCallback((questions: ParsedQuestion[]) => {
        setParsedQuestions(questions);
        setSuccessMessage(`AI đã trích xuất ${questions.length} câu hỏi từ PDF`);
        setTimeout(() => setSuccessMessage(null), 5000);
    }, []);

    // Save parsed questions to database
    const handleSaveAll = async () => {
        if (parsedQuestions.length === 0) return;

        setSaving(true);
        setError(null);

        try {
            const response = await fetch(`/api/exams/${examId}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questions: parsedQuestions }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to save');
            }

            // Refresh saved questions
            const questionsRes = await fetch(`/api/exams/${examId}/questions`);
            const questionsData = await questionsRes.json();
            setSavedQuestions(questionsData.questions || []);

            // Clear parsed questions
            setParsedQuestions([]);
            setSuccessMessage('Đã lưu tất cả câu hỏi thành công!');
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    // Edit a parsed question (before saving)
    const handleEditParsed = (index: number, updated: ParsedQuestion) => {
        setParsedQuestions((prev) =>
            prev.map((q, i) => (i === index ? updated : q))
        );
    };

    // Delete a parsed question (before saving)
    const handleDeleteParsed = (index: number) => {
        setParsedQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    // Edit a saved question
    const handleEditSaved = async (questionId: string, updated: Partial<Question>) => {
        try {
            const response = await fetch(
                `/api/exams/${examId}/questions/${questionId}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updated),
                }
            );

            if (!response.ok) throw new Error('Failed to update');

            setSavedQuestions((prev) =>
                prev.map((q) => (q.id === questionId ? { ...q, ...updated } : q))
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update');
        }
    };

    // Delete a saved question
    const handleDeleteSaved = async (questionId: string) => {
        if (!confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;

        try {
            const response = await fetch(
                `/api/exams/${examId}/questions/${questionId}`,
                { method: 'DELETE' }
            );

            if (!response.ok) throw new Error('Failed to delete');

            setSavedQuestions((prev) => prev.filter((q) => q.id !== questionId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    // Drag and drop for reordering
    const [dragIndex, setDragIndex] = useState<number | null>(null);

    const handleDragStart = (index: number) => (e: React.DragEvent) => {
        setDragIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (index: number) => (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (dropIndex: number) => async (e: React.DragEvent) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === dropIndex) return;

        const newQuestions = [...savedQuestions];
        const [removed] = newQuestions.splice(dragIndex, 1);
        newQuestions.splice(dropIndex, 0, removed);

        setSavedQuestions(newQuestions);
        setDragIndex(null);

        // Save new order to backend
        try {
            await fetch(`/api/exams/${examId}/questions/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionIds: newQuestions.map((q) => q.id),
                }),
            });
        } catch (err) {
            console.error('Failed to save order:', err);
        }
    };

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

    const totalQuestions = (savedQuestions?.length || 0) + (parsedQuestions?.length || 0);
    const isDraft = exam.status === 'DRAFT';

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(`/teacher/exams/${examId}`)}
                        className="p-2 hover:bg-[#003366]/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#003366]" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-[#003366]">{exam.title}</h1>
                        <p className="text-sm text-[#003366]/60">
                            {exam.class.name} • {totalQuestions} câu hỏi
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push(`/teacher/exams/${examId}/questions/new`)}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-[#003366] text-[#003366]
                       hover:bg-[#003366] hover:text-white transition-colors font-semibold"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm Câu Hỏi
                    </button>

                    <button
                        onClick={() => router.push(`/teacher/exams/${examId}/preview`)}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-[#003366]/30 text-[#003366]/60
                       hover:border-[#003366] hover:text-[#003366] transition-colors font-semibold"
                    >
                        <FileText className="w-4 h-4" />
                        Xem Trước
                    </button>
                </div>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 text-green-700">
                    <CheckCircle2 className="w-5 h-5" />
                    {successMessage}
                </div>
            )}

            {/* PDF Upload Section - Only show for DRAFT exams */}
            {isDraft && (
                <section>
                    <h2 className="text-lg font-bold text-[#003366] mb-4">
                        Upload Đề Thi PDF
                    </h2>
                    <PDFUploadZone
                        examId={examId}
                        onParseComplete={handleParseComplete}
                        onError={(err) => setError(err)}
                    />
                </section>
            )}

            {/* Parsed Questions (Pending Save) */}
            {parsedQuestions.length > 0 && (
                <section className="border-4 border-[#FFCC00] p-6 bg-[#FFCC00]/5">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#FFCC00] flex items-center justify-center">
                                <FileText className="w-5 h-5 text-[#003366]" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-[#003366]">
                                    Câu Hỏi Từ PDF ({parsedQuestions.length})
                                </h2>
                                <p className="text-sm text-[#003366]/60">
                                    Review và chỉnh sửa trước khi lưu
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveAll}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-[#003366] text-white
                         hover:bg-[#002244] transition-colors font-bold disabled:opacity-50"
                        >
                            {saving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            Lưu Tất Cả
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {parsedQuestions.map((question, index) => (
                            <QuestionCard
                                key={index}
                                question={question}
                                index={index}
                                onEdit={(updated) => handleEditParsed(index, updated as ParsedQuestion)}
                                onDelete={() => handleDeleteParsed(index)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Saved Questions */}
            {savedQuestions.length > 0 && (
                <section>
                    <h2 className="text-lg font-bold text-[#003366] mb-4">
                        Câu Hỏi Đã Lưu ({savedQuestions.length})
                    </h2>
                    <div className="grid gap-4">
                        {savedQuestions.map((question, index) => (
                            <QuestionCard
                                key={question.id}
                                question={question}
                                index={index}
                                draggable={isDraft}
                                onEdit={(updated) => handleEditSaved(question.id, updated)}
                                onDelete={() => handleDeleteSaved(question.id)}
                                onDragStart={handleDragStart(index)}
                                onDragOver={handleDragOver(index)}
                                onDrop={handleDrop(index)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Empty State */}
            {savedQuestions.length === 0 && parsedQuestions.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed border-[#003366]/20">
                    <FileText className="w-16 h-16 mx-auto text-[#003366]/30 mb-4" />
                    <h3 className="text-lg font-bold text-[#003366] mb-2">
                        Chưa có câu hỏi nào
                    </h3>
                    <p className="text-[#003366]/60 mb-6">
                        Upload file PDF để AI tự động trích xuất câu hỏi,
                        <br />
                        hoặc thêm câu hỏi thủ công
                    </p>
                </div>
            )}
        </div>
    );
}
