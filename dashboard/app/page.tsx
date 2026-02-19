'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import {
    Package, ShoppingCart, AlertTriangle, TrendingUp,
    LayoutDashboard, History, Bell, Settings, Zap,
    ChevronRight, Activity, Menu, X, PanelLeftClose, PanelLeftOpen, MessageSquare
} from 'lucide-react'
import { StatsCard } from '@/components/StatsCard'
import { InventoryTable } from '@/components/InventoryTable'
import { OrdersList } from '@/components/OrdersList'
import { SalesChart } from '@/components/SalesChart'
import { AlertsPanel } from '@/components/AlertsPanel'
import { StockHistory } from '@/components/StockHistory'
import { CRMView } from '@/components/CRMView'

type Section = 'dashboard' | 'inventario' | 'pedidos' | 'historial' | 'alertas' | 'configuracion' | 'crm'

const navItems: { icon: any; label: string; key: Section }[] = [
    { icon: LayoutDashboard, label: 'Dashboard', key: 'dashboard' },
    { icon: Package, label: 'Inventario', key: 'inventario' },
    { icon: ShoppingCart, label: 'Pedidos', key: 'pedidos' },
    { icon: MessageSquare, label: 'CRM / Chats', key: 'crm' },
    { icon: History, label: 'Historial', key: 'historial' },
    { icon: Bell, label: 'Alertas', key: 'alertas' },
    { icon: Settings, label: 'Configuración', key: 'configuracion' },
]

const sectionTitles: Record<Section, { title: string; subtitle: string }> = {
    dashboard: { title: 'Panel de Control', subtitle: 'Roar of the Sun · Joyería' },
    inventario: { title: 'Inventario', subtitle: 'Gestión de productos y stock' },
    pedidos: { title: 'Pedidos', subtitle: 'Gestión de órdenes de clientes' },
    crm: { title: 'CRM · Conversaciones', subtitle: 'WhatsApp · Instagram · Messenger' },
    historial: { title: 'Historial de Movimientos', subtitle: 'Registro de cambios de stock' },
    alertas: { title: 'Alertas', subtitle: 'Notificaciones del sistema' },
    configuracion: { title: 'Configuración', subtitle: 'Ajustes del sistema' },
}

