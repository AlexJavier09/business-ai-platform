'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import {
    MessageSquare, Search, CheckCircle2, Clock, AlertCircle,
    Instagram, Phone, Facebook, User, Send, ChevronRight,
    Inbox
} from 'lucide-react'

interface Contact {
    id: string
    name: string
    channel: 'whatsapp' | 'instagram' | 'messenger'
    phone?: string
    avatar_url?: string
    last_seen_at: string
}

interface Conversation {
    id: string
    contact_id: string
    channel: 'whatsapp' | 'instagram' | 'messenger'
    status: 'open' | 'resolved' | 'pending'
    last_message: string
    unread_count: number
    updated_at: string
    contacts: Contact
}

interface Message {
    id: string
    direction: 'inbound' | 'outbound'
    content: string
    media_url?: string
    sent_at: string
}

const channelConfig = {
    whatsapp: {
        label: 'WhatsApp',
        icon: Phone,
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
        dot: 'bg-emerald-400',
        color: 'text-emerald-400',
    },
    instagram: {
        label: 'Instagram',
        icon: Instagram,
        badge: 'bg-pink-500/15 text-pink-400 border-pink-500/25',
        dot: 'bg-gradient-to-r from-pink-500 to-orange-400',
        color: 'text-pink-400',
    },
    messenger: {
        label: 'Messenger',
        icon: Facebook,
        badge: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
        dot: 'bg-blue-400',
        color: 'text-blue-400',
    },
}

const statusConfig = {
    open: { label: 'Abierto', icon: MessageSquare, color: 'text-indigo-400' },
    pending: { label: 'Pendiente', icon: Clock, color: 'text-yellow-400' },
    resolved: { label: 'Resuelto', icon: CheckCircle2, color: 'text-emerald-400' },
}

