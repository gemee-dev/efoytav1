import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session || !['hotel_admin', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const hotelId = session.hotelId!
  const item = await prisma.menuItem.findFirst({ where: { id: params.id, hotelId } })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.menuItem.delete({ where: { id: params.id } })
  return NextResponse.json({ deleted: params.id })
}
