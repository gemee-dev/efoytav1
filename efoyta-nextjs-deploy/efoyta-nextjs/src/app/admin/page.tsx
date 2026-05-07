import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/shared/Navbar'
import AdminClient from './AdminClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Hotel Admin Dashboard | efoyta' }

export default async function AdminPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role === 'super_admin') redirect('/superadmin')
  if (session.role !== 'hotel_admin') redirect('/login')

  return (
    <>
      <Navbar />
      <main className="pt-nav">
        <AdminClient initialUser={session} />
      </main>
    </>
  )
}
