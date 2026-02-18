'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ShoppingBag, User, Phone, Mail, Filter, Edit2, Save, X, MessageSquare } from 'lucide-react'

interface Order {
    id: string
    order_number: string
    status: string
    total_amount: number
    customer_data: { nombre: string; email?: string; celular?: string }
    created_at: string
    notes?: string
    items?: { code: string; data: { piedra: string } }
}

const statusConfig = {
    pending: { label: 'Pendiente', badge: 'badge-pending', dot: 'bg-yellow-400' },
    completed: { label: 'Realizado', badge: 'badge-completed', dot: 'bg-emerald-400' },
    cancelled: { label: 'Cancelado', badge: 'badge-cancelled', dot: 'bg-red-400' },
}

const filterButtons = [
    { key: 'all', label: 'Todos', active: 'bg-indigo-600 text-white', inactive: 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10' },
    { key: 'pending', label: 'Pendientes', active: 'bg-yellow-600 text-white', inactive: 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10' },
    { key: 'completed', label: 'Realizados', active: 'bg-emerald-600 text-white', inactive: 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10' },
    { key: 'cancelled', label: 'Cancelados', active: 'bg-red-600 text-white', inactive: 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10' },
]

export function OrdersList() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingNotes, setEditingNotes] = useState('')
    const [editingStatus, setEditingStatus] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => { loadOrders() }, [])

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

    const filtered = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter)
    const counts = {
        all: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
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
                            <p className="text-xs text-slate-500">{filtered.length} pedidos</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                    {filterButtons.map(btn => (
                        <button
                            key={btn.key}
                            onClick={() => setStatusFilter(btn.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === btn.key ? btn.active : btn.inactive}`}
                        >
                            {btn.label} ({counts[btn.key as keyof typeof counts]})
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="divide-y divide-white/[0.04] overflow-y-auto max-h-[520px]">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-4"><div className="skeleton h-16 w-full" /></div>
                    ))
                ) : filtered.length === 0 ? (
                    <div className="p-10 text-center text-slate-500 text-sm">Sin pedidos</div>
                ) : (
                    filtered.map((order) => {
                        const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
                        const isEditing = editingId === order.id

                        return (
                            <div key={order.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs font-bold text-indigo-400">{order.order_number}</span>
                                        {isEditing ? (
                                            <select
                                                value={editingStatus}
                                                onChange={(e) => setEditingStatus(e.target.value)}
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
                                                <button onClick={() => handleSave(order.id)} disabled={saving}
                                                    className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/25 transition-colors disabled:opacity-50">
                                                    <Save className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => setEditingId(null)} disabled={saving}
                                                    className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 transition-colors">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => { setEditingId(order.id); setEditingNotes(order.notes || ''); setEditingStatus(order.status) }}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-0.5 mb-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-200 font-medium">
                                        <User className="w-3.5 h-3.5 text-slate-500" />
                                        {order.customer_data?.nombre || 'Sin nombre'}
                                    </div>
                                    {order.customer_data?.celular && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Phone className="w-3 h-3" />{order.customer_data.celular}
                                        </div>
                                    )}
                                    {order.customer_data?.email && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Mail className="w-3 h-3" />{order.customer_data.email}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-xs mb-2">
                                    <span className="text-slate-500">{order.items?.data?.piedra || 'Producto'} · {order.items?.code}</span>
                                    <span className="text-slate-600">{formatDate(order.created_at)}</span>
                                </div>

                                {isEditing ? (
                                    <div className="mt-2">
                                        <label className="flex items-center gap-1 text-xs text-slate-500 mb-1.5">
                                            <MessageSquare className="w-3 h-3" /> Notas
                                        </label>
                                        <textarea
                                            value={editingNotes}
                                            onChange={(e) => setEditingNotes(e.target.value)}
                                            placeholder="Agregar notas..."
                                            rows={2}
                                            className="input-dark text-xs resize-none"
                                        />
                                    </div>
                                ) : order.notes ? (
                                    <div className="mt-2 text-xs text-slate-500 italic bg-white/[0.03] border border-white/[0.06] px-3 py-2 rounded-lg">
                                        💬 {order.notes}
                                    </div>
                                ) : null}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
