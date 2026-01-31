'use server'
import { signIn, signOut } from '@/auth'
import { AuthError } from 'next-auth'
import { prisma } from './prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import bcrypt from 'bcryptjs'
import path from 'path'
import { storage } from '@/lib/storage'

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        console.log("Attempting sign in...")

        // Check role to determine redirect URL
        const username = formData.get('username') as string
        const user = await prisma.user.findUnique({ where: { username } })

        let redirectTo = '/admin/upload';
        if (user?.role === 'VIEWER') {
            redirectTo = '/';
        }

        await signIn('credentials', {
            ...Object.fromEntries(formData),
            redirectTo,
        })
        console.log("Sign in call finished (should have thrown redirect)")
    } catch (error) {
        if (error instanceof AuthError) {
            console.error("AuthError:", error.type)
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.'
                default:
                    return 'Something went wrong.'
            }
        }
        console.log("Non-AuthError thrown (likely redirect):", error)
        throw error
    }
}

export async function logout() {
    await signOut({ redirectTo: '/login' })
}

const ROLE_LEVELS = {
    'VIEWER': 1,
    'EDITOR': 2,
    'ADMIN': 3
} as const

function getRoleLevel(role: string): number {
    return ROLE_LEVELS[role as keyof typeof ROLE_LEVELS] || 1 // Default to VIEWER level
}

export async function createDocument(formData: FormData) {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
        throw new Error('Unauthorized')
    }

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const categoryName = formData.get('category') as string || 'Default'
    const role = formData.get('requiredRole') as string || 'VIEWER'
    const externalUrl = formData.get('externalUrl') as string

    // File Handling
    const file = formData.get('file') as File | null
    let filePath = null
    let fileType = formData.get('fileType') as string
    let fileSize = 0

    if (file && file.size > 0) {
        // Use Storage Abstraction
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const filename = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g, '_')

        filePath = await storage.upload(file, filename)
        fileSize = file.size

        // Auto-detect fileType if generic
        if (!fileType || fileType === 'other') {
            const ext = path.extname(filename).toLowerCase()
            if (ext === '.pdf') fileType = 'pdf'
            else if (['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.csv'].includes(ext)) fileType = 'office'
            else if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) fileType = 'image'
            else if (['.mp4', '.webm', '.mov'].includes(ext)) fileType = 'video'
            else if (['.mp3', '.wav', '.ogg'].includes(ext)) fileType = 'audio'
            else if (['.txt', '.log', '.json', '.xml', '.html', '.htm'].includes(ext)) fileType = 'text'
            else if (['.md', '.markdown'].includes(ext)) fileType = 'markdown'
            else fileType = 'file'
        }
    } else if (externalUrl) {
        fileType = 'url'
    }

    // Find or create category
    const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName }
    })

    await prisma.document.create({
        data: {
            title,
            content: content || '', // Content allowed to be empty used for description if binary
            fileType,
            filePath,
            externalUrl,
            fileSize,
            requiredRole: role,
            categoryId: category.id
        }
    })

    revalidatePath('/')
    // redirect('/') // Removed to allow client-side handling
    return { success: true }
}

export async function getDocuments() {
    const session = await auth()
    // If not logged in, return nothing (Middleware blocks this anyway mainly)
    if (!session?.user) return []

    const userLevel = getRoleLevel(session.user.role || 'VIEWER')

    const documents = await prisma.document.findMany({
        include: { category: true },
        orderBy: { updatedAt: 'desc' }
    })

    // Filter by Role Level
    // Show document if UserLevel >= DocumentRequiredLevel
    // Default requiredRole is 'VIEWER' (1), so everyone sees them.
    return documents.filter(doc => userLevel >= getRoleLevel(doc.requiredRole))
}

export async function getDocumentById(id: string) {
    const session = await auth()
    if (!session?.user) return null

    const doc = await prisma.document.findUnique({
        where: { id },
        include: { category: true }
    })

    if (!doc) return null

    // RBAC Check
    const userLevel = getRoleLevel(session.user.role || 'VIEWER')
    const docLevel = getRoleLevel(doc.requiredRole)

    if (userLevel < docLevel) {
        // Return null to simulate "Not Found" or handle as needed
        return null
    }

    return doc
}

export async function deleteDocument(id: string) {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
        throw new Error('Unauthorized')
    }

    try {
        // Fetch doc to delete file
        const doc = await prisma.document.findUnique({ where: { id } })
        if (doc?.filePath) {
            await storage.delete(doc.filePath).catch(err => console.error("File delete error:", err))
        }

        await prisma.document.delete({
            where: { id }
        })
        revalidatePath('/admin/documents')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Delete error:', error)
        return { success: false, error: 'ドキュメントの削除に失敗しました' }
    }
}

export async function updateDocument(id: string, formData: FormData) {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
        throw new Error('Unauthorized')
    }

    const title = formData.get('title') as string
    const categoryId = formData.get('categoryId') as string
    const content = formData.get('content') as string

    if (!title || !categoryId || !content) {
        return { success: false, error: '全ての項目を入力してください' }
    }

    try {
        await prisma.document.update({
            where: { id },
            data: {
                title,
                categoryId,
                content,
                updatedAt: new Date()
            }
        })
        revalidatePath('/admin/documents')
        revalidatePath('/')
        revalidatePath(`/doc/${id}`)
        return { success: true }
    } catch (error) {
        console.error('Update error:', error)
        return { success: false, error: 'ドキュメントの更新に失敗しました' }
    }
}


export async function getUsers() {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    return await prisma.user.findMany({
        select: { id: true, username: true, role: true, createdAt: true }
    })
}

export async function getUserById(id: string) {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    return await prisma.user.findUnique({
        where: { id },
        select: { id: true, username: true, role: true }
    })
}

export async function createUser(formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string

    if (!username || !password || !role) {
        return { success: false, error: '全ての項目を入力してください' }
    }

    const existingUser = await prisma.user.findUnique({ where: { username } })
    if (existingUser) {
        return { success: false, error: 'ユーザー名は既に使用されています' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role
            }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error('Create user error:', error)
        return { success: false, error: 'ユーザーの作成に失敗しました' }
    }
}

export async function updateUser(id: string, formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    const username = formData.get('username') as string
    const role = formData.get('role') as string
    const password = formData.get('password') as string

    if (!username || !role) {
        return { success: false, error: '必須項目が不足しています' }
    }

    const updateData: any = { username, role }
    if (password) {
        updateData.password = await bcrypt.hash(password, 10)
    }

    try {
        await prisma.user.update({
            where: { id },
            data: updateData
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error('Update user error:', error)
        return { success: false, error: 'ユーザーの更新に失敗しました' }
    }
}

export async function deleteUser(id: string) {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    const targetUser = await prisma.user.findUnique({ where: { id } })

    // Debug logging removed for Vercel compatibility

    console.log('[deleteUser] Session user:', session.user)
    console.log('[deleteUser] Target user:', targetUser)

    if (targetUser?.username === session.user.name) {
        return { success: false, error: '自分自身を削除することはできません' }
    }

    try {
        await prisma.user.delete({
            where: { id }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error('Delete user error:', error)
        return { success: false, error: 'ユーザーの削除に失敗しました' }
    }
}