export default function Home() {
    const [activeSection, setActiveSection] = useState<Section>('dashboard')
    const [ordersFilter, setOrdersFilter] = useState<string>('grouped')
    // Sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false)      // mobile drawer
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false) // desktop rail
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalStock: 0,
        pendingOrders: 0,
        lowStock: 0,
    })
    const [loading, setLoading] = useState(true)

    function goToInventoryLowStock() {
        setActiveSection('inventario')
    }

    function goToPendingOrders() {
        setOrdersFilter('pending')
        setActiveSection('pedidos')
    }

    useEffect(() => { loadStats() }, [])

    async function loadStats() {
        const supabase = createClient()
        try {
            const { count: productsCount } = await supabase
                .from('items').select('*', { count: 'exact', head: true }).eq('active', true)
            const { data: stockData } = await supabase
                .from('items').select('stock').eq('active', true)
            const totalStock = stockData?.reduce((sum, item) => sum + (item.stock || 0), 0) || 0
            const { count: ordersCount } = await supabase
                .from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending')
            const { count: lowStockCount } = await supabase
                .from('alerts').select('*', { count: 'exact', head: true })
                .eq('type', 'stock_low').eq('resolved', false)
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

    const current = sectionTitles[activeSection]

    // Navigate and close mobile drawer
    function navigate(key: Section) {
        setActiveSection(key)
        setSidebarOpen(false)
    }

    // Sidebar nav content — shared between mobile and desktop
    function SidebarContent({ collapsed }: { collapsed?: boolean }) {
        return (
            <>
                {/* Logo */}
                <div className={`border-b border-cv-border ${collapsed ? 'p-3 flex justify-center' : 'p-5'}`}>
                    <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cv-indigo to-cv-violet flex items-center justify-center shadow-glow-indigo flex-shrink-0">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        {!collapsed && (
                            <div>
                                <p className="text-xs font-semibold text-cv-indigo tracking-widest uppercase">Codeverse AI</p>
                                <p className="text-sm font-bold text-white leading-tight">Business Hub</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Client badge */}
                {!collapsed && (
                    <div className="px-4 pt-4">
                        <div className="px-3 py-2 rounded-lg bg-cv-elevated border border-cv-border">
                            <p className="text-xs text-slate-500 mb-0.5">Cliente activo</p>
                            <p className="text-sm font-semibold text-white">Roar of the Sun</p>
                        </div>
                    </div>
                )}

                {/* Nav */}
                <nav className={`flex-1 py-4 space-y-1 ${collapsed ? 'px-2' : 'px-3'}`}>
                    {navItems.map((item) => {
                        const isActive = activeSection === item.key
                        return (
                            <button
                                key={item.key}
                                onClick={() => navigate(item.key)}
                                title={collapsed ? item.label : undefined}
                                className={`sidebar-item w-full text-left ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
                            >
                                <item.icon className="w-4 h-4 flex-shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                                {!collapsed && isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />}
                            </button>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className={`p-4 border-t border-cv-border ${collapsed ? 'flex justify-center' : ''}`}>
                    {collapsed ? (
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
                            <span className="text-xs text-slate-500">Sistema operativo</span>
                        </div>
                    )}
                </div>
            </>
        )
    }

    return (
        <div className="flex min-h-screen bg-cv-base bg-grid">

            {/* ── Mobile overlay ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Mobile drawer ── */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full w-64 flex flex-col
                border-r border-cv-border bg-cv-surface/95 backdrop-blur-xl
                transition-transform duration-300 ease-in-out
                lg:hidden
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Close button inside drawer */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
                <SidebarContent />
            </aside>

            {/* ── Desktop sidebar ── */}
            <aside className={`
                hidden lg:flex flex-col flex-shrink-0
                border-r border-cv-border bg-cv-surface/60 backdrop-blur-xl
                sticky top-0 h-screen
                transition-all duration-300 ease-in-out
                ${sidebarCollapsed ? 'w-16' : 'w-64'}
            `}>
                <SidebarContent collapsed={sidebarCollapsed} />
            </aside>

            {/* ── Main ── */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Top bar */}
                <header className="sticky top-0 z-10 border-b border-cv-border bg-cv-base/80 backdrop-blur-xl px-4 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                            >
                                <Menu className="w-4 h-4" />
                            </button>

                            {/* Desktop collapse toggle */}
                            <button
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className="hidden lg:flex w-9 h-9 rounded-lg bg-white/5 border border-white/10 items-center justify-center text-slate-400 hover:text-white transition-colors"
                                title={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
                            >
                                {sidebarCollapsed
                                    ? <PanelLeftOpen className="w-4 h-4" />
                                    : <PanelLeftClose className="w-4 h-4" />
                                }
                            </button>

                            <div>
                                <h1 className="text-base lg:text-xl font-bold text-white">{current.title}</h1>
                                <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">{current.subtitle}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-xs font-medium text-emerald-400">Tiempo Real</span>
                            </div>
                            {stats.lowStock > 0 && (
                                <button
                                    onClick={() => setActiveSection('alertas')}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 animate-pulse-glow hover:bg-orange-500/20 transition-colors"
                                >
                                    <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                                    <span className="text-xs font-medium text-orange-400">{stats.lowStock} alertas</span>
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-8 animate-fadeIn">

                    {/* ── DASHBOARD ── */}
                    {activeSection === 'dashboard' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                                <div className="animate-fadeInUp stagger-1 opacity-0">
                                    <StatsCard title="Productos Activos" value={stats.totalProducts} icon={Package} color="indigo" loading={loading} onClick={() => setActiveSection('inventario')} />
                                </div>
                                <div className="animate-fadeInUp stagger-2 opacity-0">
                                    <StatsCard title="Stock Total" value={stats.totalStock} subtitle="unidades" icon={TrendingUp} color="cyan" loading={loading} />
                                </div>
                                <div className="animate-fadeInUp stagger-3 opacity-0">
                                    <StatsCard title="Pedidos Pendientes" value={stats.pendingOrders} icon={ShoppingCart} color="violet" loading={loading} onClick={goToPendingOrders} />
                                </div>
                                <div className="animate-fadeInUp stagger-4 opacity-0">
                                    <StatsCard title="Alertas de Stock" value={stats.lowStock} icon={AlertTriangle} color="orange" loading={loading} alert={stats.lowStock > 0} onClick={goToInventoryLowStock} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2"><SalesChart /></div>
                                <div><AlertsPanel /></div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <OrdersList initialFilter={ordersFilter} />
                                <StockHistory />
                            </div>
                        </div>
                    )}

                    {/* ── INVENTARIO ── */}
                    {activeSection === 'inventario' && (
                        <div className="animate-fadeInUp opacity-0">
                            <InventoryTable />
                        </div>
                    )}

                    {/* ── PEDIDOS ── */}
                    {activeSection === 'pedidos' && (
                        <div className="animate-fadeInUp opacity-0 max-w-3xl">
                            <OrdersList initialFilter={ordersFilter} />
                        </div>
                    )}

                    {/* ── CRM ── */}
                    {activeSection === 'crm' && (
                        <div className="animate-fadeInUp opacity-0">
                            <CRMView />
                        </div>
                    )}

                    {/* ── HISTORIAL ── */}
                    {activeSection === 'historial' && (
                        <div className="animate-fadeInUp opacity-0 max-w-3xl">
                            <StockHistory />
                        </div>
                    )}

                    {/* ── ALERTAS ── */}
                    {activeSection === 'alertas' && (
                        <div className="animate-fadeInUp opacity-0 max-w-2xl">
                            <AlertsPanel />
                        </div>
                    )}

                    {/* ── CONFIGURACIÓN ── */}
                    {activeSection === 'configuracion' && (
                        <div className="animate-fadeInUp opacity-0 max-w-2xl space-y-6">
                            <div className="glass-card p-6">
                                <h2 className="text-sm font-semibold text-white mb-4">Información del Tenant</h2>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Empresa', value: 'Roar of the Sun' },
                                        { label: 'Industria', value: 'Joyería / Pulseras' },
                                        { label: 'Plataforma', value: 'Codeverse AI Business Hub' },
                                        { label: 'Versión', value: '1.0.0' },
                                    ].map(row => (
                                        <div key={row.label} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
                                            <span className="text-xs text-slate-500">{row.label}</span>
                                            <span className="text-sm text-slate-200 font-medium">{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-card p-6">
                                <h2 className="text-sm font-semibold text-white mb-4">Conexión a Base de Datos</h2>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
                                    <span className="text-sm text-emerald-400 font-medium">Supabase conectado</span>
                                </div>
                            </div>

                            <div className="glass-card p-6">
                                <h2 className="text-sm font-semibold text-white mb-1">Soporte</h2>
                                <p className="text-xs text-slate-500 mb-4">¿Necesitas ayuda con tu plataforma?</p>
                                <a
                                    href="mailto:soporte@codeverse.ai"
                                    className="btn-primary inline-block"
                                >
                                    Contactar a Codeverse AI
                                </a>
                            </div>
                        </div>
                    )}

                </main>

                {/* Footer */}
                <footer className="border-t border-cv-border px-8 py-4">
                    <p className="text-xs text-slate-600 text-center">
                        Powered by <span className="text-cv-indigo font-semibold">Codeverse AI</span> · © 2026 Todos los derechos reservados
                    </p>
                </footer>
            </div>
        </div>
    )
}
