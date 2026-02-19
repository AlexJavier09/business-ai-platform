'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Package, Search, Edit2, Save, X, CheckCircle } from 'lucide-react'

interface Item {
    id: string
    tenant_id: string
    code: string
    data: {
        piedra: string
        formato: string
        cuerda: string
        precio: number
    }
    stock: number
}

export function InventoryTable() {
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingStock, setEditingStock] = useState<number>(0)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadItems()
    }, [])

    async function loadItems() {
        const supabase = createClient()
        const { data } = await supabase
            .from('items')
            .select('*')
            .eq('active', true)
            .order('code')
        if (data) setItems(data)
        setLoading(false)
    }

    async function handleSaveStock(itemId: string) {
        setSaving(true)
        const supabase = createClient()
        const item = items.find(i => i.id === itemId)
        if (!item) return

        const previousStock = item.stock
        const newStock = editingStock
        const LOW_STOCK_THRESHOLD = 3

        const { error } = await supabase.from('items').update({ stock: newStock }).eq('id', itemId)

        if (!error) {
            // Log the movement
            await supabase.from('movements').insert({
                tenant_id: item.tenant_id,
                item_id: itemId,
                type: newStock > previousStock ? 'restock' : 'adjustment',
                quantity: newStock - previousStock,
                previous_stock: previousStock,
                new_stock: newStock,
                notes: `Ajuste manual de stock: ${previousStock} → ${newStock}`
            })

            // Resolve open stock_low alerts if stock is now healthy
            if (newStock > LOW_STOCK_THRESHOLD) {
                await supabase
                    .from('alerts')
                    .update({ resolved: true, resolved_at: new Date().toISOString() })
                    .eq('item_id', itemId)
                    .eq('type', 'stock_low')
                    .eq('resolved', false)
            }
            // If stock is still low (or zero) and no open alert exists, create one
            else {
                const { count } = await supabase
                    .from('alerts')
                    .select('*', { count: 'exact', head: true })
                    .eq('item_id', itemId)
                    .eq('type', 'stock_low')
                    .eq('resolved', false)

                if (!count || count === 0) {
                    await supabase.from('alerts').insert({
                        tenant_id: item.tenant_id,
                        item_id: itemId,
                        type: 'stock_low',
                        severity: newStock === 0 ? 'critical' : 'warning',
                        message: newStock === 0
                            ? `Sin stock: ${item.code}`
                            : `Stock bajo (${newStock}): ${item.code}`,
                        resolved: false,
                    })
                }
            }

            setItems(items.map(i => i.id === itemId ? { ...i, stock: newStock } : i))
            setEditingId(null)
        } else {
            alert('Error al actualizar stock: ' + error.message)
        }
        setSaving(false)
    }

    const filtered = items.filter(item =>
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.data?.piedra?.toLowerCase().includes(search.toLowerCase())
    )

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { label: 'Sin stock', color: 'text-red-400 bg-red-500/10 border-red-500/20' }
        if (stock <= 3) return { label: 'Stock bajo', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' }
        return { label: 'En stock', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
    }

    return (
        <div className="glass-card overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/[0.06]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                            <Package className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-white">Inventario</h2>
                            <p className="text-xs text-slate-500">{items.length} productos activos</p>
                        </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium">
                        {filtered.length} resultados
                    </span>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar por código o piedra..."
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                        className="input-dark pl-9"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/[0.06]">
                            {['Código', 'Piedra', 'Formato', 'Cuerda', 'Precio', 'Stock', 'Estado', ''].map(h => (
                                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    {Array.from({ length: 8 }).map((_, j) => (
                                        <td key={j} className="px-5 py-4">
                                            <div className="skeleton h-4 w-full" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-5 py-12 text-center text-slate-500 text-sm">
                                    No se encontraron productos
                                </td>
                            </tr>
                        ) : (
                            filtered.map((item) => {
                                const status = getStockStatus(item.stock)
                                const isEditing = editingId === item.id
                                return (
                                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-xs font-bold text-indigo-400">{item.code}</span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-200 font-medium">{item.data?.piedra || '—'}</td>
                                        <td className="px-5 py-4 text-xs text-slate-400">{item.data?.formato || '—'}</td>
                                        <td className="px-5 py-4 text-xs text-slate-400">{item.data?.cuerda || '—'}</td>
                                        <td className="px-5 py-4 text-sm font-semibold text-emerald-400">
                                            ${item.data?.precio?.toLocaleString() || '—'}
                                        </td>
                                        <td className="px-5 py-4">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={editingStock}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingStock(parseInt(e.target.value) || 0)}
                                                    className="w-20 px-2 py-1 text-sm text-center bg-indigo-500/10 border border-indigo-500/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                    min="0"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="text-sm font-bold text-white">{item.stock}</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border font-medium ${status.color}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {isEditing ? (
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => handleSaveStock(item.id)}
                                                        disabled={saving}
                                                        className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
                                                    >
                                                        <Save className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        disabled={saving}
                                                        className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 transition-colors disabled:opacity-50"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => { setEditingId(item.id); setEditingStock(item.stock) }}
                                                    className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/15 hover:border-indigo-500/30 transition-all"
                                                    title="Editar stock"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
