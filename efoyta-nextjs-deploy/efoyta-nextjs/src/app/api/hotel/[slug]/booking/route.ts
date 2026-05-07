import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const hotel = await prisma.hotel.findUnique({ where: { slug: params.slug } })
    if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
    if (hotel.subscriptionStatus === 'expired') {
      return NextResponse.json({ error: 'Hotel not accepting bookings (subscription expired)' }, { status: 402 })
    }

    const body = await req.json()
    const { roomId, guestName, guestEmail, guestPhone, checkIn, checkOut } = body

    if (!roomId || !guestName || !guestEmail || !checkIn || !checkOut) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const room = await prisma.room.findFirst({ where: { id: roomId, hotelId: hotel.id } })
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    if (!room.available) return NextResponse.json({ error: 'Room is not available' }, { status: 400 })

    const ci = new Date(checkIn)
    const co = new Date(checkOut)
    if (isNaN(ci.getTime()) || isNaN(co.getTime()) || co <= ci) {
      return NextResponse.json({ error: 'Invalid dates' }, { status: 400 })
    }

    const nights = Math.max(1, Math.round((co.getTime() - ci.getTime()) / 86400000))
    const total = nights * room.price

    const booking = await prisma.booking.create({
      data: { hotelId: hotel.id, roomId, guestName, guestEmail, guestPhone: guestPhone || '', checkIn: ci, checkOut: co, nights, total, status: 'pending' },
    })

    return NextResponse.json({ id: booking.id, nights, total, status: 'pending' }, { status: 201 })
  } catch (err) {
    console.error('[BOOKING]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
