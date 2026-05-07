import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session || !['hotel_admin', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const hotelId = session.hotelId!
  const existing = await prisma.room.findFirst({ where: { id: params.id, hotelId } })
  if (!existing) return NextResponse.json({ error: 'Room not found' }, { status: 404 })

  const body = await req.json()
  const updated = await prisma.room.update({
    where: { id: params.id },
    data: {
      name: body.name ?? existing.name,
      type: body.type ?? existing.type,
      capacity: body.capacity != null ? Number(body.capacity) : existing.capacity,
      price: body.price != null ? Number(body.price) : existing.price,
      available: body.available != null ? Boolean(body.available) : existing.available,
      description: body.description ?? existing.description,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session || !['hotel_admin', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const hotelId = session.hotelId!
  const existing = await prisma.room.findFirst({ where: { id: params.id, hotelId } })
  if (!existing) return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  await prisma.room.delete({ where: { id: params.id } })
  return NextResponse.json({ deleted: params.id })
}
