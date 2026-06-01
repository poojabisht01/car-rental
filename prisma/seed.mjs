import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const sqlite = new Database('./prisma/dev.db');
const adapter = new PrismaBetterSqlite3(sqlite);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Reset
  await prisma.booking.deleteMany();
  await prisma.car.deleteMany();
  await prisma.user.deleteMany();
  console.log('✓ Cleared existing data');

  // Users
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@carrental.com', password: adminHash, phone: '+1-800-555-0001', role: 'admin' },
  });
  const john = await prisma.user.create({
    data: { name: 'John Doe', email: 'john@example.com', password: userHash, phone: '+1-800-555-0100', role: 'user' },
  });
  console.log('✓ Created users');

  // Cars
  const carsData = [
    {
      name: 'Toyota Camry', brand: 'Toyota', model: 'Camry', year: 2023, type: 'sedan',
      transmission: 'automatic', seats: 5, fuel: 'petrol', pricePerDay: 45,
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
      images: JSON.stringify(['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800','https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800','https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800']),
      description: 'The Toyota Camry is a reliable and comfortable mid-size sedan perfect for city and highway driving. Featuring a smooth ride, excellent fuel economy, and modern safety features.',
      features: JSON.stringify(['Air Conditioning','GPS Navigation','Bluetooth','Backup Camera','Cruise Control','Electric Windows']),
      rating: 4.7, reviews: 120, location: 'City Center', mileage: 'Unlimited', available: true,
    },
    {
      name: 'BMW 5 Series', brand: 'BMW', model: '5 Series', year: 2023, type: 'luxury',
      transmission: 'automatic', seats: 5, fuel: 'petrol', pricePerDay: 120,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
      images: JSON.stringify(['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800','https://images.unsplash.com/photo-1617814065893-00757125efeb?w=800','https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800']),
      description: 'Experience the pinnacle of German engineering with the BMW 5 Series. This executive sedan combines stunning performance with luxurious comfort and cutting-edge technology.',
      features: JSON.stringify(['Heated Seats','Sunroof','Apple CarPlay','Lane Assist','Parking Sensors','Premium Sound System']),
      rating: 4.9, reviews: 85, location: 'Airport', mileage: 'Unlimited', available: true,
    },
    {
      name: 'Ford Mustang', brand: 'Ford', model: 'Mustang', year: 2022, type: 'sports',
      transmission: 'automatic', seats: 4, fuel: 'petrol', pricePerDay: 95,
      image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
      images: JSON.stringify(['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800','https://images.unsplash.com/photo-1547744152-14d985cb937f?w=800','https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800']),
      description: 'Feel the thrill of American muscle with the iconic Ford Mustang. With its powerful V8 engine and sporty design, this car delivers an exhilarating driving experience.',
      features: JSON.stringify(['Performance Exhaust','Sport Mode','Launch Control','Bluetooth','Backup Camera','Apple CarPlay']),
      rating: 4.8, reviews: 64, location: 'Downtown', mileage: 'Unlimited', available: true,
    },
    {
      name: 'Honda CR-V', brand: 'Honda', model: 'CR-V', year: 2023, type: 'suv',
      transmission: 'automatic', seats: 5, fuel: 'petrol', pricePerDay: 65,
      image: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800',
      images: JSON.stringify(['https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800','https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800','https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800']),
      description: 'The Honda CR-V is the perfect family SUV. Spacious, practical, and fuel-efficient, it handles both city streets and country roads with ease.',
      features: JSON.stringify(['All-Wheel Drive','Roof Rails','Third Row Seating','Air Conditioning','GPS Navigation','Backup Camera']),
      rating: 4.6, reviews: 143, location: 'City Center', mileage: 'Unlimited', available: true,
    },
    {
      name: 'Tesla Model 3', brand: 'Tesla', model: 'Model 3', year: 2023, type: 'sedan',
      transmission: 'automatic', seats: 5, fuel: 'electric', pricePerDay: 89,
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
      images: JSON.stringify(['https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800','https://images.unsplash.com/photo-1551826152-d7248d9dff52?w=800','https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800']),
      description: 'Drive into the future with the Tesla Model 3. Zero emissions, lightning-fast acceleration, and an enormous touchscreen make every drive extraordinary.',
      features: JSON.stringify(['Autopilot','Over-the-Air Updates','Supercharger Access','Glass Roof','Premium Sound','Mobile App Control']),
      rating: 4.9, reviews: 211, location: 'North Hub', mileage: 'Unlimited', available: true,
    },
    {
      name: 'Mercedes E-Class', brand: 'Mercedes', model: 'E-Class', year: 2023, type: 'luxury',
      transmission: 'automatic', seats: 5, fuel: 'petrol', pricePerDay: 150,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
      images: JSON.stringify(['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800','https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800','https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800']),
      description: 'The Mercedes E-Class represents the finest in German luxury motoring. Impeccable build quality, advanced technology, and supreme comfort define this executive saloon.',
      features: JSON.stringify(['Burmester Sound','Massage Seats','Night Vision','Head-Up Display','Air Suspension','Ambient Lighting']),
      rating: 4.9, reviews: 56, location: 'Airport', mileage: 'Unlimited', available: true,
    },
    {
      name: 'Volkswagen Polo', brand: 'Volkswagen', model: 'Polo', year: 2022, type: 'economy',
      transmission: 'manual', seats: 5, fuel: 'petrol', pricePerDay: 30,
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
      images: JSON.stringify(['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800','https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800','https://images.unsplash.com/photo-1542362567-b07e54358753?w=800']),
      description: 'Budget-friendly without sacrificing quality, the Volkswagen Polo is perfect for city driving. Compact, economical, and surprisingly spacious inside.',
      features: JSON.stringify(['Air Conditioning','Bluetooth','USB Charging','Electric Windows','Central Locking','Fuel Efficient']),
      rating: 4.4, reviews: 89, location: 'South Terminal', mileage: 'Unlimited', available: true,
    },
    {
      name: 'Jeep Wrangler', brand: 'Jeep', model: 'Wrangler', year: 2023, type: 'suv',
      transmission: 'automatic', seats: 4, fuel: 'petrol', pricePerDay: 85,
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
      images: JSON.stringify(['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800','https://images.unsplash.com/photo-1564356404954-6f9c80ecef0c?w=800']),
      description: 'Conquer any terrain with the legendary Jeep Wrangler. Built for adventure, this iconic 4x4 is as capable off-road as it is head-turning on-road.',
      features: JSON.stringify(['4x4 Off-Road','Removable Roof','Skid Plates','Rock Rails','Locking Differentials','Trail Camera']),
      rating: 4.7, reviews: 77, location: 'North Hub', mileage: 'Unlimited', available: true,
    },
    {
      name: 'Audi A6', brand: 'Audi', model: 'A6', year: 2023, type: 'luxury',
      transmission: 'automatic', seats: 5, fuel: 'petrol', pricePerDay: 135,
      image: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=800',
      images: JSON.stringify(['https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=800','https://images.unsplash.com/photo-1591465098978-a9e94e2d36f8?w=800','https://images.unsplash.com/photo-1582513166988-ce218c4cb4b9?w=800']),
      description: 'The Audi A6 combines progressive design with advanced quattro technology. A sophisticated executive saloon with a driver-focused cockpit and exceptional build quality.',
      features: JSON.stringify(['Quattro AWD','Matrix LED Headlights','Virtual Cockpit','Adaptive Cruise','Bang & Olufsen Sound','Wireless Charging']),
      rating: 4.8, reviews: 48, location: 'Downtown', mileage: 'Unlimited', available: true,
    },
    {
      name: 'Toyota Hiace', brand: 'Toyota', model: 'Hiace', year: 2022, type: 'van',
      transmission: 'automatic', seats: 12, fuel: 'diesel', pricePerDay: 110,
      image: 'https://images.unsplash.com/photo-1532974297617-c0f05fe48bff?w=800',
      images: JSON.stringify(['https://images.unsplash.com/photo-1532974297617-c0f05fe48bff?w=800','https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800','https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=800']),
      description: 'The ultimate people-mover, the Toyota Hiace can comfortably seat 12 passengers. Perfect for group travel, airport transfers, or corporate shuttles.',
      features: JSON.stringify(['12 Passenger Seats','Air Conditioning','USB Charging Ports','Tinted Windows','Central Locking','Luggage Space']),
      rating: 4.5, reviews: 32, location: 'Airport', mileage: 'Unlimited', available: true,
    },
    {
      name: 'Nissan Patrol', brand: 'Nissan', model: 'Patrol', year: 2023, type: 'suv',
      transmission: 'automatic', seats: 7, fuel: 'petrol', pricePerDay: 95,
      image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800',
      images: JSON.stringify(['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800','https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800','https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800']),
      description: 'The Nissan Patrol is a full-size luxury SUV built for both comfort and serious off-road capability. With seating for 7 and a powerful engine, it handles any challenge.',
      features: JSON.stringify(['7 Seats','4x4 Off-Road','Air Suspension','360 Camera','Third Row Folding','Roof Rails']),
      rating: 4.6, reviews: 61, location: 'City Center', mileage: 'Unlimited', available: true,
    },
    {
      name: 'Hyundai Elantra', brand: 'Hyundai', model: 'Elantra', year: 2022, type: 'economy',
      transmission: 'automatic', seats: 5, fuel: 'petrol', pricePerDay: 38,
      image: 'https://images.unsplash.com/photo-1629897048514-3dd7414fe72a?w=800',
      images: JSON.stringify(['https://images.unsplash.com/photo-1629897048514-3dd7414fe72a?w=800','https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800','https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800']),
      description: 'The Hyundai Elantra offers exceptional value with a stylish design and advanced features. Great fuel efficiency and a comfortable interior make it ideal for daily use.',
      features: JSON.stringify(['Lane Keeping Assist','Forward Collision Warning','Apple CarPlay','Android Auto','Wireless Charging','Smart Cruise']),
      rating: 4.3, reviews: 102, location: 'South Terminal', mileage: 'Unlimited', available: true,
    },
    {
      name: 'Porsche 911', brand: 'Porsche', model: '911', year: 2023, type: 'sports',
      transmission: 'automatic', seats: 2, fuel: 'petrol', pricePerDay: 280,
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
      images: JSON.stringify(['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800','https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800','https://images.unsplash.com/photo-1567818735868-e71b99932e29?w=800']),
      description: 'The Porsche 911 is the benchmark sports car. Sixty years of evolution have produced a near-perfect machine that delivers spine-tingling performance and everyday usability.',
      features: JSON.stringify(['Sport Chrono Package','PASM Suspension','Porsche Connect','Sport Exhaust','Carbon Ceramic Brakes','Launch Control']),
      rating: 5.0, reviews: 29, location: 'Downtown', mileage: 'Unlimited', available: true,
    },
    {
      name: 'Kia Sportage', brand: 'Kia', model: 'Sportage', year: 2023, type: 'suv',
      transmission: 'automatic', seats: 5, fuel: 'petrol', pricePerDay: 58,
      image: 'https://images.unsplash.com/photo-1617808906014-e45d3a68c6cc?w=800',
      images: JSON.stringify(['https://images.unsplash.com/photo-1617808906014-e45d3a68c6cc?w=800','https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800','https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800']),
      description: 'The Kia Sportage redefines value in the compact SUV segment. Bold styling, a feature-rich interior, and solid build quality make it a top choice for families.',
      features: JSON.stringify(['Panoramic Sunroof','Heated Seats','Wireless CarPlay','Blind Spot Monitor','Rear Cross Traffic Alert','Smart Key']),
      rating: 4.5, reviews: 95, location: 'North Hub', mileage: 'Unlimited', available: true,
    },
    {
      name: 'Range Rover Sport', brand: 'Land Rover', model: 'Range Rover Sport', year: 2023, type: 'luxury',
      transmission: 'automatic', seats: 5, fuel: 'petrol', pricePerDay: 195,
      image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800',
      images: JSON.stringify(['https://images.unsplash.com/photo-1542362567-b07e54358753?w=800','https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800']),
      description: 'The Range Rover Sport is the definitive luxury performance SUV. Combining extraordinary capability with breathtaking refinement, it sets the standard in its class.',
      features: JSON.stringify(['Terrain Response','Air Suspension','Pivi Pro Infotainment','Meridian Sound','Electric Deployable Steps','Wade Sensing']),
      rating: 4.9, reviews: 41, location: 'Airport', mileage: 'Unlimited', available: true,
    },
  ];

  const cars = [];
  for (const carData of carsData) {
    const car = await prisma.car.create({ data: carData });
    cars.push(car);
  }
  console.log(`✓ Created ${cars.length} cars`);

  // Bookings
  const now = new Date();
  const bookingsData = [
    {
      userId: john.id, carId: cars[0].id,
      startDate: new Date('2024-07-10'), endDate: new Date('2024-07-15'),
      totalDays: 5, totalPrice: 5 * cars[0].pricePerDay,
      status: 'confirmed', pickupLoc: 'City Center', dropoffLoc: 'Airport',
      driverName: 'John Doe', driverPhone: '+1-800-555-0100', notes: 'Airport pickup needed',
    },
    {
      userId: john.id, carId: cars[1].id,
      startDate: new Date('2024-06-01'), endDate: new Date('2024-06-04'),
      totalDays: 3, totalPrice: 3 * cars[1].pricePerDay,
      status: 'completed', pickupLoc: 'Airport', dropoffLoc: 'Airport',
      driverName: 'John Doe', driverPhone: '+1-800-555-0100', notes: null,
    },
    {
      userId: john.id, carId: cars[2].id,
      startDate: new Date('2024-08-20'), endDate: new Date('2024-08-23'),
      totalDays: 3, totalPrice: 3 * cars[2].pricePerDay,
      status: 'pending', pickupLoc: 'Downtown', dropoffLoc: 'Downtown',
      driverName: 'John Doe', driverPhone: '+1-800-555-0100', notes: 'Weekend getaway',
    },
  ];

  for (const b of bookingsData) {
    await prisma.booking.create({ data: b });
  }
  console.log('✓ Created 3 bookings');
  console.log('');
  console.log('🎉 Seed complete!');
  console.log('   Admin: admin@carrental.com / admin123');
  console.log('   User:  john@example.com / user123');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
