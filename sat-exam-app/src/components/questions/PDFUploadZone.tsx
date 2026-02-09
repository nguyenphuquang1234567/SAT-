import React, { useCallback, useState, useEffect } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { parsePdfOnClient, ParsedQuestion as ClientParsedQuestion } from '@/lib/pdf/client-parser';

interface PDFUploadZoneProps {
    examId: string;
    onParseComplete: (questions: ParsedQuestion[], pdfUrl?: string) => void;
    onError: (error: string) => void;
}

export interface ParsedQuestion {
    content: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
}

export default function PDFUploadZone({
    examId,
    onParseComplete,
    onError,
}: PDFUploadZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [uploadStep, setUploadStep] = useState<string>('');

    const handleUpload = useCallback(
        async (file: File) => {
            if (file.type !== 'application/pdf') {
                onError('Vui lòng chọn file PDF');
                return;
            }

            // Tăng giới hạn lên 50MB vì giờ đã xử lý ở client
            if (file.size > 50 * 1024 * 1024) {
                onError('File không được vượt quá 50MB');
                return;
            }

            setFileName(file.name);
            setIsUploading(true);
            setUploadStep('Đang đọc file PDF...');

            try {
                // Bước 1: Parse PDF ngay tại trình duyệt
                const clientQuestions = await parsePdfOnClient(file);

                // Chuyển đổi sang định dạng server cần
                const allQuestions = clientQuestions.map((q) => ({
                    content: `[${q.section} Q${q.rawNumber}]`,
                    optionA: 'A',
                    optionB: 'B',
                    optionC: 'C',
                    optionD: 'D',
                    correctAnswer: q.correctAnswer,
                    points: 1,
                    order: q.questionNumber,
                    rawNumber: q.rawNumber,
                    section: q.section,
                }));

                setUploadStep('Đang chuẩn bị upload...');

                // Bước 2: Lấy Signed Upload URL từ Server
                const urlResponse = await fetch(`/api/exams/${examId}/upload-url`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: file.name }),
                });

                if (!urlResponse.ok) {
                    throw new Error('Không thể lấy URL upload');
                }

                const { signedUrl, path, token } = await urlResponse.json();

                setUploadStep('Đang tải file lên kho lưu trữ (trực tiếp)...');

                // Bước 3: Upload trực tiếp lên Supabase (Bỏ qua Vercel Server)
                const uploadResponse = await fetch(signedUrl, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': 'application/pdf',
                        'x-upsert': 'false'
                    }
                });

                if (!uploadResponse.ok) {
                    throw new Error('Upload lên Supabase thất bại');
                }

                // Lấy Public URL sau khi upload thành công
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const publicUrl = `${supabaseUrl}/storage/v1/object/public/exam%20pdfs/${path}`;

                setUploadStep('Đang hoàn tất lưu trữ câu hỏi...');

                // Bước 4: Lưu thông tin câu hỏi
                const saveResponse = await fetch(`/api/exams/${examId}/save-questions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        questions: allQuestions,
                        pdfUrl: publicUrl
                    }),
                });

                const saveData = await saveResponse.json();

                if (!saveResponse.ok) {
                    throw new Error(saveData.error || 'Lưu câu hỏi thất bại');
                }

                onParseComplete(saveData.questions, saveData.pdfUrl);

            } catch (error) {
                console.error('Upload error:', error);
                onError(error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
            } finally {
                setIsUploading(false);
                setUploadStep('');
            }
        },
        [examId, onParseComplete, onError]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);

            const file = e.dataTransfer.files[0];
            if (file) {
                handleUpload(file);
            }
        },
        [handleUpload]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                handleUpload(file);
            }
        },
        [handleUpload]
    );

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
        relative border-3 border-dashed rounded-none p-12 text-center
        transition-all duration-300 cursor-pointer
        ${isDragOver
                    ? 'border-[#FFCC00] bg-[#FFCC00]/10'
                    : 'border-[#003366]/30 bg-[#003366]/5 hover:border-[#003366] hover:bg-[#003366]/10'
                }
        ${isUploading ? 'pointer-events-none opacity-70' : ''}
      `}
        >
            <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
            />

            {isUploading ? (
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-16 h-16 text-[#003366] animate-spin" />
                    <div>
                        <p className="text-xl font-bold text-[#003366]">
                            {uploadStep}
                        </p>
                        <p className="text-sm text-[#003366]/60 mt-2">
                            {fileName}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-none bg-[#003366] flex items-center justify-center">
                        {isDragOver ? (
                            <FileText className="w-10 h-10 text-[#FFCC00]" />
                        ) : (
                            <Upload className="w-10 h-10 text-white" />
                        )}
                    </div>
                    <div>
                        <p className="text-xl font-bold text-[#003366]">
                            {isDragOver ? 'Thả file tại đây' : 'Upload PDF Đề Thi'}
                        </p>
                        <p className="text-sm text-[#003366]/60 mt-2">
                            Kéo thả hoặc click để chọn file PDF (tối đa 50MB)
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#003366]/50 mt-4">
                        <span className="px-2 py-1 bg-[#003366]/10 rounded-none font-mono">
                            CLIENT-SIDE AI
                        </span>
                        <span>Trình duyệt tự xử lý để vượt giới hạn Server</span>
                    </div>
                </div>
            )}
        </div>
    );
}
