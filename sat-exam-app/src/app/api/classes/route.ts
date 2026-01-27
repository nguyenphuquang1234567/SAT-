import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Helper to generate a random 6-character code
function generateClassCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        console.log("[API_CLASSES_POST] Session:", JSON.stringify(session, null, 2));

        if (!session || session.user.role !== "TEACHER") {
            console.log("[API_CLASSES_POST] Unauthorized access attempt:", session?.user?.email);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        // Generate unique code
        let code = generateClassCode();
        let isUnique = false;
        let attempts = 0;

        // Retry loop to ensure uniqueness
        while (!isUnique && attempts < 10) {
            const existing = await prisma.class.findUnique({ where: { code } });
            if (!existing) {
                isUnique = true;
            } else {
                code = generateClassCode();
                attempts++;
            }
        }

        if (!isUnique) {
            return NextResponse.json({ error: "Failed to generate unique class code" }, { status: 500 });
        }

        const newClass = await prisma.class.create({
            data: {
                name,
                description,
                code,
                teacherId: session.user.id,
            },
        });

        return NextResponse.json(newClass);
    } catch (error) {
        console.error("[CLASSES_POST]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "TEACHER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const classes = await prisma.class.findMany({
            where: {
                teacherId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                _count: {
                    select: { students: true }
                }
            }
        });

        return NextResponse.json(classes);
    } catch (error) {
        console.error("[CLASSES_GET]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
