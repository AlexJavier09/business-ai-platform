import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
    title: string
    value: number | string
    subtitle?: string
    icon: LucideIcon
    color: 'blue' | 'green' | 'purple' | 'orange'
    loading?: boolean
    alert?: boolean
}

const colorClasses = {
    blue: 'from-blue-600 to-cyan-600',
    green: 'from-green-600 to-emerald-600',
    purple: 'from-purple-600 to-pink-600',
    orange: 'from-orange-600 to-red-600',
}

export function StatsCard({ title, value, subtitle, icon: Icon, color, loading, alert }: StatsCardProps) {
    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700",
            "bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm",
            "p-6 transition-all duration-300 hover:shadow-lg hover:scale-105",
            "animate-fadeIn",
            alert && "ring-2 ring-orange-500 ring-offset-2"
        )}>
            {/* Background Gradient */}
            <div className={cn(
                "absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl rounded-full",
                `bg-gradient-to-br ${colorClasses[color]}`
            )} />

            {/* Icon */}
            <div className="relative flex items-start justify-between mb-4">
                <div className={cn(
                    "p-3 rounded-xl bg-gradient-to-br",
                    colorClasses[color]
                )}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {alert && (
                    <span className="px-2 py-1 text-xs font-semibold text-orange-600 bg-orange-100 rounded-full dark:bg-orange-900/30 dark:text-orange-400">
                        ¡Atención!
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="relative">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
                {loading ? (
                    <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ) : (
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {value}
                        </p>
                        {subtitle && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
