import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const hotel = await prisma.hotel.findUnique({
    where: { slug: params.slug },
    select: { id:true, slug:true, name:true, city:true, tagline:true, about:true, phone:true, email:true, address:true, emoji:true, stars:true, plan:true, subscriptionStatus:true, subscriptionEnds:true, createdAt:true },
  })
  if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
  return NextResponse.json(hotel)
}
