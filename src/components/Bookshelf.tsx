'use client'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { logout } from '@/app/lib/actions'

interface Document {
    id: string
    title: string
    fileType: string
    content: string | null
    filePath?: string | null
    externalUrl?: string | null
    fileSize?: number | null
    requiredRole: string
    categoryId: string
    category: {
        name: string
    }
}

interface Props {
    documents: Document[]
    user?: { name?: string | null, role?: string } | null
}

const SPINE_COLORS = [
    'bg-[#4a1c1c] border-[#381515]', // Red-ish
    'bg-[#1e2a4a] border-[#151e33]', // Blue-ish
    'bg-[#1c3a25] border-[#122618]', // Green-ish
    'bg-[#3a251c] border-[#291a13]', // Brown-ish
    'bg-[#2d2436] border-[#1f1926]', // Purple-ish
    'bg-[#2c2c2c] border-[#1f1f1f]', // Black-ish
    'bg-[#3d3832] border-[#2b2723]', // Grey-ish
]

export default function Bookshelf({ documents, user }: Props) {
    const [tooltip, setTooltip] = useState<{ title: string, x: number, y: number, visible: boolean }>({
        title: '', x: 0, y: 0, visible: false
    });

    // Group by Category
    const grouped = useMemo(() => {
        return documents.reduce((acc, doc) => {
            const cat = doc.category.name
            if (!acc[cat]) acc[cat] = []
            acc[cat].push(doc)
            return acc
        }, {} as Record<string, Document[]>)
    }, [documents])

    const getBookStyle = (id: string) => {
        const charCode = id.charCodeAt(id.length - 1);
        const colorIndex = charCode % SPINE_COLORS.length;
        return {
            color: SPINE_COLORS[colorIndex],
            height: 'h-44 md:h-56', // Responsive height
            width: ['w-12 md:w-14', 'w-14 md:w-16', 'w-13 md:w-15'][charCode % 3] // Proportional width
        };
    }

    const handleMouseEnter = (e: React.MouseEvent, title: string) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            title,
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
            visible: true
        });
    }

    const handleMouseLeave = () => {
        setTooltip(prev => ({ ...prev, visible: false }));
    }

    return (
        <div className="min-h-screen bg-[#150f0a] text-[#e8dac0] p-4 md:p-8 relative overflow-x-hidden font-serif">
            {/* Background Texture */}
            <div className="fixed inset-0 opacity-30 pointer-events-none" style={{
                backgroundImage: `url("https://www.transparenttextures.com/patterns/dark-wood.png")`,
                backgroundSize: '300px'
            }}></div>

            {/* Vertical wood paneling lines */}
            <div className="fixed inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: 'repeating-linear-gradient(90deg, transparent 0, transparent 100px, #000 100px, #000 102px)'
            }}></div>

            {/* Fixed Tooltip Portal */}
            {tooltip.visible && (
                <div
                    className="fixed z-[9999] pointer-events-none bg-[#0a0a0a] border border-[#333] px-3 py-1.5 rounded shadow-2xl transition-opacity duration-200"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <p className="text-[#e2e2e2] text-xs font-bold leading-tight whitespace-nowrap">{tooltip.title}</p>
                </div>
            )}

            <header className="relative z-10 mb-10 md:mb-16 flex flex-col md:flex-row justify-between items-center bg-[#241710] p-6 rounded-md shadow-2xl border border-[#3e2b20] gap-6 md:gap-0">
                <h1 className="text-2xl md:text-4xl text-[#c7a87e] font-bold tracking-widest uppercase flex flex-col items-center md:items-start text-center md:text-left">
                    <span>Bibliotheca</span>
                    <span className="text-[10px] md:text-xs text-[#8a725b] tracking-[0.5em] mt-1 font-sans">Reports Archive</span>
                </h1>
                {user ? (
                    user.role === 'VIEWER' ? (
                        <button
                            onClick={() => logout()}
                            className="px-5 py-2 bg-[#2a1b0e] border border-[#c7a87e] text-[#e8dac0] hover:bg-[#3e2b20] transition-all text-sm tracking-wider uppercase shadow-md flex items-center gap-2"
                        >
                            Sign Out
                        </button>
                    ) : (
                        <Link href="/admin/upload" className="px-5 py-2 bg-[#2a1b0e] border border-[#c7a87e] text-[#e8dac0] hover:bg-[#3e2b20] transition-all text-sm tracking-wider uppercase shadow-md flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Admin Panel
                        </Link>
                    )
                ) : (
                    <Link href="/login" className="px-5 py-2 bg-[#1a110d] border border-[#5c4030] text-[#a68a6d] hover:text-[#e8dac0] hover:border-[#c7a87e] transition-all text-sm tracking-wider uppercase">
                        Staff Entrance
                    </Link>
                )}
            </header>

            <div className="relative z-10 space-y-12 md:space-y-20 max-w-7xl mx-auto">
                {Object.entries(grouped).map(([category, docs]) => (
                    <div key={category} className="relative">
                        {/* Brass Plate Label */}
                        <div className="absolute -top-6 md:-top-7 left-4 md:left-8 bg-gradient-to-b from-[#b88a44] to-[#7a5923] text-black px-4 md:px-5 py-1 rounded-sm shadow-lg border border-[#ffd700]/30 z-20">
                            <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#2a1b0e] shadow-sm">{category}</span>
                            {/* Screws */}
                            <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-[#4d3612] rounded-full opacity-60"></div>
                            <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-[#4d3612] rounded-full opacity-60"></div>
                        </div>

                        {/* The Shelf */}
                        <div className="relative pt-7">
                            {/* Books Container */}
                            <div className="flex items-end gap-1 px-4 md:px-8 pb-0 pt-8 overflow-x-auto min-h-[240px] md:min-h-[280px] scrollbar-hide">
                                {docs.map(doc => {
                                    const style = getBookStyle(doc.id);
                                    const fontSize = Math.max(11, Math.min(18, 240 / doc.title.length));

                                    return (
                                        <Link
                                            key={doc.id}
                                            href={`/doc/${doc.id}`}
                                            className="group relative transition-transform hover:-translate-y-4 hover:z-50 shrink-0"
                                            onMouseEnter={(e) => handleMouseEnter(e, doc.title)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            {/* Book Body */}
                                            <div className={`
                                    ${style.width} ${style.height}
                                    ${style.color}
                                    relative rounded-sm shadow-xl shadow-black/80
                                    flex flex-col items-center py-3
                                    transition-all duration-300
                                    border-r border-white/5 border-l border-black/30
                                    group-hover:shadow-2xl
                                `}>
                                                {/* Spine Texture Details */}
                                                <div className="w-full h-full absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]"></div>

                                                {/* Top Gold bands */}
                                                <div className="w-full space-y-0.5 mt-2 relative z-10">
                                                    <div className="h-[2px] w-full bg-[#c7a87e] opacity-70 shadow-sm"></div>
                                                    <div className="h-[1px] w-full bg-[#c7a87e] opacity-50"></div>
                                                </div>

                                                {/* Title Area - Vertical Writing */}
                                                <div className="flex-1 flex items-center justify-center w-full py-3 text-[#dacabba0] font-bold tracking-wider leading-tight z-10 select-none overflow-hidden"
                                                    style={{
                                                        writingMode: 'vertical-rl',
                                                        textOrientation: 'mixed',
                                                        fontSize: `${fontSize}px`
                                                    }}>
                                                    <span className="drop-shadow-md opacity-90">
                                                        {doc.title}
                                                    </span>
                                                </div>

                                                {/* Bottom Gold bands & Icon */}
                                                <div className="w-full space-y-1.5 mb-2 flex flex-col items-center relative z-10">
                                                    <span className="text-[8px] text-[#c7a87e] opacity-60 font-mono tracking-tighter">
                                                        {doc.fileType.toUpperCase()}
                                                    </span>
                                                    <div className="w-full space-y-0.5">
                                                        <div className="h-[1px] w-full bg-[#c7a87e] opacity-50"></div>
                                                        <div className="h-[2px] w-full bg-[#c7a87e] opacity-70 shadow-sm"></div>
                                                    </div>
                                                </div>

                                                {/* Role Badge (if restricted) */}
                                                {doc.requiredRole !== 'VIEWER' && (
                                                    <div className="absolute top-2 right-2 z-30 bg-red-900/80 text-white text-[9px] px-1.5 py-0.5 rounded border border-red-500/50 shadow-sm font-sans tracking-widest uppercase">
                                                        {doc.requiredRole === 'ADMIN' ? 'Admin' : 'Editor'}
                                                    </div>
                                                )}

                                                {/* External Link Icon */}
                                                {(doc.fileType === 'url' || doc.externalUrl) && (
                                                    <div className="absolute top-2 left-2 z-30 text-[#c7a87e] opacity-80">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                                    </div>
                                                )}

                                                {/* Lighting reflection overlay */}
                                                <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-r from-white/10 to-transparent pointer-events-none z-20"></div>
                                                <div className="absolute inset-y-0 right-0 w-0.5 bg-gradient-to-l from-black/40 to-transparent pointer-events-none z-20"></div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>

                            {/* The Wooden Plank (Shelf Surface) */}
                            <div className="h-7 w-full bg-[#2a1b0e] relative shadow-[0_6px_18px_rgba(0,0,0,0.8)] border-t border-[#3e2b20]">
                                {/* Shelf thickness side view */}
                                <div className="absolute top-full left-0 right-0 h-3 bg-[#1a1109]"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {documents.length === 0 && (
                <div className="text-center py-20 text-[#8a725b] font-serif text-2xl relative z-10">
                    The archive is currently empty.
                </div>
            )}
        </div>
    )
}
