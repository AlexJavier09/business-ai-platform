'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { History, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

interface Movement {
    id: string
    type: string
    quantity: number
    previous_stock: number
    new_stock: number
    notes: string
    created_at: string
    items?: {
        code: string
        data: { piedra: string }
    }
}

export function StockHistory() {
    const [movements, setMovements] = useState<Movement[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadMovements()
    }, [])

    async function loadMovements() {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('movements')
            .select(`
        *,
        items:item_id (code, data)
      `)
            .order('created_at', { ascending: false })
            .limit(20)

        if (data) {
            setMovements(data)
        }
        setLoading(false)
    }

    const typeConfig = {
        sale: { label: 'Venta', color: 'red', icon: TrendingDown },
        restock: { label: 'Reposición', color: 'green', icon: TrendingUp },
        adjustment: { label: 'Ajuste', color: 'blue', icon: RefreshCw },
    }

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Historial de Movimientos</h2>
                    </div>
                    <button
                        onClick={loadMovements}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Refrescar"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Movements List */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="p-4">
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                        </div>
                    ))
                ) : movements.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No hay movimientos registrados
                    </div>
                ) : (
                    movements.map((movement) => {
                        const config = typeConfig[movement.type as keyof typeof typeConfig] || typeConfig.adjustment
                        const Icon = config.icon
                        const isIncrease = movement.quantity > 0

                        return (
                            <div key={movement.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.color === 'green'
                                            ? 'bg-green-100 dark:bg-green-900/30'
                                            : config.color === 'red'
                                                ? 'bg-red-100 dark:bg-red-900/30'
                                                : 'bg-blue-100 dark:bg-blue-900/30'
                                        }`}>
                                        <Icon className={`w-5 h-5 ${config.color === 'green'
                                                ? 'text-green-600 dark:text-green-400'
                                                : config.color === 'red'
                                                    ? 'text-red-600 dark:text-red-400'
                                                    : 'text-blue-600 dark:text-blue-400'
                                            }`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                                {movement.items?.code || 'N/A'}
                                            </span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color === 'green'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : config.color === 'red'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                {config.label}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-900 dark:text-white mb-1">
                                            {movement.items?.data?.piedra || 'Producto'}
                                        </p>

                                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                            <span>Stock: {movement.previous_stock}</span>
                                            <span className={isIncrease ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                                {isIncrease ? '+' : ''}{movement.quantity}
                                            </span>
                                            <span>→ {movement.new_stock}</span>
                                        </div>

                                        {movement.notes && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {movement.notes}
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                        {formatDate(movement.created_at)}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
