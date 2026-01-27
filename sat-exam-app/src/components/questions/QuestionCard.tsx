'use client';

import React, { useState } from 'react';
import { Edit3, Trash2, Check, X, GripVertical } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface QuestionCardProps {
    question: {
        id?: string;
        content: string;
        optionA: string;
        optionB: string;
        optionC: string;
        optionD: string;
        correctAnswer: 'A' | 'B' | 'C' | 'D';
        rawNumber?: number;
    };

    index: number;
    isEditing?: boolean;
    onEdit?: (question: QuestionCardProps['question']) => void;
    onDelete?: () => void;
    onDragStart?: (e: React.DragEvent) => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
    draggable?: boolean;
}

export default function QuestionCard({
    question,
    index,
    isEditing: initialEditing = false,
    onEdit,
    onDelete,
    onDragStart,
    onDragOver,
    onDrop,
    draggable = false,
}: QuestionCardProps) {
    const [isEditing, setIsEditing] = useState(initialEditing);
    const [editedQuestion, setEditedQuestion] = useState(question);

    const handleSave = () => {
        onEdit?.(editedQuestion);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedQuestion(question);
        setIsEditing(false);
    };

    const optionLabels = ['A', 'B', 'C', 'D'] as const;
    const optionKeys = ['optionA', 'optionB', 'optionC', 'optionD'] as const;

    return (
        <div
            draggable={draggable && !isEditing}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            className={`
        bg-white border-2 border-[#003366]/20 rounded-none p-6
        transition-all duration-200 hover:border-[#003366]/40
        ${draggable && !isEditing ? 'cursor-move' : ''}
      `}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    {draggable && !isEditing && (
                        <GripVertical className="w-5 h-5 text-[#003366]/40" />
                    )}
                    <span className="w-10 h-10 flex items-center justify-center bg-[#003366] text-white font-bold text-lg">
                        {question.rawNumber ?? index + 1}
                    </span>

                </div>

                {!isEditing && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 text-[#003366]/60 hover:text-[#003366] hover:bg-[#003366]/10 transition-colors"
                            title="Chỉnh sửa"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                        {onDelete && (
                            <button
                                onClick={onDelete}
                                className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Xóa"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}

                {isEditing && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSave}
                            className="p-2 text-green-600 hover:bg-green-50 transition-colors"
                            title="Lưu"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleCancel}
                            className="p-2 text-red-500 hover:bg-red-50 transition-colors"
                            title="Hủy"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Question Content */}
            {isEditing ? (
                <textarea
                    value={editedQuestion.content}
                    onChange={(e) =>
                        setEditedQuestion({ ...editedQuestion, content: e.target.value })
                    }
                    className="w-full min-h-[100px] p-3 border-2 border-[#003366]/20 rounded-none 
                     focus:border-[#003366] focus:outline-none resize-y mb-4
                     font-medium text-[#003366]"
                />
            ) : (
                <div className="text-[#003366] font-medium mb-4">
                    <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                            p: ({ children }) => <p className="mb-2 whitespace-pre-wrap">{children}</p>,
                        }}
                    >
                        {question.content}
                    </ReactMarkdown>
                </div>
            )}

            {/* Options */}
            <div className="grid gap-2">
                {optionLabels.map((label, i) => {
                    const key = optionKeys[i];
                    const isCorrect = question.correctAnswer === label;
                    const editIsCorrect = editedQuestion.correctAnswer === label;

                    return (
                        <div
                            key={label}
                            className={`
                flex items-center gap-3 p-3 border-2 rounded-none transition-colors
                ${isEditing
                                    ? editIsCorrect
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-[#003366]/20'
                                    : isCorrect
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-[#003366]/10 bg-[#003366]/5'
                                }
              `}
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    if (isEditing) {
                                        setEditedQuestion({ ...editedQuestion, correctAnswer: label });
                                    }
                                }}
                                className={`
                  w-8 h-8 flex items-center justify-center font-bold rounded-none
                  transition-colors
                  ${isEditing
                                        ? editIsCorrect
                                            ? 'bg-green-500 text-white'
                                            : 'bg-[#003366]/10 text-[#003366] hover:bg-[#003366]/20 cursor-pointer'
                                        : isCorrect
                                            ? 'bg-green-500 text-white'
                                            : 'bg-[#003366]/10 text-[#003366]'
                                    }
                `}
                                disabled={!isEditing}
                            >
                                {label}
                            </button>

                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedQuestion[key]}
                                    onChange={(e) =>
                                        setEditedQuestion({
                                            ...editedQuestion,
                                            [key]: e.target.value,
                                        })
                                    }
                                    className="flex-1 p-2 border-2 border-[#003366]/20 rounded-none
                             focus:border-[#003366] focus:outline-none bg-white font-medium"
                                />
                            ) : (
                                <div className="flex-1 text-[#003366]/80 font-medium markdown-content">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                    >
                                        {question[key]}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Correct Answer Indicator */}
            {!isEditing && (
                <div className="mt-4 pt-4 border-t border-[#003366]/10">
                    <span className="text-sm text-[#003366]/60">
                        Đáp án đúng:{' '}
                        <span className="font-bold text-green-600">
                            {question.correctAnswer}
                        </span>
                    </span>
                </div>
            )}
        </div>
    );
}
