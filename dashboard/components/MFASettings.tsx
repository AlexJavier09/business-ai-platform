'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ShieldCheck, ShieldOff, QrCode, Loader2, CheckCircle2, X } from 'lucide-react'

type MFAStatus = 'loading' | 'unenrolled' | 'enrolling' | 'enrolled'

export function MFASettings() {
    const [status, setStatus] = useState<MFAStatus>('loading')
    const [qrCode, setQrCode] = useState('')
    const [secret, setSecret] = useState('')
    const [factorId, setFactorId] = useState('')
    const [verifyCode, setVerifyCode] = useState('')
    const [verifying, setVerifying] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => { checkMFAStatus() }, [])

    async function checkMFAStatus() {
        const supabase = createClient()
        const { data } = await supabase.auth.mfa.listFactors()
        const verified = data?.totp?.find(f => f.status === 'verified')
        setStatus(verified ? 'enrolled' : 'unenrolled')
        if (verified) setFactorId(verified.id)
    }

    async function startEnrollment() {
        setError('')
        setStatus('enrolling')
        const supabase = createClient()
        const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
        if (error || !data) {
            setError('Error al iniciar la configuración 2FA')
            setStatus('unenrolled')
            return
        }
        setFactorId(data.id)
        setQrCode(data.totp.qr_code)
        setSecret(data.totp.secret)
    }

    async function verifyEnrollment(e: React.FormEvent) {
        e.preventDefault()
        setVerifying(true)
        setError('')
        const supabase = createClient()

        const { data: challenge } = await supabase.auth.mfa.challenge({ factorId })
        if (!challenge) {
            setError('Error al crear el desafío 2FA')
            setVerifying(false)
            return
        }

        const { error } = await supabase.auth.mfa.verify({
            factorId,
            challengeId: challenge.id,
            code: verifyCode,
        })

        if (error) {
            setError('Código incorrecto. Verifica tu app de autenticación.')
        } else {
            setSuccess('¡Autenticación en dos pasos activada!')
            setStatus('enrolled')
            setQrCode('')
        }
        setVerifying(false)
    }

    async function unenroll() {
        if (!confirm('¿Desactivar la autenticación en dos pasos?')) return
        const supabase = createClient()
        await supabase.auth.mfa.unenroll({ factorId })
        setStatus('unenrolled')
        setFactorId('')
        setSuccess('')
    }

    return (
        <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-white">Autenticación en dos pasos (2FA)</h2>
                    <p className="text-xs text-slate-500">Protege tu cuenta con Google Authenticator o Authy</p>
                </div>
            </div>

            {status === 'loading' && (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Verificando estado...
                </div>
            )}

            {status === 'enrolled' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-sm text-emerald-400 font-medium">2FA activo — tu cuenta está protegida</span>
                    </div>
                    <button
                        onClick={unenroll}
                        className="flex items-center gap-2 text-xs text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 px-3 py-2 rounded-lg transition-all"
                    >
                        <ShieldOff className="w-3.5 h-3.5" />
                        Desactivar 2FA
                    </button>
                </div>
            )}

            {status === 'unenrolled' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <ShieldOff className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        <span className="text-sm text-orange-400">2FA no activado — se recomienda para mayor seguridad</span>
                    </div>
                    <button
                        onClick={startEnrollment}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20"
                    >
                        <QrCode className="w-4 h-4" />
                        Configurar autenticación 2FA
                    </button>
                </div>
            )}

            {status === 'enrolling' && (
                <div className="space-y-5">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-white">1. Escanea el código QR</p>
                        <p className="text-xs text-slate-500">Abre Google Authenticator o Authy y escanea el código</p>
                    </div>

                    {qrCode ? (
                        <div className="flex flex-col items-center gap-3">
                            {/* QR as SVG image from data URL */}
                            <div className="p-3 bg-white rounded-xl inline-block">
                                <img src={qrCode} alt="QR 2FA" className="w-40 h-40" />
                            </div>
                            <div className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <p className="text-[10px] text-slate-500 mb-1">O ingresa el código manualmente:</p>
                                <p className="font-mono text-xs text-violet-300 break-all">{secret}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                            <Loader2 className="w-4 h-4 animate-spin" /> Generando QR...
                        </div>
                    )}

                    <div className="space-y-1">
                        <p className="text-sm font-medium text-white">2. Ingresa el código de verificación</p>
                        <p className="text-xs text-slate-500">Código de 6 dígitos que aparece en tu app</p>
                    </div>

                    <form onSubmit={verifyEnrollment} className="space-y-3">
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            value={verifyCode}
                            onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            required
                            autoFocus
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white text-center placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-all tracking-[0.4em] font-mono"
                        />

                        {error && (
                            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                        )}

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={verifying || verifyCode.length < 6}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {verifying ? <><Loader2 className="w-4 h-4 animate-spin" />Verificando...</> : '✓ Activar 2FA'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setStatus('unenrolled'); setQrCode(''); setVerifyCode(''); setError('') }}
                                className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {success && status !== 'enrolling' && (
                <p className="mt-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">{success}</p>
            )}
        </div>
    )
}
