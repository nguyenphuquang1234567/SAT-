
'use client';

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface SignOutButtonProps {
    className?: string;
}

export default function SignOutButton({ className }: SignOutButtonProps) {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={className || "flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"}
        >
            <LogOut size={16} />
            <span>Đăng xuất</span>
        </button>
    );
}
