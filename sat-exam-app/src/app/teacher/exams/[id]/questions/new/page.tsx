'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';

export default function NewQuestionPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: examId } = use(params);
    const router = useRouter();

    const [formData, setFormData] = useState({
        content: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A' as 'A' | 'B' | 'C' | 'D',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        // Validate
        if (!formData.content.trim()) {
            setError('Vui lòng nhập nội dung câu hỏi');
            setSaving(false);
            return;
        }

        if (
            !formData.optionA.trim() ||
            !formData.optionB.trim() ||
            !formData.optionC.trim() ||
            !formData.optionD.trim()
        ) {
            setError('Vui lòng nhập đầy đủ 4 đáp án');
            setSaving(false);
            return;
        }

        try {
            const response = await fetch(`/api/exams/${examId}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questions: [formData] }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to save');
            }

            router.push(`/teacher/exams/${examId}/questions`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
            setSaving(false);
        }
    };

    const optionLabels = ['A', 'B', 'C', 'D'] as const;
    const optionKeys = ['optionA', 'optionB', 'optionC', 'optionD'] as const;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.push(`/teacher/exams/${examId}/questions`)}
                    className="p-2 hover:bg-[#003366]/10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-[#003366]" />
                </button>
                <h1 className="text-2xl font-bold text-[#003366]">Thêm Câu Hỏi Mới</h1>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border-2 border-red-200 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Question Content */}
                <div>
                    <label className="block text-sm font-bold text-[#003366] mb-2">
                        Nội Dung Câu Hỏi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.content}
                        onChange={(e) =>
                            setFormData({ ...formData, content: e.target.value })
                        }
                        placeholder="Nhập nội dung câu hỏi..."
                        rows={4}
                        className="w-full p-4 border-2 border-[#003366]/20 rounded-none
                       focus:border-[#003366] focus:outline-none resize-y
                       text-[#003366] placeholder:text-[#003366]/40"
                    />
                </div>

                {/* Options */}
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-[#003366]">
                        Đáp Án <span className="text-red-500">*</span>
                    </label>

                    {optionLabels.map((label, i) => {
                        const key = optionKeys[i];
                        const isSelected = formData.correctAnswer === label;

                        return (
                            <div
                                key={label}
                                className={`
                  flex items-center gap-3 p-4 border-2 rounded-none transition-colors
                  ${isSelected ? 'border-green-500 bg-green-50' : 'border-[#003366]/20'}
                `}
                            >
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, correctAnswer: label })}
                                    className={`
                    w-10 h-10 flex items-center justify-center font-bold rounded-none
                    transition-colors
                    ${isSelected
                                            ? 'bg-green-500 text-white'
                                            : 'bg-[#003366]/10 text-[#003366] hover:bg-[#003366]/20'
                                        }
                  `}
                                    title={isSelected ? 'Đáp án đúng' : 'Click để đặt làm đáp án đúng'}
                                >
                                    {label}
                                </button>

                                <input
                                    type="text"
                                    value={formData[key]}
                                    onChange={(e) =>
                                        setFormData({ ...formData, [key]: e.target.value })
                                    }
                                    placeholder={`Nhập đáp án ${label}...`}
                                    className="flex-1 p-3 border-2 border-[#003366]/20 rounded-none
                             focus:border-[#003366] focus:outline-none
                             text-[#003366] placeholder:text-[#003366]/40"
                                />
                            </div>
                        );
                    })}

                    <p className="text-sm text-[#003366]/60">
                        Click vào chữ cái để đặt đáp án đúng. Hiện tại:{' '}
                        <span className="font-bold text-green-600">{formData.correctAnswer}</span>
                    </p>
                </div>

                {/* Submit Button */}
                <div className="flex items-center gap-4 pt-6 border-t-2 border-[#003366]/10">
                    <button
                        type="button"
                        onClick={() => router.push(`/teacher/exams/${examId}/questions`)}
                        className="px-6 py-3 border-2 border-[#003366]/30 text-[#003366]/60
                       hover:border-[#003366] hover:text-[#003366] transition-colors font-semibold"
                    >
                        Hủy
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-[#003366] text-white
                       hover:bg-[#002244] transition-colors font-bold disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Lưu Câu Hỏi
                    </button>
                </div>
            </form>
        </div>
    );
}
