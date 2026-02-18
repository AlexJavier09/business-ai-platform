'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { BarChart2 } from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts'

interface SaleData {
    date: string
    ventas: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card px-4 py-3 text-sm">
                <p className="text-slate-400 mb-1">{label}</p>
                <p className="font-bold text-indigo-300">{payload[0].value} ventas</p>
            </div>
        )
    }
    return null
}

export function SalesChart() {
    const [data, setData] = useState<SaleData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        const supabase = createClient()
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: movements } = await supabase
            .from('movements')
            .select('created_at, quantity')
            .eq('type', 'sale')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: true })

        if (movements) {
            const grouped: Record<string, number> = {}
            movements.forEach((m) => {
                const date = new Date(m.created_at).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })
                grouped[date] = (grouped[date] || 0) + Math.abs(m.quantity)
            })
            setData(Object.entries(grouped).map(([date, ventas]) => ({ date, ventas })))
        }
        setLoading(false)
    }

    return (
        <div className="glass-card p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                        <BarChart2 className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">Ventas — Últimos 30 días</h2>
                        <p className="text-xs text-slate-500">Movimientos de tipo venta</p>
                    </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium">
                    {data.length} días
                </span>
            </div>

            {loading ? (
                <div className="skeleton h-48 w-full" />
            ) : data.length === 0 ? (
                <div className="h-48 flex items-center justify-center">
                    <p className="text-slate-500 text-sm">Sin datos de ventas aún</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                        <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="ventas"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fill="url(#colorVentas)"
                            dot={false}
                            activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
