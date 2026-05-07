import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const hotel = await prisma.hotel.findUnique({ where: { slug: params.slug }, select: { id: true } })
  if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
  const items = await prisma.menuItem.findMany({
    where: { hotelId: hotel.id, available: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json(items)
}
