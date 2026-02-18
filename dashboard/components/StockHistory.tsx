'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { History, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Movement {
    id: string
    type: string
    quantity: number
    previous_stock: number
    new_stock: number
    notes: string
    created_at: string
    items?: {
        code: string
        data: { piedra: string }
    }
}

const typeConfig = {
    sale: {
        icon: TrendingDown,
        color: 'text-red-400',
        bg: 'bg-red-500/10 border-red-500/20',
        label: 'Venta',
        badge: 'bg-red-500/15 text-red-400 border border-red-500/20',
    },
    restock: {
        icon: TrendingUp,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/20',
        label: 'Reposición',
        badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    },
    adjustment: {
        icon: RefreshCw,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10 border-blue-500/20',
        label: 'Ajuste',
        badge: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    },
}

export function StockHistory() {
    const [movements, setMovements] = useState<Movement[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadMovements()
    }, [])

    async function loadMovements() {
        setLoading(true)
        const supabase = createClient()
        const { data } = await supabase
            .from('movements')
            .select('*, items:item_id(code, data)')
            .order('created_at', { ascending: false })
            .limit(20)

        if (data) setMovements(data)
        setLoading(false)
    }

    return (
        <div className="glass-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                        <History className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">Historial de Movimientos</h2>
                        <p className="text-xs text-slate-500">Últimos cambios de stock</p>
                    </div>
                </div>
                <button
                    onClick={loadMovements}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[480px]">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="skeleton h-16 w-full" />
                    ))
                ) : movements.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                        <p className="text-sm text-slate-500">Sin movimientos registrados</p>
                    </div>
                ) : (
                    movements.map((m) => {
                        const config = typeConfig[m.type as keyof typeof typeConfig] || typeConfig.adjustment
                        const Icon = config.icon
                        const isPositive = m.quantity > 0

                        return (
                            <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors">
                                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                                    <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-xs font-mono font-semibold text-slate-300">
                                            {m.items?.code || '—'}
                                        </span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${config.badge}`}>
                                            {config.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">
                                        {m.items?.data?.piedra || 'Producto'}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {isPositive ? '+' : ''}{m.quantity}
                                    </p>
                                    <p className="text-[10px] text-slate-600">
                                        {m.previous_stock} → {m.new_stock}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
