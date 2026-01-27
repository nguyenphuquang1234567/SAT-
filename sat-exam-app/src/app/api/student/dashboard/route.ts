
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const studentId = session.user.id;

        // 1. Fetch Enrolled Classes
        const enrolledClasses = await prisma.classStudent.findMany({
            where: { studentId },
            include: {
                class: {
                    include: {
                        teacher: {
                            select: { name: true, email: true }
                        },
                        _count: {
                            select: { exams: true, students: true }
                        }
                    }
                }
            }
        });

        // Get list of class IDs for filtering exams
        const classIds = enrolledClasses.map(ec => ec.classId);

        // 2. Fetch Active/Published Exams for these classes
        // We only want exams that are PUBLISHED or ACTIVE
        // And we want to know if the student has already submitted them
        const availableExams = await prisma.exam.findMany({
            where: {
                classId: { in: classIds },
                status: { in: ['PUBLISHED', 'ACTIVE'] }
            },
            include: {
                class: { select: { name: true } },
                _count: { select: { questions: true } },
                studentExams: {
                    where: { studentId },
                    select: { status: true, score: true }
                }
            },
            orderBy: { startTime: 'asc' } // Soonest first
        });

        // Filter out exams that are already submitted by this student
        // Or keep them but mark as 'completed' if we want to show everything
        // For "Upcoming/Active", usually we want things TO DO.
        const todoExams = availableExams.filter(exam => {
            const attempt = exam.studentExams[0];
            return !attempt || attempt.status === 'NOT_STARTED' || attempt.status === 'IN_PROGRESS';
        }).map(exam => ({
            id: exam.id,
            title: exam.title,
            className: exam.class.name,
            duration: exam.duration,
            startTime: exam.startTime,
            questionCount: exam._count.questions,
            status: exam.status,
            attemptStatus: exam.studentExams[0]?.status || 'NOT_STARTED'
        }));

        // 3. Fetch Recent Results (History)
        const recentResults = await prisma.studentExam.findMany({
            where: {
                studentId,
                status: { in: ['SUBMITTED', 'GRADED'] }
            },
            include: {
                exam: {
                    select: {
                        title: true,
                        questions: { select: { points: true } } // Fallback to calculate max score
                    }
                }
            },
            orderBy: { submittedAt: 'desc' },
            take: 5
        });

        const history = recentResults.map(result => {
            // Calculate max score if not stored, though we tried to store it
            const calculatedMax = result.maxScore || result.exam.questions.reduce((sum, q) => sum + (q.points || 1), 0);

            return {
                id: result.id,
                examId: result.examId,
                examTitle: result.exam.title,
                score: result.score,
                maxScore: calculatedMax,
                submittedAt: result.submittedAt,
                violationCount: result.violationCount
            };
        });

        return NextResponse.json({
            classes: enrolledClasses.map(ec => ({
                id: ec.class.id,
                name: ec.class.name,
                code: ec.class.code,
                teacher: ec.class.teacher.name || 'Chưa cập nhật',
                description: ec.class.description,
                studentCount: ec.class._count.students,
                examCount: ec.class._count.exams,
                joinedAt: ec.joinedAt
            })),
            upcomingExams: todoExams,
            history: history
        });

    } catch (error) {
        console.error('Error fetching student dashboard:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
