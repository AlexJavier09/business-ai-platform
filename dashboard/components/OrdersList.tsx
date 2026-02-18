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
    customer_data: {
        nombre: string
        email?: string
        celular?: string
    }
    created_at: string
    notes?: string
    items?: {
        code: string
        data: { piedra: string }
    }
}

export function OrdersList() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingNotes, setEditingNotes] = useState<string>('')
    const [editingStatus, setEditingStatus] = useState<string>('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadOrders()
    }, [])

    async function loadOrders() {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('orders')
            .select(`
        *,
        items:item_id (code, data)
      `)
            .order('created_at', { ascending: false })

        if (data) {
            setOrders(data)
        }
        setLoading(false)
    }

    async function handleSave(orderId: string) {
        setSaving(true)
        const supabase = createClient()

        const { error } = await supabase
            .from('orders')
            .update({
                notes: editingNotes,
                status: editingStatus
            })
            .eq('id', orderId)

        if (!error) {
            setOrders(orders.map(order =>
                order.id === orderId
                    ? { ...order, notes: editingNotes, status: editingStatus }
                    : order
            ))
            setEditingId(null)

            // Recargar para actualizar contadores
            await loadOrders()
        } else {
            alert('Error al actualizar: ' + error.message)
        }

        setSaving(false)
    }

    function handleEdit(order: Order) {
        setEditingId(order.id)
        setEditingNotes(order.notes || '')
        setEditingStatus(order.status)
    }

    function handleCancel() {
        setEditingId(null)
        setEditingNotes('')
        setEditingStatus('')
    }

    const statusConfig = {
        pending: {
            label: 'Pendiente',
            color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            dotColor: 'bg-yellow-500'
        },
        completed: {
            label: 'Realizado',
            color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            dotColor: 'bg-green-500'
        },
        cancelled: {
            label: 'Cancelado',
            color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            dotColor: 'bg-red-500'
        },
    }

    const filteredOrders = statusFilter === 'all'
        ? orders
        : orders.filter(order => order.status === statusFilter)

    const statusCounts = {
        all: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    }

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pedidos Recientes</h2>
                    </div>
                    <span className="px-3 py-1 text-sm font-medium text-purple-600 bg-purple-100 rounded-full dark:bg-purple-900/30 dark:text-purple-400">
                        {filteredOrders.length} pedidos
                    </span>
                </div>

                {/* Status Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            }`}
                    >
                        Todos ({statusCounts.all})
                    </button>
                    <button
                        onClick={() => setStatusFilter('pending')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'pending'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            }`}
                    >
                        Pendientes ({statusCounts.pending})
                    </button>
                    <button
                        onClick={() => setStatusFilter('completed')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'completed'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            }`}
                    >
                        Realizados ({statusCounts.completed})
                    </button>
                    <button
                        onClick={() => setStatusFilter('cancelled')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'cancelled'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            }`}
                    >
                        Cancelados ({statusCounts.cancelled})
                    </button>
                </div>
            </div>

            {/* Orders List */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-4">
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                        </div>
                    ))
                ) : filteredOrders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No hay pedidos {statusFilter !== 'all' && statusConfig[statusFilter as keyof typeof statusConfig]?.label.toLowerCase()}
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
                        const isEditing = editingId === order.id

                        return (
                            <div key={order.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                                            {order.order_number}
                                        </span>
                                        {isEditing ? (
                                            <select
                                                value={editingStatus}
                                                onChange={(e) => setEditingStatus(e.target.value)}
                                                className="px-2 py-1 text-xs border border-indigo-500 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            >
                                                <option value="pending">Pendiente</option>
                                                <option value="completed">Realizado</option>
                                                <option value="cancelled">Cancelado</option>
                                            </select>
                                        ) : (
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
                                                {config.label}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(order.total_amount)}
                                        </span>
                                        {isEditing ? (
                                            <>
                                                <button
                                                    onClick={() => handleSave(order.id)}
                                                    disabled={saving}
                                                    className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                                                    title="Guardar"
                                                >
                                                    <Save className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    disabled={saving}
                                                    className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors disabled:opacity-50"
                                                    title="Cancelar"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(order)}
                                                className="p-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1 mb-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                                        <User className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="font-medium">{order.customer_data?.nombre || 'Sin nombre'}</span>
                                    </div>

                                    {order.customer_data?.celular && (
                                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                            <Phone className="w-3 h-3" />
                                            {order.customer_data.celular}
                                        </div>
                                    )}

                                    {order.customer_data?.email && (
                                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                            <Mail className="w-3 h-3" />
                                            {order.customer_data.email}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-xs mb-2">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {order.items?.data?.piedra || 'Producto'} - {order.items?.code}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {formatDate(order.created_at)}
                                    </span>
                                </div>

                                {/* Notes Section */}
                                {isEditing ? (
                                    <div className="mt-2">
                                        <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                                            <MessageSquare className="w-3 h-3" />
                                            Notas:
                                        </label>
                                        <textarea
                                            value={editingNotes}
                                            onChange={(e) => setEditingNotes(e.target.value)}
                                            placeholder="Agregar notas del pedido..."
                                            rows={2}
                                            className="w-full px-2 py-1 text-xs border border-indigo-500 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                                        />
                                    </div>
                                ) : order.notes ? (
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
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
