'use client'

import { createUser } from '@/app/lib/actions'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AddUserPage() {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (formData: FormData) => {
        setIsPending(true)
        setError('')

        try {
            const result = await createUser(formData)
            if (result.success) {
                router.push('/admin/users')
                router.refresh()
            } else {
                setError(result.error || 'Failed to create user')
                setIsPending(false)
            }
        } catch (e) {
            setError('An unexpected error occurred')
            setIsPending(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <Link href="/admin/users" className="text-slate-400 hover:text-white flex items-center gap-2 mb-4 transition-colors">
                    <ArrowLeft size={16} /> Back to Users
                </Link>
                <h1 className="text-3xl font-bold text-white border-b border-gray-700 pb-4">Add New User</h1>
            </div>

            <form action={handleSubmit} className="bg-custom-deep p-8 rounded-lg shadow-xl space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                    <input
                        name="username"
                        required
                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:ring-2 focus:ring-custom-accent outline-none"
                        placeholder="e.g. johndoe"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <input
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:ring-2 focus:ring-custom-accent outline-none"
                        placeholder="At least 6 characters"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                    <select
                        name="role"
                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:ring-2 focus:ring-custom-accent outline-none"
                        defaultValue="VIEWER"
                    >
                        <option value="ADMIN">ADMIN (Full Access)</option>
                        <option value="EDITOR">EDITOR (Manage Documents)</option>
                        <option value="VIEWER">VIEWER (Read Only)</option>
                    </select>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded text-sm">
                        {error}
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-custom-accent text-slate-900 font-bold px-8 py-3 rounded hover:bg-sky-500 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Create User
                    </button>
                </div>
            </form>
        </div>
    )
}
