'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import {
    DollarSign, TrendingUp, TrendingDown, Wallet, PlusCircle,
    X, ChevronDown, Tag, Truck, Package, Wrench, MoreHorizontal,
    ArrowUpRight, ArrowDownRight, RefreshCw
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Entry {
    id: string
    type: 'income' | 'expense'
    category: string
    amount: number
    description: string
    order_id: string | null
    date: string
    created_at: string
}

const CATEGORIES = [
    { value: 'proveedor', label: 'Proveedor', icon: Package },
    { value: 'envio', label: 'Envío', icon: Truck },
    { value: 'operativo', label: 'Operativo', icon: Wrench },
    { value: 'otro', label: 'Otro', icon: MoreHorizontal },
]

const categoryLabel: Record<string, string> = {
    venta: '💰 Venta',
    proveedor: '📦 Proveedor',
    envio: '🚚 Envío',
    operativo: '🔧 Operativo',
    otro: '📌 Otro',
}

export function AccountingView() {
    const [entries, setEntries] = useState<Entry[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')

    // Form
    const [fCategory, setFCategory] = useState('proveedor')
    const [fAmount, setFAmount] = useState('')
    const [fDescription, setFDescription] = useState('')
    const [fDate, setFDate] = useState(new Date().toISOString().split('T')[0])

    useEffect(() => { load() }, [])

    async function load() {
        setLoading(true)
        const supabase = createClient()
        const { data } = await supabase
            .from('accounting_entries')
            .select('*')
            .order('date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(200)
        if (data) setEntries(data)
        setLoading(false)
    }

    async function handleExpense(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        const supabase = createClient()
        const { data: tenants } = await supabase.from('tenants').select('id').limit(1)
        const tenantId = tenants?.[0]?.id
        const { error } = await supabase.from('accounting_entries').insert({
            tenant_id: tenantId,
            type: 'expense',
            category: fCategory,
            amount: parseFloat(fAmount),
            description: fDescription,
            date: fDate,
        })
        if (!error) {
            setShowForm(false)
            setFAmount('')
            setFDescription('')
            await load()
        }
        setSaving(false)
    }

    const filtered = filterType === 'all' ? entries : entries.filter(e => e.type === filterType)
    const totalIngresos = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
    const totalGastos = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
    const ganancia = totalIngresos - totalGastos
    const margen = totalIngresos > 0 ? ((ganancia / totalIngresos) * 100).toFixed(1) : '0.0'

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Ingresos', value: formatCurrency(totalIngresos), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                    { label: 'Gastos', value: formatCurrency(totalGastos), icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
                    { label: 'Ganancia Neta', value: formatCurrency(ganancia), icon: Wallet, color: ganancia >= 0 ? 'text-emerald-400' : 'text-red-400', bg: ganancia >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20' },
                    { label: 'Margen', value: `${margen}%`, icon: DollarSign, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
                ].map(card => {
                    const Icon = card.icon
                    return (
                        <div key={card.label} className={`glass-card p-5 border ${card.bg}`}>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs text-slate-500 font-medium">{card.label}</p>
                                <Icon className={`w-4 h-4 ${card.color}`} />
                            </div>
                            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                        </div>
                    )
                })}
            </div>

            {/* Transactions */}
            <div className="glass-card overflow-hidden">
                <div className="p-5 border-b border-white/[0.06] flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-violet-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-white">Movimientos</h2>
                            <p className="text-xs text-slate-500">{filtered.length} registros</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Filter */}
                        {(['all', 'income', 'expense'] as const).map(f => (
                            <button key={f} onClick={() => setFilterType(f)}
                                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${filterType === f
                                    ? f === 'income' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                        : f === 'expense' ? 'bg-red-500/20 border-red-500/40 text-red-400'
                                            : 'bg-white/10 border-white/20 text-white'
                                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                                {f === 'all' ? 'Todo' : f === 'income' ? '↑ Ingresos' : '↓ Gastos'}
                            </button>
                        ))}
                        <button onClick={load} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setShowForm(v => !v)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-violet-500/20">
                            <PlusCircle className="w-3.5 h-3.5" />
                            Registrar gasto
                        </button>
                    </div>
                </div>

                {/* Expense form */}
                {showForm && (
                    <div className="p-5 border-b border-white/[0.06] bg-white/[0.02]">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-semibold text-white">Nuevo gasto</p>
                            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleExpense} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Categoría</label>
                                <select value={fCategory} onChange={e => setFCategory(e.target.value)}
                                    className="input-dark text-xs" style={{ backgroundColor: '#1e293b' }}>
                                    {CATEGORIES.map(c => <option key={c.value} value={c.value} style={{ backgroundColor: '#1e293b' }}>{c.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Monto (₡)</label>
                                <input type="number" value={fAmount} onChange={e => setFAmount(e.target.value)}
                                    placeholder="0" min="0" step="100" required className="input-dark text-xs" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Fecha</label>
                                <input type="date" value={fDate} onChange={e => setFDate(e.target.value)}
                                    required className="input-dark text-xs" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Descripción</label>
                                <input type="text" value={fDescription} onChange={e => setFDescription(e.target.value)}
                                    placeholder="ej. Compra de materiales" className="input-dark text-xs" />
                            </div>
                            <div className="sm:col-span-4 flex justify-end gap-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-xs text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-all">Cancelar</button>
                                <button type="submit" disabled={saving}
                                    className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 transition-all">
                                    {saving ? 'Guardando...' : 'Guardar gasto'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* List */}
                <div className="divide-y divide-white/[0.04] overflow-y-auto max-h-[500px]">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => <div key={i} className="p-4"><div className="skeleton h-12 w-full" /></div>)
                    ) : filtered.length === 0 ? (
                        <div className="p-10 text-center text-slate-500 text-sm">Sin registros</div>
                    ) : (
                        filtered.map(entry => (
                            <div key={entry.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${entry.type === 'income' ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
                                    {entry.type === 'income'
                                        ? <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                                        : <ArrowDownRight className="w-4 h-4 text-red-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-200 font-medium truncate">{entry.description || '—'}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-slate-500">{new Date(entry.date).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${entry.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                            {categoryLabel[entry.category] || entry.category}
                                        </span>
                                    </div>
                                </div>
                                <p className={`text-sm font-bold flex-shrink-0 ${entry.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
