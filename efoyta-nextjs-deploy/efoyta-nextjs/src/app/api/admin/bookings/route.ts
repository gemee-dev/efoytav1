import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !['hotel_admin', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const hotelId = session.hotelId!
  const status = req.nextUrl.searchParams.get('status')

  const bookings = await prisma.booking.findMany({
    where: { hotelId, ...(status ? { status: status as any } : {}) },
    include: { room: { select: { name: true, price: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(bookings)
}
