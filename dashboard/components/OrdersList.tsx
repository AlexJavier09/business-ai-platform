'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
    ShoppingBag, User, Phone, Mail, Edit2, Save, X, MessageSquare,
    Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp, Gem, Link2, Layers
} from 'lucide-react'

interface Order {
    id: string
    order_number: string
    status: string
    total_amount: number
    customer_data: { nombre: string; email?: string; celular?: string; whatsapp?: string }
    created_at: string
    notes?: string
    items?: { code: string; data: { piedra: string; formato?: string; cuerda?: string; cantidad_D?: number } }
}

const statusConfig = {
    pending: {
        label: 'Pendiente',
        badge: 'badge-pending',
        dot: 'bg-yellow-400',
        icon: Clock,
        sectionBg: 'bg-yellow-500/5 border-yellow-500/15',
        sectionTitle: 'text-yellow-400',
    },
    completed: {
        label: 'Realizado',
        badge: 'badge-completed',
        dot: 'bg-emerald-400',
        icon: CheckCircle2,
        sectionBg: 'bg-emerald-500/5 border-emerald-500/10',
        sectionTitle: 'text-emerald-400',
    },
    cancelled: {
        label: 'Cancelado',
        badge: 'badge-cancelled',
        dot: 'bg-red-400',
        icon: XCircle,
        sectionBg: 'bg-red-500/5 border-red-500/10',
        sectionTitle: 'text-red-400',
    },
}

const STATUS_ORDER = ['pending', 'completed', 'cancelled'] as const

interface OrdersListProps {
    initialFilter?: string
}

export function OrdersList({ initialFilter }: OrdersListProps) {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState<string>(initialFilter || 'grouped')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingNotes, setEditingNotes] = useState('')
    const [editingStatus, setEditingStatus] = useState('')
    const [saving, setSaving] = useState(false)
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
        completed: true,
        cancelled: true,
    })

    useEffect(() => {
        loadOrders()
    }, [])

    useEffect(() => {
        if (initialFilter) setActiveFilter(initialFilter)
    }, [initialFilter])

    async function loadOrders() {
        const supabase = createClient()
        const { data } = await supabase
            .from('orders')
            .select('*, items:item_id(code, data)')
            .order('created_at', { ascending: false })
        if (data) setOrders(data)
        setLoading(false)
    }

    async function handleSave(orderId: string) {
        setSaving(true)
        const supabase = createClient()
        const { error } = await supabase
            .from('orders')
            .update({ notes: editingNotes, status: editingStatus })
            .eq('id', orderId)
        if (!error) {
            setEditingId(null)
            await loadOrders()
        } else {
            alert('Error: ' + error.message)
        }
        setSaving(false)
    }

    const counts = {
        pending: orders.filter(o => o.status === 'pending').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    }

    const filterTabs = [
        { key: 'grouped', label: 'Agrupado', count: orders.length },
        { key: 'pending', label: 'Pendientes', count: counts.pending },
        { key: 'completed', label: 'Realizados', count: counts.completed },
        { key: 'cancelled', label: 'Cancelados', count: counts.cancelled },
    ]

    const filterTabColors: Record<string, string> = {
        grouped: 'bg-slate-600 text-white',
        pending: 'bg-yellow-600 text-white',
        completed: 'bg-emerald-600 text-white',
        cancelled: 'bg-red-600 text-white',
    }

    const filteredOrders = activeFilter === 'grouped'
        ? orders
        : orders.filter(o => o.status === activeFilter)

    function toggleSection(status: string) {
        setCollapsedSections(prev => ({ ...prev, [status]: !prev[status] }))
    }



    return (
        <div className="glass-card flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/[0.06]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-violet-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-white">Pedidos</h2>
                            <p className="text-xs text-slate-500">{orders.length} en total · {counts.pending} pendientes</p>
                        </div>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                    {filterTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveFilter(tab.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeFilter === tab.key
                                ? filterTabColors[tab.key]
                                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders list */}
            <div className="overflow-y-auto max-h-[560px]">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-4 border-b border-white/[0.04]">
                            <div className="skeleton h-20 w-full" />
                        </div>
                    ))
                ) : filteredOrders.length === 0 ? (
                    <div className="p-10 text-center text-slate-500 text-sm">Sin pedidos</div>
                ) : activeFilter === 'grouped' ? (
                    // ── Grouped view: pending first, then completed, then cancelled ──
                    STATUS_ORDER.map((status) => {
                        const group = orders.filter(o => o.status === status)
                        if (group.length === 0) return null
                        const config = statusConfig[status]
                        const Icon = config.icon
                        const isCollapsed = collapsedSections[status]

                        return (
                            <div key={status}>
                                {/* Section header */}
                                <button
                                    onClick={() => toggleSection(status)}
                                    className={`w-full flex items-center justify-between px-4 py-3 border-b border-white/[0.04] ${config.sectionBg} transition-colors hover:bg-white/[0.04]`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon className={`w-3.5 h-3.5 ${config.sectionTitle}`} />
                                        <span className={`text-xs font-semibold ${config.sectionTitle}`}>{config.label}</span>
                                        <span className="text-xs text-slate-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                                            {group.length}
                                        </span>
                                    </div>
                                    {isCollapsed
                                        ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                                        : <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                                    }
                                </button>

                                {/* Orders in section */}
                                {!isCollapsed && (
                                    <div className="divide-y divide-white/[0.04]">
                                        {group.map(order => <OrderCard key={order.id} order={order} editingId={editingId} editingNotes={editingNotes} editingStatus={editingStatus} saving={saving} onEdit={(o) => { setEditingId(o.id); setEditingNotes(o.notes || ''); setEditingStatus(o.status) }} onSave={handleSave} onCancel={() => setEditingId(null)} onNotesChange={setEditingNotes} onStatusChange={setEditingStatus} />)}
                                    </div>
                                )}
                            </div>
                        )
                    })
                ) : (
                    // ── Filtered flat view ──
                    <div className="divide-y divide-white/[0.04]">
                        {filteredOrders.map(order => <OrderCard key={order.id} order={order} editingId={editingId} editingNotes={editingNotes} editingStatus={editingStatus} saving={saving} onEdit={(o) => { setEditingId(o.id); setEditingNotes(o.notes || ''); setEditingStatus(o.status) }} onSave={handleSave} onCancel={() => setEditingId(null)} onNotesChange={setEditingNotes} onStatusChange={setEditingStatus} />)}
                    </div>
                )}
            </div>
        </div>
    )
}

