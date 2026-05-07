import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (session?.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { status, ends, plan } = await req.json()
  if (!['active', 'expired', 'trial'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const hotel = await prisma.hotel.update({
    where: { id: params.id },
    data: {
      subscriptionStatus: status,
      subscriptionEnds: ends ? new Date(ends) : new Date(Date.now() + 30 * 86400000),
      ...(plan ? { plan } : {}),
    },
  })
  return NextResponse.json(hotel)
}
