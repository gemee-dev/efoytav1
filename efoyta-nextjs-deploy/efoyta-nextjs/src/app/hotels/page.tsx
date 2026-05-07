import { prisma } from '@/lib/prisma'
import Navbar from '@/components/shared/Navbar'
import HotelsClient from './HotelsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore Hotels in Ethiopia | efoyta',
  description: 'Discover and book hotels across Ethiopia — Jimma, Addis Ababa, Hawassa, Bahir Dar and more.',
}

export const revalidate = 60

interface PageProps {
  searchParams: { city?: string; q?: string }
}

export default async function HotelsPage({ searchParams }: PageProps) {
  const city = searchParams.city || ''
  const q = searchParams.q || ''

  const [hotels, cityRows] = await Promise.all([
    prisma.hotel.findMany({
      where: {
        subscriptionStatus: { not: 'expired' },
        ...(city ? { city } : {}),
        ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { city: { contains: q, mode: 'insensitive' } }] } : {}),
      },
      include: {
        rooms: { where: { available: true }, select: { price: true }, orderBy: { price: 'asc' }, take: 1 },
        _count: { select: { rooms: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.hotel.findMany({
      where: { subscriptionStatus: { not: 'expired' } },
      select: { city: true },
      distinct: ['city'],
      orderBy: { city: 'asc' },
    }),
  ])

  const hotelData = hotels.map(h => ({
    id: h.id,
    slug: h.slug,
    name: h.name,
    city: h.city,
    tagline: h.tagline,
    emoji: h.emoji,
    stars: h.stars,
    roomCount: h._count.rooms,
    minPrice: h.rooms[0]?.price ?? 0,
  }))

  return (
    <>
      <Navbar />
      <main className="pt-nav">
        <HotelsClient
          hotels={hotelData}
          cities={cityRows.map(c => c.city)}
          initialCity={city}
          initialQ={q}
        />
      </main>
    </>
  )
}