interface OrderCardProps {
    order: Order
    editingId: string | null
    editingNotes: string
    editingStatus: string
    saving: boolean
    onEdit: (order: Order) => void
    onSave: (id: string) => void
    onCancel: () => void
    onNotesChange: (val: string) => void
    onStatusChange: (val: string) => void
}

function OrderCard({ order, editingId, editingNotes, editingStatus, saving, onEdit, onSave, onCancel, onNotesChange, onStatusChange }: OrderCardProps) {
    const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
    const isEditing = editingId === order.id
    const [expanded, setExpanded] = useState(false)
    const itemData = order.items?.data

    return (
        <div className="border-b border-white/[0.04] last:border-0">
            {/* Main row — click to expand */}
            <div
                className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                onClick={() => !isEditing && setExpanded(e => !e)}
            >
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-400">{order.order_number}</span>
                        {isEditing ? (
                            <select
                                value={editingStatus}
                                onChange={(e) => onStatusChange(e.target.value)}
                                onClick={e => e.stopPropagation()}
                                className="text-xs px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="pending">Pendiente</option>
                                <option value="completed">Realizado</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                        ) : (
                            <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border font-medium ${config.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                                {config.label}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{formatCurrency(order.total_amount)}</span>
                        {isEditing ? (
                            <>
                                <button onClick={(e) => { e.stopPropagation(); onSave(order.id) }} disabled={saving}
                                    className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/25 transition-colors disabled:opacity-50">
                                    <Save className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); onCancel() }} disabled={saving}
                                    className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(order) }}
                                    className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/15 hover:border-indigo-500/30 transition-all"
                                    title="Editar pedido"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-slate-600">
                                    {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-200 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        {order.customer_data?.nombre || 'Sin nombre'}
                    </div>
                    <span className="text-xs text-slate-500">
                        {itemData?.piedra || 'Producto'}
                        {itemData?.formato && ` · ${itemData.formato}`}
                    </span>
                </div>

                <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-600">{formatDate(order.created_at)}</span>
                    <span className="font-mono text-[10px] text-slate-600">{order.items?.code}</span>
                </div>
            </div>

            {/* Expanded detail panel */}
            {expanded && !isEditing && (
                <div className="mx-4 mb-4 rounded-xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
                    {/* Product details */}
                    <div className="p-3 border-b border-white/[0.06]">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Producto</p>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-slate-600">Piedra</span>
                                <div className="flex items-center gap-1">
                                    <Gem className="w-3 h-3 text-violet-400" />
                                    <span className="text-xs text-slate-200 font-medium">{itemData?.piedra || '—'}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-slate-600">Formato</span>
                                <div className="flex items-center gap-1">
                                    <Layers className="w-3 h-3 text-sky-400" />
                                    <span className="text-xs text-slate-200 font-medium">{itemData?.formato || '—'}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-slate-600">Cuerda</span>
                                <div className="flex items-center gap-1">
                                    <Link2 className="w-3 h-3 text-amber-400" />
                                    <span className="text-xs text-slate-200 font-medium">{itemData?.cuerda || '—'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer details */}
                    <div className="p-3 border-b border-white/[0.06]">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Cliente</p>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                <User className="w-3 h-3 text-slate-500" />
                                {order.customer_data?.nombre || '—'}
                            </div>
                            {(order.customer_data?.celular || order.customer_data?.whatsapp) && (
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Phone className="w-3 h-3 text-slate-500" />
                                    {order.customer_data.celular || order.customer_data.whatsapp}
                                </div>
                            )}
                            {order.customer_data?.email && (
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Mail className="w-3 h-3 text-slate-500" />
                                    {order.customer_data.email}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes + Edit button */}
                    <div className="p-3 flex items-start justify-between gap-3">
                        <div className="flex-1">
                            {order.notes ? (
                                <>
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Notas</p>
                                    <p className="text-xs text-slate-400 italic">💬 {order.notes}</p>
                                </>
                            ) : (
                                <p className="text-xs text-slate-600 italic">Sin notas</p>
                            )}
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(order); setExpanded(false) }}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 text-xs font-medium hover:bg-indigo-500/25 transition-colors"
                        >
                            <Edit2 className="w-3 h-3" /> Editar
                        </button>
                    </div>
                </div>
            )}

            {/* Editing: notes textarea shown inline */}
            {isEditing && (
                <div className="px-4 pb-4">
                    <label className="flex items-center gap-1 text-xs text-slate-500 mb-1.5">
                        <MessageSquare className="w-3 h-3" /> Notas
                    </label>
                    <textarea
                        value={editingNotes}
                        onChange={(e) => onNotesChange(e.target.value)}
                        placeholder="Agregar notas..."
                        rows={2}
                        className="input-dark text-xs resize-none"
                    />
                </div>
            )}
        </div>
    )
}
