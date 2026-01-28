import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role !== 'TEACHER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const teacherId = session.user.id;

        // 1. Fetch Classes owned by this teacher
        const teacherClasses = await prisma.class.findMany({
            where: { teacherId },
            select: { id: true }
        });

        const classIds = teacherClasses.map(c => c.id);

        // 2. Count Total Students (unique students in these classes)
        const totalStudentsCount = await prisma.classStudent.count({
            where: {
                classId: { in: classIds }
            }
        });

        // 3. Count Active Exams
        const activeExamsCount = await prisma.exam.count({
            where: {
                classId: { in: classIds },
                status: 'ACTIVE'
            }
        });

        // 4. Fetch Recent Activity (Submissions)
        const recentSubmissions = await prisma.studentExam.findMany({
            where: {
                exam: {
                    classId: { in: classIds }
                },
                status: { in: ['SUBMITTED', 'GRADED'] }
            },
            include: {
                student: {
                    select: { name: true }
                },
                exam: {
                    select: { title: true }
                }
            },
            orderBy: {
                submittedAt: 'desc'
            },
            take: 5
        });

        const activity = recentSubmissions.map(sub => ({
            id: sub.id,
            studentName: sub.student.name,
            examTitle: sub.exam.title,
            submittedAt: sub.submittedAt,
            status: sub.status
        }));

        return NextResponse.json({
            stats: {
                totalStudents: totalStudentsCount,
                activeExams: activeExamsCount
            },
            recentActivity: activity
        });

    } catch (error) {
        console.error('Error fetching teacher dashboard:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
