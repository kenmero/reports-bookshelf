import { getDocumentById } from '@/app/lib/actions'
import DocumentRenderer from '@/components/DocumentRenderer'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function DocPage({ params }: { params: { id: string } }) {
    const doc = await getDocumentById(params.id)

    if (!doc) {
        return <div className="p-8 text-white">Document not found</div>
    }

    return (
        <div className="relative">
            <Link
                href="/"
                className="fixed top-6 left-6 z-50 flex items-center gap-2 bg-[#2a1b0e]/90 text-[#c7a87e] px-4 py-2 rounded-full border border-[#c7a87e]/30 shadow-xl hover:bg-[#3e2b20] transition-all group backdrop-blur-sm"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-serif tracking-widest text-sm uppercase">Back to Library</span>
            </Link>
            <main className="min-h-screen bg-[#1a110d] pt-28 pb-12 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <DocumentRenderer doc={doc} />
                </div>
            </main>
        </div>
    )
}
