import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session || !['hotel_admin', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const hotelId = session.hotelId!
  const existing = await prisma.booking.findFirst({ where: { id: params.id, hotelId } })
  if (!existing) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const { status } = await req.json()
  if (!['confirmed', 'rejected', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }
  const updated = await prisma.booking.update({ where: { id: params.id }, data: { status } })
  return NextResponse.json(updated)
}
