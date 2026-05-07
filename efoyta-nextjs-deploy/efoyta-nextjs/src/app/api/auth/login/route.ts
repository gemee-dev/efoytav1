import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
      include: { hotel: true },
    })

    if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      hotelId: user.hotelId,
      name: user.name,
    })

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, hotelId: user.hotelId },
      hotel: user.hotel,
    })

    response.cookies.set('efoyta_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[LOGIN]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
