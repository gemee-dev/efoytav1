import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (session?.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [total, active, trial, expired, bookings, revenue, rooms] = await Promise.all([
    prisma.hotel.count(),
    prisma.hotel.count({ where: { subscriptionStatus: 'active' } }),
    prisma.hotel.count({ where: { subscriptionStatus: 'trial' } }),
    prisma.hotel.count({ where: { subscriptionStatus: 'expired' } }),
    prisma.booking.count(),
    prisma.booking.aggregate({ where: { status: 'confirmed' }, _sum: { total: true } }),
    prisma.room.count(),
  ])

  return NextResponse.json({
    totalHotels: total, activeHotels: active, trialHotels: trial, expiredHotels: expired,
    totalBookings: bookings, totalRevenue: revenue._sum.total || 0, totalRooms: rooms,
  })
}
