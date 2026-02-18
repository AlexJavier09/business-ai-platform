'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Bell, AlertTriangle, Info, CheckCircle2 } from 'lucide-react'

interface Alert {
    id: string
    type: string
    severity: string
    message: string
    created_at: string
    resolved: boolean
}

const severityConfig = {
    critical: {
        icon: AlertTriangle,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-l-red-500',
        badge: 'bg-red-500/15 text-red-400 border-red-500/20',
        label: 'Crítico',
    },
    warning: {
        icon: AlertTriangle,
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-l-orange-500',
        badge: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
        label: 'Advertencia',
    },
    info: {
        icon: Info,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-l-blue-500',
        badge: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
        label: 'Info',
    },
}

export function AlertsPanel() {
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadAlerts()
    }, [])

    async function loadAlerts() {
        const supabase = createClient()
        const { data } = await supabase
            .from('alerts')
            .select('*')
            .eq('resolved', false)
            .order('created_at', { ascending: false })
            .limit(10)

        if (data) setAlerts(data)
        setLoading(false)
    }

    return (
        <div className="glass-card p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">Alertas Activas</h2>
                        <p className="text-xs text-slate-500">Sin resolver</p>
                    </div>
                </div>
                {alerts.length > 0 && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium animate-pulse-glow">
                        {alerts.length}
                    </span>
                )}
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton h-16 w-full" />
                    ))
                ) : alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500/50" />
                        <p className="text-sm text-slate-500">Sin alertas activas</p>
                    </div>
                ) : (
                    alerts.map((alert) => {
                        const config = severityConfig[alert.severity as keyof typeof severityConfig] || severityConfig.info
                        const Icon = config.icon
                        return (
                            <div
                                key={alert.id}
                                className={`flex items-start gap-3 p-3 rounded-xl ${config.bg} border-l-2 ${config.border} border border-white/5`}
                            >
                                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.color}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-300 leading-snug">{alert.message}</p>
                                    <span className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full border font-medium ${config.badge}`}>
                                        {config.label}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
