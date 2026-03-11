'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Bell, AlertTriangle, Package, RefreshCw, CheckCircle2, X } from 'lucide-react'

interface LowStockItem {
    id: string
    code: string
    stock: number
    tenant_id: string
    data: { piedra?: string; formato?: string; cuerda?: string }
}

interface AlertEntry {
    id: string
    item_id: string
    severity: string
    message: string
    created_at: string
    resolved: boolean
}

export function AlertsPanel() {
    const [items, setItems] = useState<LowStockItem[]>([])
    const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)

    useEffect(() => { load() }, [])

    async function load() {
        setLoading(true)
        const supabase = createClient()

        // Read low-stock items directly — instant, no timing issue
        const { data: lowItems } = await supabase
            .from('items')
            .select('id, code, stock, tenant_id, data')
            .eq('active', true)
            .lte('stock', 3)
            .order('stock', { ascending: true })

        if (lowItems) setItems(lowItems)
        setLoading(false)
    }

    async function dismiss(itemId: string) {
        // Mark alert as resolved in the alerts table
        const supabase = createClient()
        await supabase.from('alerts')
            .update({ resolved: true })
            .eq('item_id', itemId)
            .eq('resolved', false)

        setResolvedIds(prev => new Set([...prev, itemId]))
    }

    const visible = items.filter(i => !resolvedIds.has(i.id))

    return (
        <div className="glass-card p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">Alertas Activas</h2>
                        <p className="text-xs text-slate-500">Stock bajo (≤ 3 unidades)</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {visible.length > 0 && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium animate-pulse-glow">
                            {visible.length}
                        </span>
                    )}
                    <button
                        onClick={load}
                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[320px] pr-1">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton h-16 w-full" />
                    ))
                ) : visible.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500/50" />
                        <p className="text-sm text-slate-500">Sin alertas activas</p>
                    </div>
                ) : (
                    visible.map((item) => {
                        const isCritical = item.stock === 0
                        const borderColor = isCritical ? 'border-l-red-500' : 'border-l-orange-500'
                        const bgColor = isCritical ? 'bg-red-500/10' : 'bg-orange-500/10'
                        const textColor = isCritical ? 'text-red-400' : 'text-orange-400'
                        const badgeBg = isCritical
                            ? 'bg-red-500/15 text-red-400 border-red-500/20'
                            : 'bg-orange-500/15 text-orange-400 border-orange-500/20'
                        const label = isCritical ? '🚨 Sin stock' : '⚠️ Stock bajo'

                        return (
                            <div
                                key={item.id}
                                className={`flex items-start gap-3 p-3 rounded-xl ${bgColor} border-l-2 ${borderColor} border border-white/5`}
                            >
                                <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${textColor}`} />

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-xs font-mono font-bold text-slate-300">{item.code}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${badgeBg}`}>
                                            {label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-snug">
                                        {item.data?.piedra || 'Producto'}
                                        {item.data?.formato && ` · ${item.data.formato}`}
                                        {item.data?.cuerda && ` · ${item.data.cuerda}`}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Package className="w-3 h-3 text-slate-600" />
                                        <span className={`text-[11px] font-bold ${isCritical ? 'text-red-400' : 'text-orange-400'}`}>
                                            {item.stock} {item.stock === 1 ? 'unidad' : 'unidades'} restantes
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => dismiss(item.id)}
                                    title="Marcar como visto"
                                    className="w-6 h-6 flex-shrink-0 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
