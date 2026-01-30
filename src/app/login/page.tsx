'use client'
import { useFormState, useFormStatus } from 'react-dom'
import { authenticate } from '@/app/lib/actions'
import { BookOpen } from 'lucide-react'

export default function LoginPage() {
    const [errorMessage, dispatch] = useFormState(authenticate, undefined)

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1d] to-black flex items-center justify-center p-4">
            <div className="bg-slate-900/80 backdrop-blur-md p-10 rounded-xl shadow-2xl w-full max-w-sm border border-amber-900/30 ring-1 ring-white/5 relative overflow-hidden group">
                {/* Decorative top lighting */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-700 to-transparent opacity-50"></div>

                <div className="flex justify-center mb-8">
                    <div className="bg-slate-950 p-4 rounded-full border border-amber-900/20 shadow-inner">
                        <BookOpen className="text-amber-600" size={32} />
                    </div>
                </div>

                <h1 className="text-3xl font-serif font-medium text-center text-slate-200 mb-2 tracking-wide">
                    Bibliotheca
                </h1>
                <p className="text-center text-slate-500 text-xs uppercase tracking-widest mb-8">
                    Restricted Access
                </p>

                <form action={dispatch} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-amber-700/80 uppercase tracking-wider mb-2 ml-1">Identity</label>
                        <input
                            type="text"
                            name="username"
                            required
                            placeholder="Username"
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-slate-200 placeholder:text-slate-700 focus:ring-1 focus:ring-amber-700/50 focus:border-amber-900/50 outline-none transition-all shadow-inner"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-amber-700/80 uppercase tracking-wider mb-2 ml-1">Passphrase</label>
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="••••••••"
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-slate-200 placeholder:text-slate-700 focus:ring-1 focus:ring-amber-700/50 focus:border-amber-900/50 outline-none transition-all shadow-inner"
                        />
                    </div>

                    <div className="pt-4">
                        <LoginButton />
                    </div>

                    {errorMessage && (
                        <div className="text-red-400 text-xs text-center bg-red-950/20 py-2 rounded border border-red-900/30 animate-pulse">
                            {errorMessage}
                        </div>
                    )}
                </form>
            </div>

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] mix-blend-overlay"></div>
        </div>
    )
}

function LoginButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-gradient-to-b from-amber-700 to-amber-900 text-amber-50 font-serif font-medium py-3 rounded-lg hover:from-amber-600 hover:to-amber-800 transition-all disabled:opacity-50 shadow-lg shadow-amber-900/20 border border-amber-600/20 tracking-wide text-sm"
        >
            {pending ? 'Verifying...' : 'Enter Archive'}
        </button>
    )
}
