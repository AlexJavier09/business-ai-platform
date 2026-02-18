'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface SalesData {
    piedra: string
    ventas: number
}

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

export function SalesChart() {
    const [data, setData] = useState<SalesData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadSalesData()
    }, [])

    async function loadSalesData() {
        const supabase = createClient()

        // Get movements (sales) from last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: movements, error } = await supabase
            .from('movements')
            .select(`
        quantity,
        items:item_id (
          data
        )
      `)
            .eq('type', 'sale')
            .gte('created_at', thirtyDaysAgo.toISOString())

        if (movements) {
            // Aggregate by piedra
            const salesByPiedra: { [key: string]: number } = {}

            movements.forEach((m: any) => {
                const piedra = m.items?.data?.piedra
                if (piedra) {
                    salesByPiedra[piedra] = (salesByPiedra[piedra] || 0) + Math.abs(m.quantity)
                }
            })

            const chartData = Object.entries(salesByPiedra)
                .map(([piedra, ventas]) => ({ piedra, ventas }))
                .sort((a, b) => b.ventas - a.ventas)
                .slice(0, 6)

            setData(chartData)
        }
        setLoading(false)
    }

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Productos Más Vendidos</h2>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Últimos 30 días</span>
            </div>

            {loading ? (
                <div className="h-80 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Cargando datos...</div>
                </div>
            ) : data.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    No hay datos de ventas disponibles
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                        <XAxis
                            dataKey="piedra"
                            tick={{ fill: '#6b7280' }}
                            tickLine={{ stroke: '#e5e7eb' }}
                        />
                        <YAxis
                            tick={{ fill: '#6b7280' }}
                            tickLine={{ stroke: '#e5e7eb' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '8px 12px',
                            }}
                            labelStyle={{ fontWeight: 600, color: '#111827' }}
                        />
                        <Bar dataKey="ventas" radius={[8, 8, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
