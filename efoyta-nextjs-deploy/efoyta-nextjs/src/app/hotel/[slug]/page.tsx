import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import HotelSiteClient from './HotelSiteClient'
import type { Metadata } from 'next'

export const revalidate = 30

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const hotel = await prisma.hotel.findUnique({
    where: { slug: params.slug },
    select: { name: true, city: true, tagline: true },
  })
  if (!hotel) return { title: 'Hotel Not Found' }
  return {
    title: `${hotel.name} — ${hotel.city} | efoyta`,
    description: hotel.tagline,
  }
}

export default async function HotelPage({ params }: PageProps) {
  const hotel = await prisma.hotel.findUnique({ where: { slug: params.slug } })
  if (!hotel) notFound()

  const [rooms, menuItems] = await Promise.all([
    prisma.room.findMany({ where: { hotelId: hotel.id }, orderBy: { price: 'asc' } }),
    prisma.menuItem.findMany({
      where: { hotelId: hotel.id, available: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    }),
  ])

  return (
    <>
      <Navbar />
      <main className="pt-nav">
        <HotelSiteClient
          hotel={JSON.parse(JSON.stringify(hotel))}
          rooms={JSON.parse(JSON.stringify(rooms))}
          menuItems={JSON.parse(JSON.stringify(menuItems))}
        />
      </main>
    </>
  )
}
