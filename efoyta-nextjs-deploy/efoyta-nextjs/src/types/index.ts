export type SubscriptionStatus = 'active' | 'trial' | 'expired'
export type UserRole = 'super_admin' | 'hotel_admin' | 'staff'
export type BookingStatus = 'pending' | 'confirmed' | 'rejected'
export type RoomType = 'Single' | 'Double' | 'Suite' | 'Family'
export type PlanType = 'Starter' | 'Professional' | 'Enterprise'

export interface Hotel {
  id: string
  slug: string
  name: string
  city: string
  tagline: string
  about: string
  phone: string
  email: string
  address: string
  emoji: string
  stars: string
  subscriptionStatus: SubscriptionStatus
  subscriptionEnds: string | null
  plan: PlanType
  createdAt: string
  _count?: { rooms: number; bookings: number }
  minPrice?: number
}

export interface Room {
  id: string
  hotelId: string
  name: string
  type: RoomType
  capacity: number
  price: number
  available: boolean
  description: string
  imageUrl: string
  createdAt: string
}

export interface Booking {
  id: string
  hotelId: string
  roomId: string
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: string
  checkOut: string
  nights: number
  total: number
  status: BookingStatus
  createdAt: string
  room?: { name: string; price: number }
}

export interface MenuItem {
  id: string
  hotelId: string
  name: string
  category: string
  description: string
  price: number
  available: boolean
}

export interface DashboardStats {
  roomsTotal: number
  roomsAvailable: number
  bookingsTotal: number
  bookingsPending: number
  bookingsConfirmed: number
  revenue: number
  menuItems: number
}

export interface ApiError {
  error: string
}
