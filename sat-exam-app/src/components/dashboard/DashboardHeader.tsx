import Link from 'next/link';
import { Plus } from 'lucide-react';

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
    action?: {
        label: string;
        href: string;
    };
}

export default function DashboardHeader({ title, subtitle, action }: DashboardHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b-2 border-cb-blue/10 dark:border-white/10">
            <div>
                <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-cb-blue dark:text-cb-yellow uppercase">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">
                        {subtitle}
                    </p>
                )}
            </div>

            {action && (
                <Link
                    href={action.href}
                    className="btn-cb-accent py-3 px-6 flex items-center gap-2 group"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span>{action.label}</span>
                </Link>
            )}
        </div>
    );
}
