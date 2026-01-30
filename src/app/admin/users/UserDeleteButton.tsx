'use client'

import { deleteUser } from '@/app/lib/actions'
import { UserX } from 'lucide-react'
import { useTransition } from 'react'

export default function UserDeleteButton({ id, username }: { id: string, username: string }) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete user "${username}"?`)) {
            startTransition(async () => {
                const result = await deleteUser(id)
                if (!result.success) {
                    alert(result.error)
                }
            })
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-red-400 hover:text-red-300 flex items-center gap-1 disabled:opacity-50"
        >
            <UserX size={16} /> {isPending ? 'Deleting...' : 'Delete'}
        </button>
    )
}
