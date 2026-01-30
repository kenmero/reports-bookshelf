import { prisma } from '@/app/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { EditForm } from './EditForm'

interface Props {
    params: { id: string }
}

export default async function EditDocumentPage({ params }: Props) {
    const document = await prisma.document.findUnique({
        where: { id: params.id },
        include: { category: true }
    })

    if (!document) {
        notFound()
    }

    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
    })

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-custom-accent mb-8">ドキュメント編集</h1>
                <EditForm document={document} categories={categories} />
            </div>
        </div>
    )
}
