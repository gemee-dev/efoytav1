import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !['hotel_admin', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const hotelId = session.hotelId!
  const rooms = await prisma.room.findMany({ where: { hotelId }, orderBy: { price: 'asc' } })
  return NextResponse.json(rooms)
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !['hotel_admin', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const hotelId = session.hotelId!
  const body = await req.json()

  if (!body.name || !body.price) {
    return NextResponse.json({ error: 'name and price are required' }, { status: 400 })
  }

  const room = await prisma.room.create({
    data: {
      hotelId,
      name: String(body.name),
      type: body.type || 'Double',
      capacity: Number(body.capacity) || 2,
      price: Number(body.price),
      description: body.description || '',
    },
  })
  return NextResponse.json(room, { status: 201 })
}
