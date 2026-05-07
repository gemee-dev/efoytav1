import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city') || ''
  const q = req.nextUrl.searchParams.get('q') || ''

  const hotels = await prisma.hotel.findMany({
    where: {
      subscriptionStatus: { not: 'expired' },
      ...(city ? { city } : {}),
      ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { city: { contains: q, mode: 'insensitive' } }] } : {}),
    },
    include: {
      _count: { select: { rooms: true } },
      rooms: { where: { available: true }, select: { price: true }, orderBy: { price: 'asc' }, take: 1 },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(hotels.map(h => ({
    id: h.id, slug: h.slug, name: h.name, city: h.city,
    tagline: h.tagline, emoji: h.emoji, stars: h.stars,
    plan: h.plan, subscriptionStatus: h.subscriptionStatus,
    roomCount: h._count.rooms,
    minPrice: h.rooms[0]?.price ?? 0,
  })))
}
