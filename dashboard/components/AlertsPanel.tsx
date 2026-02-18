'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { AlertTriangle, Bell } from 'lucide-react'

interface Alert {
    id: string
    type: string
    message: string
    severity: string
    created_at: string
}

export function AlertsPanel() {
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadAlerts()
    }, [])

    async function loadAlerts() {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('alerts')
            .select('*')
            .eq('resolved', false)
            .order('created_at', { ascending: false })
            .limit(10)

        if (data) {
            setAlerts(data)
        }
        setLoading(false)
    }

    const severityConfig = {
        critical: { color: 'red', icon: AlertTriangle },
        warning: { color: 'yellow', icon: Bell },
        info: { color: 'blue', icon: Bell },
    }

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm overflow-hidden h-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Alertas Activas</h2>
                    </div>
                    {alerts.length > 0 && (
                        <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-orange-600 rounded-full">
                            {alerts.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Alerts List */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-4">
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                        </div>
                    ))
                ) : alerts.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-green-100 dark:bg-green-900/30">
                            <AlertTriangle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            ¡Todo bajo control!
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            No hay alertas activas
                        </p>
                    </div>
                ) : (
                    alerts.map((alert) => {
                        const config = severityConfig[alert.severity as keyof typeof severityConfig] || severityConfig.warning
                        const Icon = config.icon

                        return (
                            <div key={alert.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <div className="flex gap-3">
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.color === 'red'
                                            ? 'bg-red-100 dark:bg-red-900/30'
                                            : config.color === 'yellow'
                                                ? 'bg-yellow-100 dark:bg-yellow-900/30'
                                                : 'bg-blue-100 dark:bg-blue-900/30'
                                        }`}>
                                        <Icon className={`w-4 h-4 ${config.color === 'red'
                                                ? 'text-red-600 dark:text-red-400'
                                                : config.color === 'yellow'
                                                    ? 'text-yellow-600 dark:text-yellow-400'
                                                    : 'text-blue-600 dark:text-blue-400'
                                            }`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                            {alert.type === 'stock_low' ? 'Stock Bajo' : alert.type === 'out_of_stock' ? 'Sin Stock' : 'Alerta'}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {alert.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
