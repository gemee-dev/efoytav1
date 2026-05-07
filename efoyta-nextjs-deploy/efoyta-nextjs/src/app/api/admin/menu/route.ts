import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !['hotel_admin', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const hotelId = session.hotelId!
  const items = await prisma.menuItem.findMany({
    where: { hotelId },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !['hotel_admin', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const hotelId = session.hotelId!
  const body = await req.json()

  if (!body.name || !body.category || !body.price) {
    return NextResponse.json({ error: 'name, category and price are required' }, { status: 400 })
  }

  const item = await prisma.menuItem.create({
    data: {
      hotelId,
      name: String(body.name),
      category: String(body.category),
      description: body.description || '',
      price: Number(body.price),
    },
  })
  return NextResponse.json(item, { status: 201 })
}
