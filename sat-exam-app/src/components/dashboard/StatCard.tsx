import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    variant?: 'blue' | 'yellow' | 'white';
}

export default function StatCard({ title, value, icon: Icon, trend, variant = 'white' }: StatCardProps) {
    const bgColors = {
        blue: 'bg-cb-blue text-white',
        yellow: 'bg-cb-yellow text-cb-blue',
        white: 'bg-white text-cb-blue dark:bg-cb-blue-900 dark:text-white',
    };

    const borderColors = {
        blue: 'border-cb-blue dark:border-white',
        yellow: 'border-cb-blue',
        white: 'border-cb-blue dark:border-cb-yellow',
    };

    return (
        <div className={`
      relative overflow-hidden p-6
      border-4 ${borderColors[variant]}
      ${bgColors[variant]}
      shadow-academic
      group hover:translate-y-[-2px] hover:shadow-academic-bold transition-all duration-300
    `}>
            <div className="flex justify-between items-start">
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">{title}</p>
                    <h3 className="text-4xl font-black italic tracking-tighter">{value}</h3>
                    {trend && (
                        <p className="text-xs font-bold mt-2 opacity-80">{trend}</p>
                    )}
                </div>
                <div className={`p-3 border-2 ${variant === 'blue' ? 'border-white/20' : 'border-cb-blue/10'} rounded-none`}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
            </div>

            {/* Decorative background element */}
            <Icon
                className="absolute -bottom-4 -right-4 opacity-5 transform rotate-[-15deg] group-hover:scale-110 transition-transform duration-500"
                size={120}
            />
        </div>
    );
}
