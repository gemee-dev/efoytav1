import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { slugify } from '@/lib/utils'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (session?.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const hotels = await prisma.hotel.findMany({
    include: { _count: { select: { rooms: true, bookings: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const result = await Promise.all(hotels.map(async (h) => {
    const rev = await prisma.booking.aggregate({
      where: { hotelId: h.id, status: 'confirmed' },
      _sum: { total: true },
    })
    return { ...h, revenue: rev._sum.total || 0, roomCount: h._count.rooms, bookingCount: h._count.bookings }
  }))

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (session?.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { name, city, adminEmail, adminName, plan } = body

  if (!name || !city || !adminEmail) {
    return NextResponse.json({ error: 'name, city, adminEmail required' }, { status: 400 })
  }

  let slug = slugify(name)
  const existing = await prisma.hotel.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now()}`

  const hotel = await prisma.hotel.create({
    data: {
      slug, name, city,
      plan: plan || 'Starter',
      tagline: `Welcome to ${name}`,
      subscriptionStatus: 'trial',
      subscriptionEnds: new Date(Date.now() + 30 * 86400000),
      emoji: '🏨', stars: '★★★',
    },
  })

  const emailExists = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!emailExists) {
    const tempPassword = 'hotel123'
    await prisma.user.create({
      data: {
        hotelId: hotel.id,
        name: adminName || 'Hotel Admin',
        email: adminEmail,
        passwordHash: await bcrypt.hash(tempPassword, 12),
        role: 'hotel_admin',
      },
    })
    return NextResponse.json({ id: hotel.id, slug, tempPassword }, { status: 201 })
  }

  return NextResponse.json({ id: hotel.id, slug, tempPassword: 'existing account used' }, { status: 201 })
}
