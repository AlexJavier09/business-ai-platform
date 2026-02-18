'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Package, ShoppingCart, AlertTriangle, TrendingUp, Eye } from 'lucide-react'
import { StatsCard } from '@/components/StatsCard'
import { InventoryTable } from '@/components/InventoryTable'
import { OrdersList } from '@/components/OrdersList'
import { SalesChart } from '@/components/SalesChart'
import { AlertsPanel } from '@/components/AlertsPanel'
import { StockHistory } from '@/components/StockHistory'

export default function Home() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalStock: 0,
        pendingOrders: 0,
        lowStock: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [])

    async function loadStats() {
        const supabase = createClient()

        try {
            // Total productos
            const { count: productsCount } = await supabase
                .from('items')
                .select('*', { count: 'exact', head: true })
                .eq('active', true)

            // Total stock
            const { data: stockData } = await supabase
                .from('items')
                .select('stock')
                .eq('active', true)

            const totalStock = stockData?.reduce((sum, item) => sum + (item.stock || 0), 0) || 0

            // Pedidos pendientes
            const { count: ordersCount } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending')

            // Stock bajo
            const { count: lowStockCount } = await supabase
                .from('alerts')
                .select('*', { count: 'exact', head: true })
                .eq('type', 'stock_low')
                .eq('resolved', false)

            setStats({
                totalProducts: productsCount || 0,
                totalStock,
                pendingOrders: ordersCount || 0,
                lowStock: lowStockCount || 0,
            })
        } catch (error) {
            console.error('Error loading stats:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <header className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                                    Roar of the Sun
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Panel de Control</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Eye className="w-4 h-4" />
                            <span>Vista en Tiempo Real</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Total Productos"
                        value={stats.totalProducts}
                        icon={Package}
                        color="blue"
                        loading={loading}
                    />
                    <StatsCard
                        title="Stock Total"
                        value={stats.totalStock}
                        subtitle="unidades"
                        icon={TrendingUp}
                        color="green"
                        loading={loading}
                    />
                    <StatsCard
                        title="Pedidos Pendientes"
                        value={stats.pendingOrders}
                        icon={ShoppingCart}
                        color="purple"
                        loading={loading}
                    />
                    <StatsCard
                        title="Alertas de Stock"
                        value={stats.lowStock}
                        icon={AlertTriangle}
                        color="orange"
                        loading={loading}
                        alert={stats.lowStock > 0}
                    />
                </div>

                {/* Charts and Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2">
                        <SalesChart />
                    </div>
                    <div>
                        <AlertsPanel />
                    </div>
                </div>

                {/* Orders and History */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <OrdersList />
                    <StockHistory />
                </div>

                {/* Inventory Table - Full Width at Bottom */}
                <div>
                    <InventoryTable />
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-12 border-t border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    <p>© 2026 Roar of the Sun - Sistema de Gestión con IA</p>
                </div>
            </footer>
        </div>
    )
}
