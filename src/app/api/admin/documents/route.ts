import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
    try {
        const documents = await prisma.document.findMany({
            include: {
                category: true
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })
        return NextResponse.json(documents)
    } catch (error) {
        console.error('Error fetching documents:', error)
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }
}
