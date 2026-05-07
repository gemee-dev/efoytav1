import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !['hotel_admin', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const hotelId = session.hotelId
  if (!hotelId) return NextResponse.json({ error: 'No hotel assigned' }, { status: 400 })

  const [hotel, roomsTotal, roomsAvail, bkTotal, bkPending, bkConfirmed, revenueAgg, menuCount, recentBookings] =
    await Promise.all([
      prisma.hotel.findUnique({ where: { id: hotelId } }),
      prisma.room.count({ where: { hotelId } }),
      prisma.room.count({ where: { hotelId, available: true } }),
      prisma.booking.count({ where: { hotelId } }),
      prisma.booking.count({ where: { hotelId, status: 'pending' } }),
      prisma.booking.count({ where: { hotelId, status: 'confirmed' } }),
      prisma.booking.aggregate({ where: { hotelId, status: 'confirmed' }, _sum: { total: true } }),
      prisma.menuItem.count({ where: { hotelId } }),
      prisma.booking.findMany({
        where: { hotelId },
        include: { room: { select: { name: true, price: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

  return NextResponse.json({
    hotel,
    stats: {
      roomsTotal, roomsAvailable: roomsAvail,
      bookingsTotal: bkTotal, bookingsPending: bkPending,
      bookingsConfirmed: bkConfirmed,
      revenue: revenueAgg._sum.total || 0,
      menuItems: menuCount,
    },
    recentBookings,
  })
}
