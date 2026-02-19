'use client'

import { Package, TrendingUp, ShoppingCart, AlertTriangle, LucideIcon } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: number
    subtitle?: string
    icon: LucideIcon
    color: 'indigo' | 'cyan' | 'violet' | 'orange' | 'green'
    loading?: boolean
    alert?: boolean
    onClick?: () => void
}

const colorMap = {
    indigo: {
        iconBg: 'bg-indigo-500/15 border border-indigo-500/20',
        iconColor: 'text-indigo-400',
        glow: 'hover:shadow-glow-indigo',
        value: 'text-indigo-300',
        accent: 'from-indigo-500/20 to-transparent',
        ring: 'hover:border-indigo-500/40',
    },
    cyan: {
        iconBg: 'bg-cyan-500/15 border border-cyan-500/20',
        iconColor: 'text-cyan-400',
        glow: 'hover:shadow-glow-cyan',
        value: 'text-cyan-300',
        accent: 'from-cyan-500/20 to-transparent',
        ring: 'hover:border-cyan-500/40',
    },
    violet: {
        iconBg: 'bg-violet-500/15 border border-violet-500/20',
        iconColor: 'text-violet-400',
        glow: 'hover:shadow-glow-violet',
        value: 'text-violet-300',
        accent: 'from-violet-500/20 to-transparent',
        ring: 'hover:border-violet-500/40',
    },
    orange: {
        iconBg: 'bg-orange-500/15 border border-orange-500/20',
        iconColor: 'text-orange-400',
        glow: 'hover:shadow-glow-orange',
        value: 'text-orange-300',
        accent: 'from-orange-500/20 to-transparent',
        ring: 'hover:border-orange-500/40',
    },
    green: {
        iconBg: 'bg-emerald-500/15 border border-emerald-500/20',
        iconColor: 'text-emerald-400',
        glow: 'hover:shadow-glow-green',
        value: 'text-emerald-300',
        accent: 'from-emerald-500/20 to-transparent',
        ring: 'hover:border-emerald-500/40',
    },
}

export function StatsCard({ title, value, subtitle, icon: Icon, color, loading, alert, onClick }: StatsCardProps) {
    const c = colorMap[color]
    const isClickable = !!onClick

    if (loading) {
        return (
            <div className="glass-card p-5">
                <div className="skeleton h-4 w-24 mb-4" />
                <div className="skeleton h-9 w-16 mb-2" />
                <div className="skeleton h-3 w-20" />
            </div>
        )
    }

    return (
        <div
            onClick={onClick}
            className={`glass-card p-5 transition-all duration-200 ${c.glow} ${c.ring} ${alert ? 'border-orange-500/30' : ''} ${isClickable ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'}`}
        >
            {/* Top row */}
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.iconBg}`}>
                    <Icon className={`w-5 h-5 ${c.iconColor}`} />
                </div>
                <div className="flex items-center gap-2">
                    {alert && (
                        <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse-glow" />
                    )}
                    {isClickable && (
                        <span className="text-[10px] text-slate-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                            Ver →
                        </span>
                    )}
                </div>
            </div>

            {/* Value */}
            <div className="mb-1">
                <span className={`text-3xl font-bold tracking-tight ${c.value}`}>
                    {value.toLocaleString()}
                </span>
                {subtitle && (
                    <span className="text-sm text-slate-500 ml-2">{subtitle}</span>
                )}
            </div>

            {/* Title */}
            <p className="text-sm text-slate-400 font-medium">{title}</p>

            {/* Bottom accent bar */}
            <div className={`mt-4 h-0.5 rounded-full bg-gradient-to-r ${c.accent}`} />
        </div>
    )
}
