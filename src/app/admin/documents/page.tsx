import { prisma } from '@/app/lib/prisma'
import Link from 'next/link'
import { DeleteButton } from './DeleteButton'

export default async function DocumentsPage() {
    const documents = await prisma.document.findMany({
        include: {
            category: true
        },
        orderBy: {
            updatedAt: 'desc'
        }
    })

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-custom-accent">ドキュメント管理</h1>
                <Link
                    href="/admin/upload"
                    className="px-4 py-2 bg-custom-accent text-custom-midnight rounded hover:bg-custom-accent/90 transition-colors"
                >
                    新規追加
                </Link>
            </div>

            <div className="bg-custom-midnight rounded-lg shadow-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-custom-deep border-b border-custom-accent/20">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-custom-accent">タイトル</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-custom-accent">カテゴリ</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-custom-accent">種類</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-custom-accent">更新日</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-custom-accent">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-custom-accent/10">
                        {documents.map((doc) => (
                            <tr key={doc.id} className="hover:bg-custom-deep/50 transition-colors">
                                <td className="px-6 py-4 text-custom-text">
                                    <Link href={`/doc/${doc.id}`} className="hover:text-custom-accent transition-colors">
                                        {doc.title}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-custom-muted">{doc.category.name}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 text-xs rounded bg-custom-accent/20 text-custom-accent">
                                        {doc.fileType.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-custom-muted text-sm">
                                    {new Date(doc.updatedAt).toLocaleDateString('ja-JP')}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/admin/documents/${doc.id}/edit`}
                                            className="px-3 py-1 text-sm bg-custom-accent/20 text-custom-accent rounded hover:bg-custom-accent/30 transition-colors"
                                        >
                                            編集
                                        </Link>
                                        <DeleteButton id={doc.id} title={doc.title} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {documents.length === 0 && (
                    <div className="text-center py-12 text-custom-muted">
                        ドキュメントがありません
                    </div>
                )}
            </div>
        </div>
    )
}
