'use client'
import { deleteDocument } from '@/app/lib/actions'
import { useState } from 'react'

interface Props {
    id: string
    title: string
}

export function DeleteButton({ id, title }: Props) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteDocument(id)
            if (result.success) {
                window.location.reload()
            } else {
                alert(result.error || '削除に失敗しました')
                setIsDeleting(false)
            }
        } catch (error) {
            alert('削除に失敗しました')
            setIsDeleting(false)
        }
    }

    if (showConfirm) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-custom-midnight p-6 rounded-lg shadow-2xl max-w-md">
                    <h3 className="text-xl font-bold text-custom-accent mb-4">削除確認</h3>
                    <p className="text-custom-text mb-6">
                        「{title}」を削除してもよろしいですか？<br />
                        この操作は取り消せません。
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setShowConfirm(false)}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-custom-deep text-custom-text rounded hover:bg-custom-deep/80 transition-colors disabled:opacity-50"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {isDeleting ? '削除中...' : '削除'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="px-3 py-1 text-sm bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
        >
            削除
        </button>
    )
}
