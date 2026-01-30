import { getUsers } from '@/app/lib/actions'
import { UserCheck, UserX, Clock, Plus, Pencil } from 'lucide-react'
import Link from 'next/link'
import UserDeleteButton from './UserDeleteButton'

export default async function UsersPage() {
    const users = await getUsers()

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                <h1 className="text-3xl font-bold text-white">User Management</h1>
                <Link
                    href="/admin/users/add"
                    className="bg-custom-accent text-slate-900 font-bold px-4 py-2 rounded flex items-center gap-2 hover:bg-sky-500 transition-colors"
                >
                    <Plus size={18} /> Add New User
                </Link>
            </div>

            <div className="bg-custom-deep rounded-lg shadow-xl overflow-hidden">
                <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-slate-900 uppercase">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-medium text-custom-accent">Username</th>
                            <th scope="col" className="px-6 py-4 font-medium text-custom-accent">Role</th>
                            <th scope="col" className="px-6 py-4 font-medium text-custom-accent">Created At</th>
                            <th scope="col" className="px-6 py-4 font-medium text-custom-accent text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                                    <UserCheck size={16} className="text-custom-accent" /> {user.username}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${user.role === 'ADMIN'
                                            ? 'bg-purple-900/30 text-purple-400 border-purple-500/30'
                                            : user.role === 'EDITOR'
                                                ? 'bg-blue-900/30 text-blue-400 border-blue-500/30'
                                                : 'bg-slate-700 text-slate-400 border-slate-600'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} /> {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <Link
                                            href={`/admin/users/${user.id}/edit`}
                                            className="text-custom-accent hover:text-white flex items-center gap-1 transition-colors"
                                        >
                                            <Pencil size={16} /> Edit
                                        </Link>
                                        <UserDeleteButton id={user.id} username={user.username} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {users.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    No users found.
                </div>
            )}
        </div>
    )
}
