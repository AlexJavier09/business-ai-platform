'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import {
    History, TrendingUp, TrendingDown, RefreshCw,
    ChevronDown, ChevronUp, ShoppingCart, User, Hash,
    Clock, DollarSign, FileText, Package
} from 'lucide-react'

interface Order {
    id: string
    order_number: string
    status: string
    total_amount: number
    customer_data: {
        nombre?: string
        whatsapp?: string
        canal?: string
    }
}

interface Movement {
    id: string
    type: string
    quantity: number
    previous_stock: number
    new_stock: number
    notes: string
    created_at: string
    order_id?: string
    items?: {
        code: string
        data: { piedra: string; formato?: string; cuerda?: string }
    }
    orders?: Order | null
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

function formatDateTime(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    // Relative time for recent
    if (diffMins < 1) return { relative: 'Ahora mismo', full: formatFull(date) }
    if (diffMins < 60) return { relative: `Hace ${diffMins}m`, full: formatFull(date) }
    if (diffHours < 24) return { relative: `Hace ${diffHours}h`, full: formatFull(date) }
    if (diffDays < 7) return { relative: `Hace ${diffDays}d`, full: formatFull(date) }

    return { relative: formatFull(date), full: formatFull(date) }
}

function formatFull(date: Date) {
    return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function statusLabel(status: string) {
    const map: Record<string, { label: string; color: string }> = {
        pending: { label: 'Pendiente', color: 'text-amber-400' },
        confirmed: { label: 'Confirmado', color: 'text-emerald-400' },
        completed: { label: 'Completado', color: 'text-blue-400' },
        cancelled: { label: 'Cancelado', color: 'text-red-400' },
    }
    return map[status] || { label: status, color: 'text-slate-400' }
}

function MovementCard({ m }: { m: Movement }) {
    const [expanded, setExpanded] = useState(false)
    const config = typeConfig[m.type as keyof typeof typeConfig] || typeConfig.adjustment
    const Icon = config.icon
    // Derive sign from actual stock change, not from type or stored quantity
    const stockDelta = m.new_stock - m.previous_stock
    const displayQty = stockDelta !== 0 ? stockDelta : (m.type === 'sale' ? -Math.abs(m.quantity) : m.quantity)
    const isPositive = displayQty > 0
    const time = formatDateTime(m.created_at)
    const hasOrder = !!m.orders
    const hasDetails = hasOrder || !!m.notes

    return (
        <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${expanded ? 'border-white/10 bg-white/[0.04]' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'}`}>
            {/* Main row */}
            <button
                className="w-full flex items-center gap-3 p-3 text-left"
                onClick={() => hasDetails && setExpanded(!expanded)}
                disabled={!hasDetails}
            >
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
                        {hasOrder && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-violet-500/15 text-violet-400 border border-violet-500/20">
                                {m.orders!.order_number}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-500 truncate">
                            {m.items?.data?.piedra || 'Producto'}
                        </p>
                        <span className="text-slate-700">·</span>
                        <span className="text-[10px] text-slate-600 flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-2.5 h-2.5" />
                            {time.relative}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                        <p className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {displayQty > 0 ? '+' : ''}{displayQty}
                        </p>
                        <p className="text-[10px] text-slate-600">
                            {m.previous_stock} → {m.new_stock}
                        </p>
                    </div>
                    {hasDetails && (
                        <div className="w-5 h-5 flex items-center justify-center text-slate-600">
                            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </div>
                    )}
                </div>
            </button>

            {/* Expanded detail panel */}
            {expanded && hasDetails && (
                <div className="px-3 pb-3 border-t border-white/[0.06] pt-3 space-y-3">
                    {/* Timestamp full */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                        <span>{time.full}</span>
                    </div>

                    {/* Product details */}
                    {m.items?.data && (
                        <div className="flex items-start gap-2">
                            <Package className="w-3.5 h-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-slate-400">
                                {m.items.data.piedra}
                                {m.items.data.formato && ` · ${m.items.data.formato}`}
                                {m.items.data.cuerda && ` · ${m.items.data.cuerda}`}
                            </p>
                        </div>
                    )}

                    {/* Order details */}
                    {hasOrder && (
                        <div className="grid grid-cols-2 gap-2">
                            {m.orders!.customer_data?.nombre && (
                                <div className="flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                                    <span className="text-xs text-slate-400 truncate">{m.orders!.customer_data.nombre}</span>
                                </div>
                            )}
                            {m.orders!.customer_data?.whatsapp && (
                                <div className="flex items-center gap-2">
                                    <Hash className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                                    <span className="text-xs text-slate-400">{m.orders!.customer_data.whatsapp}</span>
                                </div>
                            )}
                            {m.orders!.total_amount > 0 && (
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                    <span className="text-xs text-emerald-400 font-semibold">${m.orders!.total_amount} USD</span>
                                </div>
                            )}
                            {m.orders!.status && (
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                                    <span className={`text-xs font-medium ${statusLabel(m.orders!.status).color}`}>
                                        {statusLabel(m.orders!.status).label}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Notes */}
                    {m.notes && (
                        <div className="flex items-start gap-2">
                            <FileText className="w-3.5 h-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-slate-500">{m.notes}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
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
            .select('*, items:item_id(code, data), orders:order_id(id, order_number, status, total_amount, customer_data)')
            .order('created_at', { ascending: false })
            .limit(50)

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
                        <p className="text-xs text-slate-500">Clic para ver detalles del pedido</p>
                    </div>
                </div>
                <button
                    onClick={loadMovements}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[560px]">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="skeleton h-16 w-full" />
                    ))
                ) : movements.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                        <p className="text-sm text-slate-500">Sin movimientos registrados</p>
                    </div>
                ) : (
                    movements.map((m) => <MovementCard key={m.id} m={m} />)
                )}
            </div>
        </div>
    )
}
