import { getUserById } from '@/app/lib/actions'
import { notFound } from 'next/navigation'
import EditUserForm from './EditUserForm'

export default async function EditUserPage({ params }: { params: { id: string } }) {
    const user = await getUserById(params.id)

    if (!user) {
        notFound()
    }

    return <EditUserForm user={user} />
}
