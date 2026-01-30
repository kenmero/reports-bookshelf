'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { createDocument } from '@/app/lib/actions'
import { Upload, Link as LinkIcon, FileText, CheckCircle, AlertCircle } from 'lucide-react'

import { useRouter } from 'next/navigation'

export default function UploadZone() {
    const router = useRouter()
    // ...
    const [mode, setMode] = useState<'file' | 'url'>('file')
    const [file, setFile] = useState<File | null>(null)
    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('')
    const [externalUrl, setExternalUrl] = useState('')
    const [requiredRole, setRequiredRole] = useState('VIEWER')
    const [content, setContent] = useState('') // Description/Markdown

    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })
    const [isUploading, setIsUploading] = useState(false)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0])
            // Auto-fill title if empty
            if (!title) {
                setTitle(acceptedFiles[0].name.split('.').slice(0, -1).join('.'))
            }
        }
    }, [title])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUploading(true)
        setStatus({ type: null, message: '' })

        const formData = new FormData()
        formData.append('title', title)
        formData.append('category', category)
        formData.append('requiredRole', requiredRole)
        formData.append('content', content) // Optional description

        if (mode === 'file') {
            if (!file) {
                setStatus({ type: 'error', message: 'ファイルを選択してください' })
                setIsUploading(false)
                return
            }
            formData.append('file', file)
            // fileType is auto-detected on server
        } else {
            if (!externalUrl) {
                setStatus({ type: 'error', message: 'URLを入力してください' })
                setIsUploading(false)
                return
            }
            formData.append('externalUrl', externalUrl)
            formData.append('fileType', 'url')
        }

        try {
            const result = await createDocument(formData) as any
            if (result.success) {
                setStatus({ type: 'success', message: 'Upload successful! Redirecting...' })
                setTimeout(() => router.push('/'), 1000)
            } else {
                setStatus({ type: 'error', message: result.error || 'Upload failed' })
                setIsUploading(false)
            }
        } catch (error) {
            console.error(error)
            setStatus({ type: 'error', message: 'アップロードに失敗しました' })
            setIsUploading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 bg-[#1e130c] p-8 rounded-lg border border-[#3e2b20] shadow-2xl">

            {/* Mode Toggle */}
            <div className="flex gap-4 border-b border-[#3e2b20] pb-4">
                <button
                    type="button"
                    onClick={() => setMode('file')}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${mode === 'file' ? 'bg-[#c7a87e] text-[#1a110d]' : 'text-[#8a725b] hover:text-[#c7a87e]'}`}
                >
                    <Upload size={18} /> File Upload
                </button>
                <button
                    type="button"
                    onClick={() => setMode('url')}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${mode === 'url' ? 'bg-[#c7a87e] text-[#1a110d]' : 'text-[#8a725b] hover:text-[#c7a87e]'}`}
                >
                    <LinkIcon size={18} /> External Link
                </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
                <div>
                    <label className="block text-xs uppercase tracking-widest text-[#8a725b] mb-1">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full bg-[#150f0a] border border-[#3e2b20] text-[#e8dac0] px-4 py-2 rounded focus:border-[#c7a87e] outline-none"
                        placeholder="Document Title"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-[#8a725b] mb-1">Category</label>
                        <input
                            type="text"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="w-full bg-[#150f0a] border border-[#3e2b20] text-[#e8dac0] px-4 py-2 rounded focus:border-[#c7a87e] outline-none"
                            placeholder="e.g. Finance, Tech"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-[#8a725b] mb-1">Access Level</label>
                        <select
                            value={requiredRole}
                            onChange={e => setRequiredRole(e.target.value)}
                            className="w-full bg-[#150f0a] border border-[#3e2b20] text-[#e8dac0] px-4 py-2 rounded focus:border-[#c7a87e] outline-none"
                        >
                            <option value="VIEWER">Viewer (Public)</option>
                            <option value="EDITOR">Editor Only</option>
                            <option value="ADMIN">Admin Only</option>
                        </select>
                    </div>
                </div>

                {/* Dropzone or URL Input */}
                {mode === 'file' ? (
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${isDragActive ? 'border-[#c7a87e] bg-[#c7a87e]/10' : 'border-[#3e2b20] hover:border-[#8a725b]'}`}
                    >
                        <input {...getInputProps()} />
                        {file ? (
                            <div className="flex flex-col items-center text-[#c7a87e]">
                                <FileText size={48} className="mb-2" />
                                <p className="font-bold">{file.name}</p>
                                <p className="text-xs text-[#8a725b]">{Math.round(file.size / 1024)} KB</p>
                            </div>
                        ) : (
                            <div className="text-[#8a725b]">
                                <Upload size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Drag & drop files here, or click to select</p>
                                <p className="text-xs mt-2">PDF, Word, Excel, Markdown, etc.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-[#8a725b] mb-1">External URL</label>
                        <input
                            type="url"
                            value={externalUrl}
                            onChange={e => setExternalUrl(e.target.value)}
                            className="w-full bg-[#150f0a] border border-[#3e2b20] text-[#c7a87e] px-4 py-2 rounded focus:border-[#c7a87e] outline-none"
                            placeholder="https://..."
                        />
                    </div>
                )}

                <div>
                    <label className="block text-xs uppercase tracking-widest text-[#8a725b] mb-1">Description / Notes (Optional)</label>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="w-full bg-[#150f0a] border border-[#3e2b20] text-[#e8dac0] px-4 py-2 rounded focus:border-[#c7a87e] outline-none h-24"
                    />
                </div>
            </div>

            {/* Status Message */}
            {status.message && (
                <div className={`flex items-center gap-2 text-sm ${status.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                    {status.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                    {status.message}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isUploading}
                className="w-full py-3 bg-[#c7a87e] text-[#1a110d] font-bold uppercase tracking-widest hover:bg-[#d4bca0] transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isUploading ? 'Registering...' : 'Registered to Shelf'}
            </button>
        </form>
    )
}
