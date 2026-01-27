import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "TEACHER") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const classDetail = await prisma.class.findUnique({
            where: {
                id,
                teacherId: session.user.id, // Ensure teacher owns this class
            },
            include: {
                students: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        }
                    }
                },
                exams: true
            },
        });

        if (!classDetail) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(classDetail);
    } catch (error) {
        console.error("[CLASS_ID_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "TEACHER") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const classDetail = await prisma.class.delete({
            where: {
                id,
                teacherId: session.user.id, // Ensure teacher owns this class
            },
        });

        return NextResponse.json(classDetail);
    } catch (error) {
        console.error("[CLASS_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
