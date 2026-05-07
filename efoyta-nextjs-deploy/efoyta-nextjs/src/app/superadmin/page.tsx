import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/shared/Navbar'
import SuperAdminClient from './SuperAdminClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Super Admin — Platform Overview | efoyta' }

export default async function SuperAdminPage() {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') redirect('/login')

  const hotels = await prisma.hotel.findMany({
    include: { _count: { select: { rooms: true, bookings: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const [total, active, trial, expired, bookings, revenue, rooms] = await Promise.all([
    prisma.hotel.count(),
    prisma.hotel.count({ where: { subscriptionStatus: 'active' } }),
    prisma.hotel.count({ where: { subscriptionStatus: 'trial' } }),
    prisma.hotel.count({ where: { subscriptionStatus: 'expired' } }),
    prisma.booking.count(),
    prisma.booking.aggregate({ where: { status: 'confirmed' }, _sum: { total: true } }),
    prisma.room.count(),
  ])

  const stats = {
    totalHotels: total, activeHotels: active, trialHotels: trial, expiredHotels: expired,
    totalBookings: bookings, totalRevenue: revenue._sum.total || 0, totalRooms: rooms,
  }

  const hotelData = hotels.map(h => ({
    id: h.id, slug: h.slug, name: h.name, city: h.city,
    emoji: h.emoji, stars: h.stars, plan: h.plan,
    subscriptionStatus: h.subscriptionStatus,
    subscriptionEnds: h.subscriptionEnds ? h.subscriptionEnds.toISOString().slice(0, 10) : null,
    roomCount: h._count.rooms,
    bookingCount: h._count.bookings,
  }))

  return (
    <>
      <Navbar />
      <main className="pt-nav">
        <SuperAdminClient hotels={hotelData} stats={stats} />
      </main>
    </>
  )
}