export function CRMView() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [activeConv, setActiveConv] = useState<Conversation | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [filterChannel, setFilterChannel] = useState<string>('all')
    const [search, setSearch] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => { loadConversations() }, [])

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    async function loadConversations() {
        setLoading(true)
        const supabase = createClient()
        const { data } = await supabase
            .from('conversations')
            .select('*, contacts(*)')
            .order('updated_at', { ascending: false })
        if (data) setConversations(data as Conversation[])
        setLoading(false)
    }

    async function loadMessages(convId: string) {
        setLoadingMessages(true)
        const supabase = createClient()

        // Mark as read
        await supabase
            .from('conversations')
            .update({ unread_count: 0 })
            .eq('id', convId)

        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', convId)
            .order('sent_at', { ascending: true })
        if (data) setMessages(data)

        // Refresh conversations to update unread badge
        loadConversations()
        setLoadingMessages(false)
    }

    async function resolveConversation(convId: string) {
        const supabase = createClient()
        await supabase
            .from('conversations')
            .update({ status: 'resolved' })
            .eq('id', convId)
        setActiveConv(prev => prev ? { ...prev, status: 'resolved' } : null)
        loadConversations()
    }

    function selectConversation(conv: Conversation) {
        setActiveConv(conv)
        loadMessages(conv.id)
    }

    // Filter conversations
    const filtered = conversations.filter(c => {
        const matchStatus = filterStatus === 'all' || c.status === filterStatus
        const matchChannel = filterChannel === 'all' || c.channel === filterChannel
        const matchSearch = !search || c.contacts?.name?.toLowerCase().includes(search.toLowerCase())
        return matchStatus && matchChannel && matchSearch
    })

    const unreadTotal = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)

    return (
        <div className="flex gap-0 h-[calc(100vh-140px)] glass-card overflow-hidden">

            {/* ── Left panel: conversation list ── */}
            <div className="w-80 flex-shrink-0 flex flex-col border-r border-white/[0.06]">
                {/* Header */}
                <div className="p-4 border-b border-white/[0.06]">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-semibold text-white">Conversaciones</h2>
                            {unreadTotal > 0 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500 text-white">
                                    {unreadTotal}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar contacto..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="input-dark pl-8 text-xs py-2"
                        />
                    </div>

                    {/* Channel filters */}
                    <div className="flex gap-1.5">
                        {['all', 'whatsapp', 'instagram', 'messenger'].map(ch => (
                            <button
                                key={ch}
                                onClick={() => setFilterChannel(ch)}
                                className={`text-[10px] px-2 py-1 rounded-lg font-medium transition-all ${filterChannel === ch
                                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                        : 'bg-white/5 text-slate-500 border border-white/10 hover:text-slate-300'
                                    }`}
                            >
                                {ch === 'all' ? 'Todos' : channelConfig[ch as keyof typeof channelConfig].label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status tabs */}
                <div className="flex border-b border-white/[0.06]">
                    {[
                        { key: 'all', label: 'Todos' },
                        { key: 'open', label: 'Abiertos' },
                        { key: 'resolved', label: 'Resueltos' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilterStatus(tab.key)}
                            className={`flex-1 py-2 text-[11px] font-medium transition-colors ${filterStatus === tab.key
                                    ? 'text-indigo-400 border-b-2 border-indigo-500'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Conversation list */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="p-3 border-b border-white/[0.04]">
                                <div className="skeleton h-14 w-full rounded-xl" />
                            </div>
                        ))
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                            <Inbox className="w-8 h-8 mb-2 opacity-30" />
                            <p className="text-sm">Sin conversaciones</p>
                        </div>
                    ) : (
                        filtered.map(conv => {
                            const channel = channelConfig[conv.channel]
                            const isActive = activeConv?.id === conv.id
                            const ChanIcon = channel.icon

                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => selectConversation(conv)}
                                    className={`w-full p-3 text-left border-b border-white/[0.04] transition-colors flex items-start gap-3 ${isActive ? 'bg-indigo-500/10' : 'hover:bg-white/[0.02]'
                                        }`}
                                >
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center">
                                            <User className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-cv-base ${channel.dot} flex items-center justify-center`}>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className="text-sm font-semibold text-white truncate">
                                                {conv.contacts?.name || 'Contacto'}
                                            </span>
                                            <span className="text-[10px] text-slate-600 flex-shrink-0 ml-1">
                                                {formatDate(conv.updated_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-slate-500 truncate">
                                                {conv.last_message || 'Sin mensajes aún'}
                                            </p>
                                            {conv.unread_count > 0 && (
                                                <span className="ml-1 flex-shrink-0 w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">
                                                    {conv.unread_count > 9 ? '9+' : conv.unread_count}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${channel.badge}`}>
                                                <ChanIcon className="w-2.5 h-2.5" />
                                                {channel.label}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            )
                        })
                    )}
                </div>
            </div>

            {/* ── Right panel: chat thread ── */}
            <div className="flex-1 flex flex-col min-w-0">
                {!activeConv ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-sm font-medium">Selecciona una conversación</p>
                        <p className="text-xs mt-1 opacity-60">Los mensajes aparecerán aquí</p>
                    </div>
                ) : (
                    <>
                        {/* Chat header */}
                        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center">
                                    <User className="w-4 h-4 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        {activeConv.contacts?.name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-medium ${channelConfig[activeConv.channel].color}`}>
                                            {channelConfig[activeConv.channel].label}
                                        </span>
                                        <span className="text-[10px] text-slate-600">·</span>
                                        <span className={`text-[10px] ${statusConfig[activeConv.status].color}`}>
                                            {statusConfig[activeConv.status].label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {activeConv.status !== 'resolved' && (
                                <button
                                    onClick={() => resolveConversation(activeConv.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-medium hover:bg-emerald-500/25 transition-colors"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Resolver
                                </button>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 text-slate-600">
                                    <p className="text-sm">Sin mensajes en esta conversación</p>
                                </div>
                            ) : (
                                messages.map(msg => {
                                    const isOutbound = msg.direction === 'outbound'
                                    return (
                                        <div key={msg.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] ${isOutbound
                                                ? 'bg-indigo-600/80 rounded-2xl rounded-br-md text-white'
                                                : 'bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-bl-md text-slate-200'
                                                } px-4 py-2.5`}>
                                                {msg.media_url && (
                                                    <img
                                                        src={msg.media_url}
                                                        alt="media"
                                                        className="w-full rounded-xl mb-2 max-h-48 object-cover"
                                                    />
                                                )}
                                                {msg.content && (
                                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                                )}
                                                <p className={`text-[10px] mt-1 ${isOutbound ? 'text-indigo-200' : 'text-slate-600'}`}>
                                                    {new Date(msg.sent_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input area — read only for now */}
                        <div className="px-5 py-4 border-t border-white/[0.06]">
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                                <p className="flex-1 text-sm text-slate-600 italic">
                                    Responde desde ManyChat · Las respuestas se sincronizan aquí
                                </p>
                                <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-lg">
                                    <Send className="w-3 h-3" />
                                    ManyChat
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
