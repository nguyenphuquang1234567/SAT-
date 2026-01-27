import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name, password, role } = body;

        if (!email || !name || !password || !role) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: role.toUpperCase() === 'TEACHER' ? 'TEACHER' : 'STUDENT',
            },
        });

        return NextResponse.json(user);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return new NextResponse('User already exists', { status: 400 });
        }
        return new NextResponse('Internal Error', { status: 500 });
    }
}
