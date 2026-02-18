import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Codeverse AI — Business Dashboard',
    description: 'Panel de gestión inteligente para tu negocio',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body className="antialiased">{children}</body>
        </html>
    )
}
