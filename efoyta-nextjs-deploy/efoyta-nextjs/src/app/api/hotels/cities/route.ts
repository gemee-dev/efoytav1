import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const hotels = await prisma.hotel.findMany({
    where: { subscriptionStatus: { not: 'expired' } },
    select: { city: true },
    distinct: ['city'],
    orderBy: { city: 'asc' },
  })
  return NextResponse.json(hotels.map(h => h.city))
}
