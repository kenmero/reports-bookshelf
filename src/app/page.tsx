import { getDocuments } from '@/app/lib/actions'
import { auth } from '@/auth'
import Bookshelf from '@/components/Bookshelf'

export default async function Home() {
  const session = await auth()
  const documents = await getDocuments()
  return <Bookshelf documents={documents} user={session?.user} />
}
