'use client'
import { updateDocument } from '@/app/lib/actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Document as PrismaDocument, Category } from '@prisma/client'

interface Props {
    document: PrismaDocument & { category: Category }
    categories: Category[]
}

export function EditForm({ document, categories }: Props) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const result = await updateDocument(document.id, formData)

        if (result.success) {
            router.push('/admin/documents')
        } else {
            setError(result.error || '更新に失敗しました')
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-custom-midnight p-8 rounded-lg shadow-xl space-y-6">
            {error && (
                <div className="bg-red-600/20 border border-red-600/50 text-red-400 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="title" className="block text-sm font-semibold text-custom-accent mb-2">
                    タイトル
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    defaultValue={document.title}
                    required
                    className="w-full px-4 py-2 bg-custom-deep border border-custom-accent/30 rounded text-custom-text focus:outline-none focus:border-custom-accent"
                />
            </div>

            <div>
                <label htmlFor="categoryId" className="block text-sm font-semibold text-custom-accent mb-2">
                    カテゴリ
                </label>
                <select
                    id="categoryId"
                    name="categoryId"
                    defaultValue={document.categoryId}
                    required
                    className="w-full px-4 py-2 bg-custom-deep border border-custom-accent/30 rounded text-custom-text focus:outline-none focus:border-custom-accent"
                >
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="content" className="block text-sm font-semibold text-custom-accent mb-2">
                    内容 {document.fileType === 'markdown' && '(Markdown)'}
                </label>
                <textarea
                    id="content"
                    name="content"
                    defaultValue={document.content || ''}
                    required
                    rows={20}
                    className="w-full px-4 py-2 bg-custom-deep border border-custom-accent/30 rounded text-custom-text focus:outline-none focus:border-custom-accent font-mono text-sm"
                />
            </div>

            <div className="flex gap-4 justify-end">
                <button
                    type="button"
                    onClick={() => router.push('/admin/documents')}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-custom-deep text-custom-text rounded hover:bg-custom-deep/80 transition-colors disabled:opacity-50"
                >
                    キャンセル
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-custom-accent text-custom-midnight rounded hover:bg-custom-accent/90 transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? '保存中...' : '保存'}
                </button>
            </div>
        </form>
    )
}
