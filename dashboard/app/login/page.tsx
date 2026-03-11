'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Gem, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // 2FA state
    const [mfaStep, setMfaStep] = useState(false)
    const [totpCode, setTotpCode] = useState('')
    const [factorId, setFactorId] = useState('')

    async function handleGoogleLogin() {
        const supabase = createClient()
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        })
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const supabase = createClient()
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError('Correo o contraseña incorrectos')
            setLoading(false)
            return
        }

        // Check if MFA is required
        const { data: mfaData } = await supabase.auth.mfa.listFactors()
        const totpFactors = mfaData?.totp ?? []

        if (totpFactors.length > 0 && totpFactors[0].status === 'verified') {
            // User has 2FA set up — ask for the code
            setFactorId(totpFactors[0].id)
            setMfaStep(true)
            setLoading(false)
        } else {
            // No 2FA — go straight to dashboard
            window.location.href = '/'
        }
    }

    async function handleVerifyTotp(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const supabase = createClient()
        const { data: challenge } = await supabase.auth.mfa.challenge({ factorId })

        if (!challenge) {
            setError('Error al iniciar el desafío 2FA')
            setLoading(false)
            return
        }

        const { error } = await supabase.auth.mfa.verify({
            factorId,
            challengeId: challenge.id,
            code: totpCode,
        })

        if (error) {
            setError('Código incorrecto. Intenta de nuevo.')
            setLoading(false)
        } else {
            window.location.href = '/'
        }
    }

    return (
        <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-700/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-indigo-700/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-sm relative z-10">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/30 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/10">
                        {mfaStep ? <ShieldCheck className="w-7 h-7 text-violet-400" /> : <Gem className="w-7 h-7 text-violet-400" />}
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-tight">Roar of the Sun</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {mfaStep ? 'Verificación en dos pasos' : 'Panel de Administración'}
                    </p>
                </div>

                <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 shadow-2xl backdrop-blur-sm">

                    {/* ── 2FA step ── */}
                    {mfaStep ? (
                        <>
                            <h2 className="text-sm font-semibold text-white mb-2">Código de autenticación</h2>
                            <p className="text-xs text-slate-500 mb-5">Abre tu app de autenticación (Google Authenticator, Authy…) e ingresa el código de 6 dígitos.</p>

                            <form onSubmit={handleVerifyTotp} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Código TOTP</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]{6}"
                                            maxLength={6}
                                            value={totpCode}
                                            onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
                                            required
                                            placeholder="000000"
                                            autoFocus
                                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-all tracking-[0.3em] font-mono text-center"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || totpCode.length < 6}
                                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Verificando...</> : 'Verificar código'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setMfaStep(false); setTotpCode(''); setError('') }}
                                    className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-1"
                                >
                                    ← Volver al inicio de sesión
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h2 className="text-sm font-semibold text-white mb-5">Iniciar sesión</h2>

                            {/* Google OAuth */}
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white/[0.06] border border-white/[0.12] text-sm font-medium text-slate-200 hover:bg-white/[0.10] hover:border-white/20 transition-all mb-5"
                            >
                                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continuar con Google
                            </button>

                            <div className="flex items-center gap-3 mb-5">
                                <div className="flex-1 h-px bg-white/[0.06]" />
                                <span className="text-xs text-slate-600">o con correo</span>
                                <div className="flex-1 h-px bg-white/[0.06]" />
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Correo electrónico</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@roarofthesun.com"
                                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-all" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                                            className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-all" />
                                        <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                                )}

                                <button type="submit" disabled={loading}
                                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
                                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Entrando...</> : 'Entrar al panel'}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                <p className="text-center text-xs text-slate-600 mt-5">Acceso restringido · Solo administradores</p>
            </div>
        </div>
    )
}
