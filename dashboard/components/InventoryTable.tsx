'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Package, Search, Edit2, Save, X } from 'lucide-react'

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

        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('active', true)
            .order('code', { ascending: true })

        if (data) {
            setItems(data)
        }
        setLoading(false)
    }

    async function handleSaveStock(itemId: string) {
        setSaving(true)
        const supabase = createClient()

        const item = items.find(i => i.id === itemId)
        if (!item) return

        const previousStock = item.stock

        // 1. Actualizar stock
        const { error } = await supabase
            .from('items')
            .update({ stock: editingStock })
            .eq('id', itemId)

        if (!error) {
            // 2. Registrar movimiento manualmente (sin trigger)
            await supabase.from('movements').insert({
                tenant_id: item.tenant_id,
                item_id: itemId,
                type: editingStock > previousStock ? 'restock' : 'adjustment',
                quantity: editingStock - previousStock,
                previous_stock: previousStock,
                new_stock: editingStock,
                notes: `Ajuste manual de stock: ${previousStock} → ${editingStock}`
            })

            // 3. Actualizar UI
            setItems(items.map(i =>
                i.id === itemId ? { ...i, stock: editingStock } : i
            ))
            setEditingId(null)
        } else {
            alert('Error al actualizar stock: ' + error.message)
        }

        setSaving(false)
    }

    function handleEdit(item: Item) {
        setEditingId(item.id)
        setEditingStock(item.stock)
    }

    function handleCancel() {
        setEditingId(null)
        setEditingStock(0)
    }

    const filteredItems = items.filter(item =>
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.data?.piedra?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Inventario</h2>
                    </div>
                    <span className="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400">
                        {filteredItems.length} productos
                    </span>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Código</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Piedra</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Formato</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                                </tr>
                            ))
                        ) : filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No se encontraron productos
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{item.code}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-900 dark:text-white">{item.data?.piedra}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded dark:bg-indigo-900/30 dark:text-indigo-400">
                                            {item.data?.formato}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === item.id ? (
                                            <input
                                                type="number"
                                                value={editingStock}
                                                onChange={(e) => setEditingStock(parseInt(e.target.value) || 0)}
                                                className="w-20 px-2 py-1 border border-indigo-500 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                autoFocus
                                            />
                                        ) : (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.stock === 0
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                : item.stock < 3
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                }`}>
                                                {item.stock} unidades
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === item.id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleSaveStock(item.id)}
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
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                                                title="Editar stock"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
