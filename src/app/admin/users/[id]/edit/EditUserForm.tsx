'use client'

import { updateUser } from '@/app/lib/actions'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UserData {
    id: string
    username: string
    role: string
}

export default function EditUserForm({ user }: { user: UserData }) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (formData: FormData) => {
        setIsPending(true)
        setError('')

        try {
            const result = await updateUser(user.id, formData)
            if (result.success) {
                router.push('/admin/users')
                router.refresh()
            } else {
                setError(result.error || 'Failed to update user')
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
                <h1 className="text-3xl font-bold text-white border-b border-gray-700 pb-4">Edit User: {user.username}</h1>
            </div>

            <form action={handleSubmit} className="bg-custom-deep p-8 rounded-lg shadow-xl space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                    <input
                        name="username"
                        required
                        defaultValue={user.username}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:ring-2 focus:ring-custom-accent outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password <span className="text-xs text-gray-500">(Leave blank to keep current)</span>
                    </label>
                    <input
                        name="password"
                        type="password"
                        minLength={6}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:ring-2 focus:ring-custom-accent outline-none"
                        placeholder="Enter new password to change"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                    <select
                        name="role"
                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:ring-2 focus:ring-custom-accent outline-none"
                        defaultValue={user.role}
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
                        Update User
                    </button>
                </div>
            </form>
        </div>
    )
}
