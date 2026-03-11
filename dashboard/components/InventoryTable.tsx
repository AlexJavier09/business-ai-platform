'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Package, Search, Edit2, Save, X, ImagePlus, AlertTriangle, ZoomIn, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Item {
    id: string
    tenant_id: string
    code: string
    data: {
        piedra: string
        formato: string
        cuerda: string
        precio: number
        costo_produccion?: number
        image_url?: string
    }
    stock: number
}

export function InventoryTable() {
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingStock, setEditingStock] = useState<number>(0)
    const [editingPrecio, setEditingPrecio] = useState<number>(0)
    const [editingCosto, setEditingCosto] = useState<number>(0)
    const [saving, setSaving] = useState(false)
    const [lowStockOnly, setLowStockOnly] = useState(false)
    const [uploadingId, setUploadingId] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [pendingUploadItem, setPendingUploadItem] = useState<Item | null>(null)
    const [lightboxImg, setLightboxImg] = useState<{ src: string; code: string } | null>(null)

    useEffect(() => { loadItems() }, [])

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

    // ── Image upload ──────────────────────────────────────────
    function startImageUpload(item: Item) {
        setPendingUploadItem(item)
        fileInputRef.current?.click()
    }

    async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file || !pendingUploadItem) return
        const item = pendingUploadItem
        setUploadingId(item.id)

        const supabase = createClient()
        const ext = file.name.split('.').pop()
        const path = `${item.code}.${ext}`

        const { error: upErr } = await supabase.storage
            .from('item-images')
            .upload(path, file, { upsert: true })

        if (!upErr) {
            const { data: urlData } = supabase.storage
                .from('item-images')
                .getPublicUrl(path)
            const image_url = urlData.publicUrl
            await supabase.from('items').update({
                data: { ...item.data, image_url }
            }).eq('id', item.id)
            setItems(prev => prev.map(i =>
                i.id === item.id ? { ...i, data: { ...i.data, image_url } } : i
            ))
        }
        setUploadingId(null)
        setPendingUploadItem(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    // ── Save edits ────────────────────────────────────────────
    async function handleSave(itemId: string) {
        setSaving(true)
        const supabase = createClient()
        const item = items.find(i => i.id === itemId)
        if (!item) return

        const previousStock = item.stock
        const newStock = editingStock
        const LOW = 3

        const newData = { ...item.data, precio: editingPrecio, costo_produccion: editingCosto }
        const { error } = await supabase.from('items').update({
            stock: newStock,
            data: newData,
        }).eq('id', itemId)

        if (!error) {
            // Log movement if stock changed
            if (newStock !== previousStock) {
                await supabase.from('movements').insert({
                    tenant_id: item.tenant_id,
                    item_id: itemId,
                    type: newStock > previousStock ? 'restock' : 'adjustment',
                    quantity: newStock - previousStock,
                    previous_stock: previousStock,
                    new_stock: newStock,
                    notes: `Ajuste manual: ${previousStock} → ${newStock}`,
                })
            }

            // Handle stock alerts
            if (newStock > LOW) {
                await supabase.from('alerts').update({ resolved: true, resolved_at: new Date().toISOString() })
                    .eq('item_id', itemId).eq('type', 'stock_low').eq('resolved', false)
            } else {
                const { count } = await supabase.from('alerts').select('*', { count: 'exact', head: true })
                    .eq('item_id', itemId).eq('type', 'stock_low').eq('resolved', false)
                if (!count || count === 0) {
                    await supabase.from('alerts').insert({
                        tenant_id: item.tenant_id, item_id: itemId, type: 'stock_low',
                        severity: newStock === 0 ? 'critical' : 'warning',
                        message: `Stock bajo (${newStock}): ${item.code}`, resolved: false,
                    })
                }
            }

            setItems(items.map(i => i.id === itemId ? { ...i, stock: newStock, data: newData } : i))
            setEditingId(null)
        }
        setSaving(false)
    }

    function startEdit(item: Item) {
        setEditingId(item.id)
        setEditingStock(item.stock)
        setEditingPrecio(item.data?.precio || 0)
        setEditingCosto(item.data?.costo_produccion || 0)
    }

    const filtered = items.filter(item => {
        const matchSearch = item.code.toLowerCase().includes(search.toLowerCase()) ||
            item.data?.piedra?.toLowerCase().includes(search.toLowerCase())
        const matchLow = !lowStockOnly || item.stock <= 3
        return matchSearch && matchLow
    })

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { label: 'Sin stock', color: 'text-red-400 bg-red-500/10 border-red-500/20' }
        if (stock <= 3) return { label: 'Stock bajo', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' }
        return { label: 'En stock', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
    }

    const getItemImage = (item: Item) => {
        // 1. Supabase Storage uploaded
        if (item.data?.image_url) return item.data.image_url
        // 2. Local public/items extracted from Excel
        return `/items/${item.code}.png`
    }

    return (
        <div className="glass-card overflow-hidden">
            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />

            {/* Lightbox */}
            {lightboxImg && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setLightboxImg(null)}
                >
                    <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
                        <img
                            src={lightboxImg.src}
                            alt={lightboxImg.code}
                            className="w-full rounded-2xl object-contain max-h-[80vh] border border-white/10 shadow-2xl"
                            onError={e => { (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='1.5'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='m21 15-5-5L5 21'/%3E%3C/svg%3E` }}
                        />
                        <div className="flex items-center justify-between mt-3">
                            <span className="font-mono text-sm text-indigo-400 font-bold">{lightboxImg.code}</span>
                            <button
                                onClick={() => setLightboxImg(null)}
                                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all"
                            >
                                <X className="w-3.5 h-3.5" /> Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" placeholder="Buscar por código o piedra..."
                            value={search} onChange={e => setSearch(e.target.value)} className="input-dark pl-9" />
                    </div>
                    <button onClick={() => setLowStockOnly(v => !v)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${lowStockOnly
                            ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/20'}`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Stock bajo
                        {lowStockOnly && (
                            <span className="ml-1 bg-orange-500/30 text-orange-300 px-1.5 py-0.5 rounded-full text-[10px]">
                                {items.filter(i => i.stock <= 3).length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/[0.06]">
                            {['Img', 'Código', 'Piedra', 'Formato', 'Cuerda', 'Precio', 'Costo Prod.', 'Stock', 'Estado', ''].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>{Array.from({ length: 10 }).map((_, j) => (
                                    <td key={j} className="px-4 py-4"><div className="skeleton h-4 w-full" /></td>
                                ))}</tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={10} className="px-5 py-12 text-center text-slate-500 text-sm">No se encontraron productos</td></tr>
                        ) : (
                            filtered.map(item => {
                                const status = getStockStatus(item.stock)
                                const isEditing = editingId === item.id
                                const imgSrc = getItemImage(item)
                                return (
                                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                        {/* Image */}
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col items-center gap-1 w-12">
                                                {/* Thumbnail — click to expand */}
                                                <button
                                                    onClick={() => setLightboxImg({ src: imgSrc, code: item.code })}
                                                    className="relative w-11 h-11 rounded-lg overflow-hidden group/img border border-white/10 hover:border-indigo-500/50 transition-all"
                                                    title="Ver imagen"
                                                >
                                                    <img
                                                        src={imgSrc}
                                                        alt={item.code}
                                                        className="w-full h-full object-cover bg-white/5"
                                                        onError={e => { (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='1.5'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='m21 15-5-5L5 21'/%3E%3C/svg%3E` }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                                        <ZoomIn className="w-4 h-4 text-white" />
                                                    </div>
                                                </button>
                                                {/* Upload button — always visible */}
                                                <button
                                                    onClick={() => startImageUpload(item)}
                                                    disabled={uploadingId === item.id}
                                                    className="flex items-center gap-1 text-[9px] text-slate-500 hover:text-indigo-400 transition-colors disabled:opacity-50"
                                                    title="Cambiar imagen"
                                                >
                                                    {uploadingId === item.id
                                                        ? <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                                        : <ImagePlus className="w-2.5 h-2.5" />}
                                                    {uploadingId === item.id ? 'subiendo' : 'cambiar'}
                                                </button>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <span className="font-mono text-xs font-bold text-indigo-400">{item.code}</span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-200 font-medium">{item.data?.piedra || '—'}</td>
                                        <td className="px-4 py-4 text-xs text-slate-400">{item.data?.formato || '—'}</td>
                                        <td className="px-4 py-4 text-xs text-slate-400">{item.data?.cuerda || '—'}</td>

                                        {/* Precio */}
                                        <td className="px-4 py-4">
                                            {isEditing ? (
                                                <input type="number" value={editingPrecio}
                                                    onChange={e => setEditingPrecio(parseInt(e.target.value) || 0)}
                                                    className="w-24 px-2 py-1 text-xs text-center bg-indigo-500/10 border border-indigo-500/40 rounded-lg text-white focus:outline-none"
                                                    min="0" />
                                            ) : (
                                                <span className="text-sm font-semibold text-emerald-400">{formatCurrency(item.data?.precio || 0)}</span>
                                            )}
                                        </td>

                                        {/* Costo Producción */}
                                        <td className="px-4 py-4">
                                            {isEditing ? (
                                                <input type="number" value={editingCosto}
                                                    onChange={e => setEditingCosto(parseInt(e.target.value) || 0)}
                                                    className="w-24 px-2 py-1 text-xs text-center bg-orange-500/10 border border-orange-500/40 rounded-lg text-white focus:outline-none"
                                                    min="0" />
                                            ) : (
                                                <span className="text-xs text-orange-300">
                                                    {item.data?.costo_produccion ? formatCurrency(item.data.costo_produccion) : <span className="text-slate-600">—</span>}
                                                </span>
                                            )}
                                        </td>

                                        {/* Stock */}
                                        <td className="px-4 py-4">
                                            {isEditing ? (
                                                <input type="number" value={editingStock}
                                                    onChange={e => setEditingStock(parseInt(e.target.value) || 0)}
                                                    className="w-16 px-2 py-1 text-sm text-center bg-indigo-500/10 border border-indigo-500/40 rounded-lg text-white focus:outline-none"
                                                    min="0" autoFocus />
                                            ) : (
                                                <span className="text-sm font-bold text-white">{item.stock}</span>
                                            )}
                                        </td>

                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border font-medium ${status.color}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                {status.label}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            {isEditing ? (
                                                <div className="flex items-center gap-1.5">
                                                    <button onClick={() => handleSave(item.id)} disabled={saving}
                                                        className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/25 transition-colors disabled:opacity-50">
                                                        <Save className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} disabled={saving}
                                                        className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 transition-colors disabled:opacity-50">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={() => startEdit(item)}
                                                    className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/15 hover:border-indigo-500/30 transition-all"
                                                    title="Editar">
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
