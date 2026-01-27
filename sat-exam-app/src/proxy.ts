import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    // 1. Nếu đã đăng nhập mà cố vào login/register -> redirect về home
    if (token && (pathname === '/login' || pathname === '/register')) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    // 2. Nếu chưa đăng nhập mà vào các trang yêu cầu auth -> redirect về login
    // Cho phép access vào login, register và api routes
    if (!token &&
        pathname !== '/login' &&
        pathname !== '/register' &&
        !pathname.startsWith('/api/') &&
        pathname !== '/' && // Cho phép xem landing page
        !pathname.startsWith('/_next/') &&
        !pathname.includes('.') // Cho phép access static files
    ) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
