import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const hotel = await prisma.hotel.findUnique({ where: { slug: params.slug }, select: { id: true } })
  if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
  const rooms = await prisma.room.findMany({ where: { hotelId: hotel.id }, orderBy: { price: 'asc' } })
  return NextResponse.json(rooms)
}
