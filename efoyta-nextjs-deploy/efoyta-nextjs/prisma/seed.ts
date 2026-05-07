import { PrismaClient, SubscriptionStatus, UserRole, PlanType, RoomType, BookingStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database…')

  await prisma.booking.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.room.deleteMany()
  await prisma.user.deleteMany()
  await prisma.hotel.deleteMany()

  // Super Admin
  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@efoyta.com',
      passwordHash: await bcrypt.hash('admin123', 12),
      role: UserRole.super_admin,
    },
  })

  const now = new Date()
  const future60 = new Date(now.getTime() + 60 * 86400000)
  const future90 = new Date(now.getTime() + 90 * 86400000)
  const future30 = new Date(now.getTime() + 30 * 86400000)
  const past5 = new Date(now.getTime() - 5 * 86400000)

  // Hotel 1 — Kaffa Grand
  const kaffa = await prisma.hotel.create({
    data: {
      slug: 'kaffa-grand',
      name: 'Kaffa Grand Hotel',
      city: 'Jimma',
      tagline: 'Where highland hospitality meets modern comfort',
      about: 'Nestled in the heart of Jimma, we offer guests an unforgettable blend of traditional Ethiopian hospitality and contemporary amenities. Founded in 2010, we have welcomed guests from across Ethiopia and beyond. Our hotel takes its name from the Kaffa region — the legendary birthplace of coffee — and we carry that legacy in every detail.',
      phone: '+251 47 112 0000',
      email: 'info@kaffagrand.et',
      address: 'Jimma Town, Oromia Region, Ethiopia',
      emoji: '☕',
      stars: '★★★★',
      subscriptionStatus: SubscriptionStatus.active,
      subscriptionEnds: future60,
      plan: PlanType.Professional,
    },
  })

  await prisma.user.create({
    data: {
      hotelId: kaffa.id,
      name: 'Kaffa Manager',
      email: 'hotel@efoyta.com',
      passwordHash: await bcrypt.hash('hotel123', 12),
      role: UserRole.hotel_admin,
    },
  })

  const rooms1 = await prisma.room.createManyAndReturn({
    data: [
      { hotelId: kaffa.id, name: 'Standard Single', type: RoomType.Single, capacity: 1, price: 800, available: true, description: 'Cosy room with garden view and private bathroom.' },
      { hotelId: kaffa.id, name: 'Deluxe Double', type: RoomType.Double, capacity: 2, price: 1200, available: true, description: 'Spacious room with mountain view, king bed and sitting area.' },
      { hotelId: kaffa.id, name: 'Executive Suite', type: RoomType.Suite, capacity: 2, price: 2500, available: false, description: 'Premium suite with private lounge and panoramic view.' },
      { hotelId: kaffa.id, name: 'Family Room', type: RoomType.Family, capacity: 4, price: 1800, available: true, description: 'Ideal for families. Two bedrooms and kids play area.' },
      { hotelId: kaffa.id, name: 'Business Twin', type: RoomType.Double, capacity: 2, price: 1100, available: true, description: 'Two twin beds, work desk and fast WiFi.' },
    ],
  })

  await prisma.booking.createMany({
    data: [
      { hotelId: kaffa.id, roomId: rooms1[1].id, guestName: 'Abebe Kebede', guestEmail: 'abebe@email.com', guestPhone: '+251911000001', checkIn: new Date('2025-05-15'), checkOut: new Date('2025-05-18'), nights: 3, total: 3600, status: BookingStatus.confirmed },
      { hotelId: kaffa.id, roomId: rooms1[0].id, guestName: 'Sara Haile', guestEmail: 'sara@email.com', guestPhone: '+251911000002', checkIn: new Date('2025-05-20'), checkOut: new Date('2025-05-22'), nights: 2, total: 1600, status: BookingStatus.pending },
      { hotelId: kaffa.id, roomId: rooms1[3].id, guestName: 'Mohammed Ali', guestEmail: 'mo@email.com', guestPhone: '+251911000003', checkIn: new Date('2025-05-25'), checkOut: new Date('2025-05-28'), nights: 3, total: 5400, status: BookingStatus.pending },
      { hotelId: kaffa.id, roomId: rooms1[2].id, guestName: 'Tigist Bekele', guestEmail: 'tigist@email.com', guestPhone: '+251911000004', checkIn: new Date('2025-06-01'), checkOut: new Date('2025-06-03'), nights: 2, total: 5000, status: BookingStatus.rejected },
      { hotelId: kaffa.id, roomId: rooms1[1].id, guestName: 'Daniel Mesfin', guestEmail: 'dan@email.com', guestPhone: '+251911000005', checkIn: new Date('2025-06-10'), checkOut: new Date('2025-06-12'), nights: 2, total: 2400, status: BookingStatus.confirmed },
    ],
  })

  await prisma.menuItem.createMany({
    data: [
      { hotelId: kaffa.id, name: 'Injera with Doro Wot', category: 'Main Dishes', description: 'Traditional Ethiopian chicken stew served on injera', price: 180 },
      { hotelId: kaffa.id, name: 'Tibs (Lamb)', category: 'Main Dishes', description: 'Pan-fried tender lamb with herbs and spiced butter', price: 220 },
      { hotelId: kaffa.id, name: 'Vegetarian Combo', category: 'Main Dishes', description: 'Seasonal lentils, shiro, misir and fresh salad', price: 150 },
      { hotelId: kaffa.id, name: 'Kitfo', category: 'Main Dishes', description: 'Ethiopian steak tartare with mitmita spice', price: 200 },
      { hotelId: kaffa.id, name: 'Sambusa', category: 'Starters', description: 'Crispy pastry with spiced meat or lentil filling', price: 60 },
      { hotelId: kaffa.id, name: 'Timatim Salad', category: 'Starters', description: 'Fresh tomato, onion and green pepper salad', price: 45 },
      { hotelId: kaffa.id, name: 'Avocado Juice', category: 'Beverages', description: 'Fresh local avocado blended with milk', price: 45 },
      { hotelId: kaffa.id, name: 'Jimma Bunna', category: 'Beverages', description: 'Traditional Ethiopian coffee ceremony', price: 35 },
      { hotelId: kaffa.id, name: 'Macchiato', category: 'Beverages', description: 'Ethiopian-style espresso macchiato', price: 25 },
      { hotelId: kaffa.id, name: 'Honey Cake', category: 'Desserts', description: 'Local honey and berbere spice cake', price: 80 },
      { hotelId: kaffa.id, name: 'Baklava', category: 'Desserts', description: 'Layered pastry with nuts and honey syrup', price: 70 },
    ],
  })

  // Hotel 2 — Addis Luxury
  const addis = await prisma.hotel.create({
    data: {
      slug: 'addis-luxury',
      name: 'Addis Luxury Suites',
      city: 'Addis Ababa',
      tagline: 'The pinnacle of Addis Ababa hospitality',
      about: 'A premium five-star experience in the heart of the capital, with world-class amenities and impeccable service.',
      phone: '+251 11 551 0000',
      email: 'hello@addisluxury.et',
      address: 'Bole Road, Addis Ababa, Ethiopia',
      emoji: '🏙️',
      stars: '★★★★★',
      subscriptionStatus: SubscriptionStatus.active,
      subscriptionEnds: new Date(now.getTime() + 200 * 86400000),
      plan: PlanType.Enterprise,
    },
  })
  await prisma.room.createMany({
    data: [
      { hotelId: addis.id, name: 'Luxury King', type: RoomType.Suite, capacity: 2, price: 3500, available: true, description: 'Top-floor suite with panoramic Addis view.' },
      { hotelId: addis.id, name: 'Business Suite', type: RoomType.Suite, capacity: 2, price: 2800, available: true, description: 'Executive suite with lounge and meeting table.' },
      { hotelId: addis.id, name: 'Deluxe Twin', type: RoomType.Double, capacity: 2, price: 2200, available: true, description: 'Twin beds, marble bathroom, city view.' },
    ],
  })

  // Hotel 3 — Hawassa
  await prisma.hotel.create({
    data: {
      slug: 'hawassa-lake',
      name: 'Hawassa Lakeside Resort',
      city: 'Hawassa',
      tagline: 'Wake up to the lake every morning',
      about: 'Perched on the shores of Lake Hawassa with stunning views and direct lake access.',
      phone: '+251 46 221 0000',
      email: 'stay@hawassalake.et',
      address: 'Lake Shore Road, Hawassa, Ethiopia',
      emoji: '🌊',
      stars: '★★★★',
      subscriptionStatus: SubscriptionStatus.active,
      subscriptionEnds: future60,
      plan: PlanType.Professional,
    },
  })

  // Hotel 4 — Blue Nile (trial)
  await prisma.hotel.create({
    data: {
      slug: 'blue-nile-inn',
      name: 'Blue Nile Inn',
      city: 'Bahir Dar',
      tagline: 'Gateway to the Blue Nile Falls',
      about: 'A comfortable inn near the famous Blue Nile Falls, perfect for nature lovers.',
      phone: '+251 58 220 0000',
      email: 'info@bluenileinn.et',
      address: 'Near Blue Nile Falls, Bahir Dar, Ethiopia',
      emoji: '🌊',
      stars: '★★★',
      subscriptionStatus: SubscriptionStatus.trial,
      subscriptionEnds: future30,
      plan: PlanType.Starter,
    },
  })

  // Hotel 5 — Dire Dawa
  await prisma.hotel.create({
    data: {
      slug: 'dire-plaza',
      name: 'Dire Dawa Plaza Hotel',
      city: 'Dire Dawa',
      tagline: "Eastern Ethiopia's finest accommodation",
      about: 'Modern comfort in the commercial heart of Dire Dawa, close to the railway station.',
      phone: '+251 25 111 0000',
      email: 'contact@direplaza.et',
      address: 'Commercial Street, Dire Dawa, Ethiopia',
      emoji: '🏨',
      stars: '★★★★',
      subscriptionStatus: SubscriptionStatus.active,
      subscriptionEnds: future90,
      plan: PlanType.Professional,
    },
  })

  // Hotel 6 — Jimma Palace
  await prisma.hotel.create({
    data: {
      slug: 'jimma-palace',
      name: 'Jimma Palace Hotel',
      city: 'Jimma',
      tagline: 'Regal comfort in the coffee capital',
      about: 'Historic hotel with modern luxury at the heart of Jimma city centre. A landmark since 1985.',
      phone: '+251 47 113 0000',
      email: 'info@jimmapalace.et',
      address: 'Main Square, Jimma, Ethiopia',
      emoji: '🏰',
      stars: '★★★★',
      subscriptionStatus: SubscriptionStatus.active,
      subscriptionEnds: future90,
      plan: PlanType.Professional,
    },
  })

  // Hotel 7 — Ghion (expired)
  await prisma.hotel.create({
    data: {
      slug: 'sibu-lodge',
      name: 'Sibu Mountain Lodge',
      city: 'Jimma',
      tagline: 'Off-grid serenity above Jimma',
      about: 'Eco-lodge perched above the city with panoramic views of the Jimma highlands.',
      phone: '+251 47 114 0000',
      email: 'stay@sibulodge.et',
      address: 'Jimma Mountain Road, Oromia, Ethiopia',
      emoji: '⛰️',
      stars: '★★★',
      subscriptionStatus: SubscriptionStatus.expired,
      subscriptionEnds: past5,
      plan: PlanType.Starter,
    },
  })

  console.log('✅ Seeding complete!')
  console.log('   Super Admin: admin@efoyta.com / admin123')
  console.log('   Hotel Admin: hotel@efoyta.com / hotel123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
