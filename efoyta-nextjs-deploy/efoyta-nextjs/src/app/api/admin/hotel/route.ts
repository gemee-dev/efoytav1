import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !['hotel_admin', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const hotelId = session.hotelId!
  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } })
  if (!hotel) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(hotel)
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !['hotel_admin', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const hotelId = session.hotelId!
  const body = await req.json()
  const hotel = await prisma.hotel.update({
    where: { id: hotelId },
    data: {
      name: body.name,
      tagline: body.tagline,
      about: body.about,
      phone: body.phone,
      email: body.email,
      address: body.address,
      city: body.city,
    },
  })
  return NextResponse.json(hotel)
}
