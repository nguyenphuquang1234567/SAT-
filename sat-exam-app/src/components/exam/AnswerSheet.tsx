
'use client';

import { CheckCircle, Bookmark } from 'lucide-react';

interface Question {
    id: string;
    questionNumber: number;
    content?: string; // Content field with format like '[Reading/Writing M1 Q1]'
    section: string; // Fallback section if content parsing fails
}

interface AnswerSheetProps {
    questions: Question[];
    answers: Record<string, string>; // questionId -> selectedAnswer
    flaggedQuestions?: Record<string, boolean>;
    currentQuestionIndex: number;
    onNavigate: (index: number) => void;
    variant?: 'vertical' | 'horizontal'; // Added variant
}

// Utility to parse section from content string like '[Reading/Writing M1 Q1]'
function parseSectionFromContent(content?: string, fallbackSection?: string): string {
    if (!content) return fallbackSection || 'Unknown';

    // Match pattern like [Reading/Writing M1 Q1] or [Math M1 Q1]
    const match = content.match(/\[([^\]]+?)\s+(M\d+)/);
    if (match && match[1] && match[2]) {
        return `${match[1].trim()} ${match[2]}`;
    }

    return fallbackSection || 'Unknown';
}

export default function AnswerSheet({
    questions,
    answers,
    flaggedQuestions = {},
    currentQuestionIndex,
    onNavigate,
    variant = 'vertical'
}: AnswerSheetProps) {
    const answeredCount = Object.keys(answers).length;
    const progress = Math.round((answeredCount / questions.length) * 100);

    // Grouping logic - parse section from content field (source of truth)
    const questionsBySection = questions.reduce((acc, q) => {
        const trueSection = parseSectionFromContent(q.content, q.section);
        if (!acc[trueSection]) acc[trueSection] = [];
        acc[trueSection].push(q);
        return acc;
    }, {} as Record<string, Question[]>);

    if (variant === 'horizontal') {
        return (
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-4 overflow-x-auto custom-scrollbar no-scrollbar">
                <div className="flex-shrink-0 flex items-center gap-2 border-r border-gray-100 pr-4 mr-2">
                    <span className="text-[10px] font-black uppercase text-gray-400">Tiến độ</span>
                    <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-cb-blue h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto scroll-smooth no-scrollbar py-1 px-1 flex-1 min-w-0 mask-linear-fade">
                    {questions.map((q, index) => {
                        const isAnswered = !!answers[q.id];
                        const isCurrent = currentQuestionIndex === index;
                        const isFlagged = !!flaggedQuestions[q.id];

                        return (
                            <button
                                key={q.id}
                                onClick={() => onNavigate(index)}
                                className={`
                                    relative flex-shrink-0 w-8 h-8 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center
                                    ${isCurrent
                                        ? 'bg-cb-blue text-white ring-2 ring-blue-100 scale-105 shadow-md'
                                        : isAnswered
                                            ? 'bg-blue-50 text-cb-blue border border-blue-200'
                                            : 'bg-gray-50 text-gray-400 border border-gray-200'
                                    }
                                    ${isFlagged && !isCurrent ? 'ring-2 ring-cb-yellow ring-offset-1' : ''}
                                `}
                            >
                                {q.questionNumber}
                                {isAnswered && !isCurrent && (
                                    <div className="absolute top-0 right-0 -mr-0.5 -mt-0.5">
                                        <div className="w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                                    </div>
                                )}
                                {isFlagged && (
                                    <div className="absolute bottom-0 left-0 -ml-0.5 -mb-0.5">
                                        <Bookmark size={10} className="fill-cb-yellow text-cb-yellow" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
            <div className="mb-6">
                <h3 className="font-black text-gray-800 text-lg mb-2">Phiếu trả lời</h3>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span>Đã làm: <b className="text-cb-blue">{answeredCount}/{questions.length}</b></span>
                    <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                        className="bg-cb-blue h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                {Object.entries(questionsBySection).map(([section, sectionQuestions]) => (
                    <div key={section} className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-cb-blue opacity-50 px-1">
                            {section}
                        </h4>
                        <div className="grid grid-cols-5 gap-3">
                            {sectionQuestions.map((q) => {
                                const index = questions.findIndex(quest => quest.id === q.id);
                                const isAnswered = !!answers[q.id];
                                const isFlagged = !!flaggedQuestions[q.id];
                                const isCurrent = currentQuestionIndex === index;

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => onNavigate(index)}
                                        className={`
                                            relative w-10 h-10 rounded-lg font-bold text-xs transition-all flex items-center justify-center
                                            ${isCurrent
                                                ? 'bg-cb-blue text-white ring-4 ring-blue-100 z-10 scale-110'
                                                : isAnswered
                                                    ? 'bg-blue-50 text-cb-blue border border-blue-200'
                                                    : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100'
                                            }
                                            ${isFlagged && !isCurrent ? 'ring-2 ring-cb-yellow ring-offset-1' : ''}
                                        `}
                                    >
                                        {q.questionNumber}
                                        {isAnswered && !isCurrent && (
                                            <div className="absolute -top-1 -right-1">
                                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                                            </div>
                                        )}
                                        {isFlagged && (
                                            <div className="absolute -top-1 -left-1">
                                                <Bookmark size={12} className="fill-cb-yellow text-cb-yellow" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
                        <span>Chưa làm</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
                        <span>Đã làm</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-cb-blue rounded"></div>
                        <span>Đang chọn</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Bookmark size={12} className="fill-cb-yellow text-cb-yellow" />
                        <span>Đánh dấu</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
