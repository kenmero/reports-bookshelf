import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { signOut } from '@/auth' // This import is still needed for the sign-out form
import { LayoutDashboard, Upload, Users, LogOut, BookOpen } from 'lucide-react' // These icons are still used in the original structure

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/login')
    }

    return (
        <div className="flex min-h-screen bg-custom-midnight text-custom-text">
            {/* Sidebar */}
            <aside className="w-64 bg-custom-deep border-r border-slate-700 flex flex-col">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="text-custom-accent" /> Admin Portal
                    </h2>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin/upload" className="flex items-center gap-3 px-4 py-3 rounded text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                        <Upload size={20} /> Upload Document
                    </Link>
                    {/* New link for document management */}
                    <Link href="/admin/documents" className="flex items-center gap-3 px-4 py-3 rounded text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                        <BookOpen size={20} /> Document Management
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                        <Users size={20} /> User Management
                    </Link>
                    <div className="border-t border-slate-700 my-4"></div>
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                        <LayoutDashboard size={20} /> View Public Site
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <form action={async () => {
                        'use server'
                        await signOut()
                    }}>
                        <button type="submit" className="flex items-center gap-3 px-4 py-3 w-full text-left rounded text-red-400 hover:bg-red-900/20 transition-colors">
                            <LogOut size={20} /> Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
