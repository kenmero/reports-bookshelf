'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { FileText, Download, ExternalLink } from 'lucide-react'

interface DocumentRendererProps {
    doc: {
        title: string
        content: string | null
        fileType: string
        filePath?: string | null
        externalUrl?: string | null
        fileSize?: number | null
        updatedAt: Date
    }
}

export default function DocumentRenderer({ doc }: DocumentRendererProps) {
    // 6. Text/Code/HTML Viewer (Fetch & Render)
    const [fetchedContent, setFetchedContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if ((doc.fileType === 'text' || doc.fileType === 'html' || doc.fileType === 'markdown') && doc.filePath) {
            setLoading(true);
            fetch(doc.filePath)
                .then(res => res.text())
                .then(text => setFetchedContent(text))
                .catch(err => console.error("Failed to load content", err))
                .finally(() => setLoading(false));
        }
    }, [doc.filePath, doc.fileType]);

    if (doc.fileType === 'markdown' && doc.filePath) {
        if (loading) {
            return <div className="text-white text-center p-10">Loading content...</div>;
        }
        return (
            <article className="prose prose-invert max-w-none prose-headings:text-[#c7a87e] prose-a:text-[#c7a87e] prose-strong:text-white p-8 bg-black/20 rounded border border-white/5">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {fetchedContent || ''}
                </ReactMarkdown>
            </article>
        )
    }

    // 1. External URL
    if (doc.fileType === 'url' && doc.externalUrl) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white/5 rounded-lg border border-white/10 text-center">
                <ExternalLink size={64} className="mb-4 text-[#c7a87e]" />
                <h2 className="text-2xl font-bold mb-4">{doc.title}</h2>
                <p className="mb-8 text-gray-400">This document is hosted externally.</p>
                <a
                    href={doc.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-3 bg-[#c7a87e] text-[#1a110d] font-bold rounded hover:bg-[#d4bca0] transition-colors"
                >
                    Open Link
                </a>
            </div>
        )
    }

    // 2. PDF Viewer
    if (doc.fileType === 'pdf' && doc.filePath) {
        return (
            <div className="w-full h-[800px] border border-[#3e2b20] rounded-lg overflow-hidden bg-white">
                <iframe
                    src={doc.filePath}
                    className="w-full h-full"
                    title={doc.title}
                />
            </div>
        )
    }

    // 3. Image Viewer
    if (doc.fileType === 'image' && doc.filePath) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-black/20 rounded-lg border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={doc.filePath}
                    alt={doc.title}
                    className="max-w-full max-h-[800px] rounded shadow-lg object-contain"
                />
            </div>
        )
    }

    // 4. Video Viewer
    if (doc.fileType === 'video' && doc.filePath) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-black/20 rounded-lg border border-white/10">
                <video
                    src={doc.filePath}
                    controls
                    className="max-w-full max-h-[800px] rounded shadow-lg"
                />
            </div>
        )
    }

    // 5. Audio Viewer
    if (doc.fileType === 'audio' && doc.filePath) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white/5 rounded-lg border border-white/10 text-center">
                <div className="mb-8 p-6 bg-[#c7a87e]/10 rounded-full">
                    <FileText size={48} className="text-[#c7a87e]" />
                </div>
                <h2 className="text-2xl font-bold mb-8">{doc.title}</h2>
                <audio
                    src={doc.filePath}
                    controls
                    className="w-full max-w-md"
                />
            </div>
        )
    }

    // 6. Text/Code/HTML Viewer (Rendering)

    if ((doc.fileType === 'text' || doc.fileType === 'html') && doc.filePath) {
        if (loading) {
            return <div className="text-white text-center p-10">Loading content...</div>;
        }

        // If it's HTML, render as is. If it's plain text, wrap in pre/code or basic HTML.
        // Since we want to display HTML properly, we inject it directly.
        // For plain text, we might want to wrap it, but for now treating 'text' (which includes .html from our previous fix) as raw HTML is what we want for the user's issue.
        // If it is actual plain text, it will just render as text.

        return (
            <div className="w-full h-[800px] border border-[#3e2b20] rounded-lg overflow-hidden bg-white text-black">
                <iframe
                    srcDoc={fetchedContent || ''}
                    className="w-full h-full"
                    title={doc.title}
                    sandbox="allow-same-origin allow-scripts" // Allow scripts if needed for the HTML report
                />
            </div>
        )
    }

    // 7. Binary Files (Office, etc.) - Fallback
    if ((doc.fileType === 'office' || doc.fileType === 'file') && doc.filePath) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white/5 rounded-lg border border-white/10 text-center">
                <FileText size={64} className="mb-4 text-[#c7a87e]" />
                <h2 className="text-2xl font-bold mb-2">{doc.title}</h2>
                <p className="text-sm text-gray-400 mb-8">
                    {doc.fileType.toUpperCase()} File
                    {doc.fileSize ? ` • ${Math.round(doc.fileSize / 1024)} KB` : ''}
                </p>
                <div className="flex gap-4 justify-center">
                    <a
                        href={doc.filePath}
                        download
                        className="flex items-center gap-2 px-8 py-3 bg-[#c7a87e] text-[#1a110d] font-bold rounded hover:bg-[#d4bca0] transition-colors"
                    >
                        <Download size={18} /> Download
                    </a>
                    {/* Option to try opening in browser */}
                    <a
                        href={doc.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-8 py-3 border border-[#c7a87e] text-[#c7a87e] font-bold rounded hover:bg-[#c7a87e]/10 transition-colors"
                    >
                        <ExternalLink size={18} /> Preview
                    </a>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                    *Preview might not work for media types unsupported by your browser.
                </p>
            </div>
        )
    }

    // 8. Fallback: Markdown or HTML
    const content = doc.content || '_No content_'

    if (doc.fileType === 'html') {
        return (
            <div className="w-full bg-white text-black p-8 rounded-lg shadow-lg">
                <iframe
                    srcDoc={`
                        <!DOCTYPE html>
                        <html>
                        <head>
                             <base target="_blank">
                             <style>body { font-family: sans-serif; padding: 20px; }</style>
                        </head>
                        <body>
                            ${content}
                        </body>
                        </html>
                    `}
                    className="w-full h-[800px] border-none"
                    sandbox="allow-same-origin"
                />
            </div>
        )
    }

    return (
        <article className="prose prose-invert max-w-none prose-headings:text-[#c7a87e] prose-a:text-[#c7a87e] prose-strong:text-white">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {content}
            </ReactMarkdown>
        </article>
    )
}
