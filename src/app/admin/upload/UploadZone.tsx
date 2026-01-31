'use client'

import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { createDocument, getCategories } from '@/app/lib/actions'
import { Upload, Link as LinkIcon, FileText, CheckCircle, AlertCircle } from 'lucide-react'

import { useRouter } from 'next/navigation'

export default function UploadZone() {
    const router = useRouter()
    // ...
    const [mode, setMode] = useState<'file' | 'url' | 'text'>('file')
    const [file, setFile] = useState<File | null>(null)
    const [title, setTitle] = useState('')

    // Category Logic
    const [categories, setCategories] = useState<string[]>([])
    const [selectedCategory, setSelectedCategory] = useState('')
    const [newCategoryInput, setNewCategoryInput] = useState('')
    const [isNewCategory, setIsNewCategory] = useState(false)

    const [externalUrl, setExternalUrl] = useState('')
    const [requiredRole, setRequiredRole] = useState('VIEWER')
    const [content, setContent] = useState('') // Description/Markdown
    const [textType, setTextType] = useState('markdown') // markdown | html | text

    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })
    const [isUploading, setIsUploading] = useState(false)

    // Fetch categories on mount
    useEffect(() => {
        getCategories().then(cats => {
            setCategories(cats)
            if (cats.length > 0) setSelectedCategory(cats[0])
            else setIsNewCategory(true)
        })
    }, [])

    const [errorModal, setErrorModal] = useState<{ visible: boolean, message: string }>({ visible: false, message: '' })

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0])
            // Auto-fill title if empty
            if (!title) {
                setTitle(acceptedFiles[0].name.split('.').slice(0, -1).join('.'))
            }
        }
    }, [title])

    const onDropRejected = useCallback((rejections: any[]) => {
        const rejection = rejections[0];
        if (rejection) {
            const error = rejection.errors[0];
            let msg = 'このファイル形式はサポートされていません。';
            if (error.code === 'file-invalid-type') {
                msg = `「${rejection.file.name}」はアップロードできません。\nプレビュー可能な形式（PDF, 画像, 動画, テキスト等）のみ対応しています。\nOfficeファイルや圧縮ファイルは除外されます。`;
            }
            setErrorModal({ visible: true, message: msg });
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        multiple: false,
        accept: {
            'application/pdf': ['.pdf'],
            'text/*': ['.txt', '.md', '.markdown', '.html', '.htm', '.json', '.xml', '.log'],
            'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
            'video/*': ['.mp4', '.webm', '.mov'],
            'audio/*': ['.mp3', '.wav', '.ogg']
        }
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUploading(true)
        setStatus({ type: null, message: '' })

        const finalCategory = isNewCategory ? newCategoryInput : selectedCategory

        if (!finalCategory.trim()) {
            setStatus({ type: 'error', message: 'カテゴリーを入力してください' })
            setIsUploading(false)
            return
        }

        const formData = new FormData()
        formData.append('title', title)
        formData.append('category', finalCategory)
        formData.append('requiredRole', requiredRole)
        formData.append('content', content)

        if (mode === 'file') {
            if (!file) {
                setStatus({ type: 'error', message: 'ファイルを選択してください' })
                setIsUploading(false)
                return
            }
            formData.append('file', file)
            // fileType is auto-detected on server
        } else if (mode === 'url') {
            if (!externalUrl) {
                setStatus({ type: 'error', message: 'URLを入力してください' })
                setIsUploading(false)
                return
            }
            formData.append('externalUrl', externalUrl)
            formData.append('fileType', 'url')
        } else if (mode === 'text') {
            if (!content) {
                setStatus({ type: 'error', message: 'コンテンツを入力してください' })
                setIsUploading(false)
                return
            }
            formData.append('fileType', textType) // markdown, html, or text
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
        <>
            {/* Error Popup Modal */}
            {errorModal.visible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#1e130c] border border-red-500/50 rounded-lg shadow-2xl max-w-md w-full p-6 relative transform scale-100 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setErrorModal({ visible: false, message: '' })}
                            className="absolute top-4 right-4 text-[#8a725b] hover:text-[#e8dac0]"
                        >
                            ✕
                        </button>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="bg-red-900/30 p-4 rounded-full">
                                <AlertCircle size={48} className="text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-[#e8dac0]">Upload Restricted</h3>
                            <p className="text-[#8a725b] whitespace-pre-wrap leading-relaxed">
                                {errorModal.message}
                            </p>
                            <button
                                onClick={() => setErrorModal({ visible: false, message: '' })}
                                className="px-6 py-2 bg-red-900/50 text-red-200 border border-red-500/30 rounded hover:bg-red-900/70 transition-colors uppercase tracking-wider text-sm font-bold"
                            >
                                Acknowledge
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 bg-[#1e130c] p-8 rounded-lg border border-[#3e2b20] shadow-2xl relative z-10">

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
                    <button
                        type="button"
                        onClick={() => setMode('text')}
                        className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${mode === 'text' ? 'bg-[#c7a87e] text-[#1a110d]' : 'text-[#8a725b] hover:text-[#c7a87e]'}`}
                    >
                        <FileText size={18} /> Text / Markdown
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
                            {!isNewCategory && categories.length > 0 ? (
                                <div className="flex gap-2">
                                    <select
                                        value={selectedCategory}
                                        onChange={e => {
                                            if (e.target.value === '__NEW__') setIsNewCategory(true)
                                            else setSelectedCategory(e.target.value)
                                        }}
                                        className="w-full bg-[#150f0a] border border-[#3e2b20] text-[#e8dac0] px-4 py-2 rounded focus:border-[#c7a87e] outline-none"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                        <option value="__NEW__" className="text-[#c7a87e] font-bold">+ Create New...</option>
                                    </select>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newCategoryInput}
                                        onChange={e => setNewCategoryInput(e.target.value)}
                                        className="w-full bg-[#150f0a] border border-[#3e2b20] text-[#e8dac0] px-4 py-2 rounded focus:border-[#c7a87e] outline-none animate-pulse-border"
                                        placeholder="Enter new category name..."
                                        autoFocus
                                    />
                                    {categories.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setIsNewCategory(false)}
                                            className="px-3 py-1 text-xs text-[#8a725b] hover:text-[#c7a87e] border border-[#3e2b20] rounded"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            )}
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

                    {/* Dropzone or URL Input or Text Options */}
                    {mode === 'file' ? (
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors outline-none
                                ${isDragActive ? 'border-[#c7a87e] bg-[#c7a87e]/10' : 'border-[#3e2b20] hover:border-[#8a725b]'}
                            `}
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
                                    <p>Drag & drop allowed files here, or click to select</p>
                                    <p className="text-xs mt-2 opacity-60">
                                        Supports: PDF, Images, Video/Audio, Text, Markdown
                                        <br />
                                        <span className="text-red-400">(Office, Zip, Exe not allowed)</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : mode === 'url' ? (
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
                    ) : (
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-[#8a725b] mb-1">Format Type</label>
                            <select
                                value={textType}
                                onChange={e => setTextType(e.target.value)}
                                className="w-full bg-[#150f0a] border border-[#3e2b20] text-[#c7a87e] px-4 py-2 rounded focus:border-[#c7a87e] outline-none"
                            >
                                <option value="markdown">Markdown</option>
                                <option value="html">HTML</option>
                                <option value="text">Plain Text</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-[#8a725b] mb-1">
                            {mode === 'text' ? 'Content (Required)' : 'Description / Notes (Optional)'}
                        </label>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            className={`w-full bg-[#150f0a] border border-[#3e2b20] text-[#e8dac0] px-4 py-2 rounded focus:border-[#c7a87e] outline-none ${mode === 'text' ? 'h-64 font-mono text-sm' : 'h-24'}`}
                            placeholder={mode === 'text' ? '# Write your markdown here...' : 'Optional description...'}
                            required={mode === 'text'}
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
        </>
    )
}
