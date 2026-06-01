import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import Database from 'better-sqlite3';
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3';
import bcryptjs from 'bcryptjs';

const sqlite = new Database('./prisma/dev.db');
const adapter = new PrismaBetterSQLite3(sqlite);
const prisma = new PrismaClient({ adapter } as Parameters<typeof PrismaClient>[0]);

async function main() {
  // Reset database
  await prisma.booking.deleteMany();
  await prisma.car.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcryptjs.hash('admin123', 10);
  const userPassword = await bcryptjs.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@carrental.com',
      password: adminPassword,
      role: 'admin',
    },
  });

  const john = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: userPassword,
      role: 'user',
    },
  });

  console.log('Created users:', { admin: admin.email, user: john.email });

  // Create cars
  const cars = await Promise.all([
    // 1. Toyota Camry 2023
    prisma.car.create({
      data: {
        name: 'Toyota Camry 2023',
        brand: 'Toyota',
        model: 'Camry',
        year: 2023,
        type: 'sedan',
        transmission: 'automatic',
        seats: 5,
        fuel: 'petrol',
        pricePerDay: 45,
        image: '/cars/car-1.jpg',
        images: JSON.stringify(['/cars/car-1.jpg', '/cars/car-1-2.jpg', '/cars/car-1-3.jpg']),
        features: JSON.stringify(['Air Conditioning', 'GPS Navigation', 'Bluetooth', 'Backup Camera', 'Apple CarPlay']),
        description: 'The Toyota Camry 2023 offers a refined driving experience with modern tech features and exceptional fuel economy. Perfect for business trips and family outings alike.',
        available: true,
        rating: 4.7,
        reviews: 120,
        location: 'City Center',
        mileage: 'Unlimited',
      },
    }),

    // 2. BMW 5 Series 2023
    prisma.car.create({
      data: {
        name: 'BMW 5 Series 2023',
        brand: 'BMW',
        model: '5 Series',
        year: 2023,
        type: 'luxury',
        transmission: 'automatic',
        seats: 5,
        fuel: 'petrol',
        pricePerDay: 120,
        image: '/cars/car-2.jpg',
        images: JSON.stringify(['/cars/car-2.jpg', '/cars/car-2-2.jpg', '/cars/car-2-3.jpg']),
        features: JSON.stringify(['Air Conditioning', 'GPS Navigation', 'Heated Seats', 'Sunroof', 'Lane Assist', 'Apple CarPlay']),
        description: 'The BMW 5 Series 2023 delivers a premium driving experience with cutting-edge technology and refined luxury. A statement vehicle for discerning travellers.',
        available: true,
        rating: 4.9,
        reviews: 85,
        location: 'Airport',
        mileage: 'Unlimited',
      },
    }),

    // 3. Ford Mustang 2022
    prisma.car.create({
      data: {
        name: 'Ford Mustang 2022',
        brand: 'Ford',
        model: 'Mustang',
        year: 2022,
        type: 'sports',
        transmission: 'automatic',
        seats: 4,
        fuel: 'petrol',
        pricePerDay: 95,
        image: '/cars/car-3.jpg',
        images: JSON.stringify(['/cars/car-3.jpg', '/cars/car-3-2.jpg', '/cars/car-3-3.jpg']),
        features: JSON.stringify(['Air Conditioning', 'Bluetooth', 'Backup Camera', 'Apple CarPlay', 'Cruise Control']),
        description: 'The iconic Ford Mustang 2022 combines raw power with classic American muscle styling. An unforgettable driving experience on any road.',
        available: true,
        rating: 4.8,
        reviews: 64,
        location: 'Downtown',
        mileage: 'Unlimited',
      },
    }),

    // 4. Honda CR-V 2023
    prisma.car.create({
      data: {
        name: 'Honda CR-V 2023',
        brand: 'Honda',
        model: 'CR-V',
        year: 2023,
        type: 'SUV',
        transmission: 'automatic',
        seats: 5,
        fuel: 'petrol',
        pricePerDay: 65,
        image: '/cars/car-4.jpg',
        images: JSON.stringify(['/cars/car-4.jpg', '/cars/car-4-2.jpg', '/cars/car-4-3.jpg']),
        features: JSON.stringify(['Air Conditioning', 'GPS Navigation', 'Bluetooth', 'Backup Camera', 'Electric Windows', 'Cruise Control']),
        description: 'The Honda CR-V 2023 is a versatile SUV with ample cargo space and advanced safety features. Ideal for families and adventure seekers.',
        available: true,
        rating: 4.6,
        reviews: 143,
        location: 'City Center',
        mileage: 'Unlimited',
      },
    }),

    // 5. Tesla Model 3 2023
    prisma.car.create({
      data: {
        name: 'Tesla Model 3 2023',
        brand: 'Tesla',
        model: 'Model 3',
        year: 2023,
        type: 'sedan',
        transmission: 'automatic',
        seats: 5,
        fuel: 'electric',
        pricePerDay: 89,
        image: '/cars/car-5.jpg',
        images: JSON.stringify(['/cars/car-5.jpg', '/cars/car-5-2.jpg', '/cars/car-5-3.jpg']),
        features: JSON.stringify(['Air Conditioning', 'GPS Navigation', 'Autopilot', 'Backup Camera', 'Lane Assist', 'Apple CarPlay']),
        description: 'The Tesla Model 3 2023 is a fully electric sedan with an impressive range and industry-leading autopilot technology. Drive the future today.',
        available: true,
        rating: 4.9,
        reviews: 211,
        location: 'North Hub',
        mileage: 'Unlimited',
      },
    }),

    // 6. Mercedes E-Class 2023
    prisma.car.create({
      data: {
        name: 'Mercedes E-Class 2023',
        brand: 'Mercedes',
        model: 'E-Class',
        year: 2023,
        type: 'luxury',
        transmission: 'automatic',
        seats: 5,
        fuel: 'petrol',
        pricePerDay: 150,
        image: '/cars/car-6.jpg',
        images: JSON.stringify(['/cars/car-6.jpg', '/cars/car-6-2.jpg', '/cars/car-6-3.jpg']),
        features: JSON.stringify(['Air Conditioning', 'GPS Navigation', 'Heated Seats', 'Sunroof', 'Lane Assist', 'Apple CarPlay']),
        description: 'The Mercedes E-Class 2023 epitomises luxury motoring with its elegant design and state-of-the-art comfort features. Every journey becomes a first-class experience.',
        available: true,
        rating: 4.9,
        reviews: 56,
        location: 'Airport',
        mileage: 'Unlimited',
      },
    }),

    // 7. Volkswagen Polo 2022
    prisma.car.create({
      data: {
        name: 'Volkswagen Polo 2022',
        brand: 'Volkswagen',
        model: 'Polo',
        year: 2022,
        type: 'economy',
        transmission: 'manual',
        seats: 5,
        fuel: 'petrol',
        pricePerDay: 30,
        image: '/cars/car-7.jpg',
        images: JSON.stringify(['/cars/car-7.jpg', '/cars/car-7-2.jpg', '/cars/car-7-3.jpg']),
        features: JSON.stringify(['Air Conditioning', 'Bluetooth', 'Electric Windows', 'Cruise Control']),
        description: 'The Volkswagen Polo 2022 is a reliable and fuel-efficient economy car perfect for city driving. Great value without compromising on quality.',
        available: true,
        rating: 4.4,
        reviews: 89,
        location: 'South Terminal',
        mileage: 'Unlimited',
      },
    }),

    // 8. Jeep Wrangler 2023
    prisma.car.create({
      data: {
        name: 'Jeep Wrangler 2023',
        brand: 'Jeep',
        model: 'Wrangler',
        year: 2023,
        type: 'SUV',
        transmission: 'automatic',
        seats: 4,
        fuel: 'petrol',
        pricePerDay: 85,
        image: '/cars/car-8.jpg',
        images: JSON.stringify(['/cars/car-8.jpg', '/cars/car-8-2.jpg', '/cars/car-8-3.jpg']),
        features: JSON.stringify(['Air Conditioning', 'GPS Navigation', 'Bluetooth', 'Backup Camera', 'Cruise Control']),
        description: 'The Jeep Wrangler 2023 is the ultimate off-road adventure vehicle with legendary 4x4 capability. Tackle any terrain with confidence and style.',
        available: true,
        rating: 4.7,
        reviews: 77,
        location: 'Downtown',
        mileage: 'Unlimited',
      },
    }),

    // 9. Audi A6 2023
    prisma.car.create({
      data: {
        name: 'Audi A6 2023',
        brand: 'Audi',
        model: 'A6',
        year: 2023,
        type: 'luxury',
        transmission: 'automatic',
        seats: 5,
        fuel: 'petrol',
        pricePerDay: 135,
        image: '/cars/car-9.jpg',
        images: JSON.stringify(['/cars/car-9.jpg', '/cars/car-9-2.jpg', '/cars/car-9-3.jpg']),
        features: JSON.stringify(['Air Conditioning', 'GPS Navigation', 'Heated Seats', 'Sunroof', 'Lane Assist', 'Apple CarPlay']),
        description: 'The Audi A6 2023 blends sportiness with executive comfort through its sophisticated design and advanced quattro all-wheel drive. A true driver\'s luxury sedan.',
        available: true,
        rating: 4.8,
        reviews: 48,
        location: 'City Center',
        mileage: 'Unlimited',
      },
    }),

    // 10. Toyota Hiace 2022
    prisma.car.create({
      data: {
        name: 'Toyota Hiace 2022',
        brand: 'Toyota',
        model: 'Hiace',
        year: 2022,
        type: 'van',
        transmission: 'automatic',
        seats: 12,
        fuel: 'diesel',
        pricePerDay: 110,
        image: '/cars/car-10.jpg',
        images: JSON.stringify(['/cars/car-10.jpg', '/cars/car-10-2.jpg', '/cars/car-10-3.jpg']),
        features: JSON.stringify(['Air Conditioning', 'GPS Navigation', 'Bluetooth', 'Electric Windows', 'Cruise Control']),
        description: 'The Toyota Hiace 2022 is a spacious and dependable van perfect for group travel and large family trips. Generous seating ensures everyone travels in comfort.',
        available: true,
        rating: 4.5,
        reviews: 32,
        location: 'Airport',
        mileage: 'Unlimited',
      },
    }),

    // 11. Nissan Patrol 2023
    prisma.car.create({
      data: {
        name: 'Nissan Patrol 2023',
        brand: 'Nissan',
        model: 'Patrol',
        year: 2023,
        type: 'SUV',
        transmission: 'automatic',
        seats: 7,
        fuel: 'petrol',
        pricePerDay: 95,
        image: '/cars/car-11.jpg',
        images: JSON.stringify(['/cars/car-11.jpg', '/cars/car-11-2.jpg', '/cars/car-11-3.jpg']),
        features: JSON.stringify(['Air Conditioning', 'GPS Navigation', 'Bluetooth', 'Backup Camera', 'Heated Seats', 'Cruise Control']),
        description: 'The Nissan Patrol 2023 is a commanding full-size SUV with powerful performance and premium seven-seat comfort. Built for those who demand both capability and refinement.',
        available: true,
        rating: 4.6,
        reviews: 61,
        location: 'North Hub',
        mileage: 'Unlimited',
      },
    }),

    // 12. Hyundai Elantra 2022
    prisma.car.create({
      data: {
        name: 'Hyundai Elantra 2022',
        brand: 'Hyundai',
        model: 'Elantra',
        year: 2022,
        type: 'economy',
        transmission: 'automatic',
        seats: 5,
        fuel: 'petrol',
        pricePerDay: 38,
        image: '/cars/car-12.jpg',
        images: JSON.stringify(['/cars/car-12.jpg', '/cars/car-12-2.jpg', '/cars/car-12-3.jpg']),
        features: JSON.stringify(['Air Conditioning', 'Bluetooth', 'Backup Camera', 'Electric Windows']),
        description: 'The Hyundai Elantra 2022 is a stylish and affordable compact sedan that delivers great fuel efficiency and modern convenience features. An excellent everyday rental.',
        available: true,
        rating: 4.3,
        reviews: 102,
        location: 'South Terminal',
        mileage: 'Unlimited',
      },
    }),

    // 13. Porsche 911 2023
    prisma.car.create({
      data: {
        name: 'Porsche 911 2023',
        brand: 'Porsche',
        model: '911',
        year: 2023,
        type: 'sports',
        transmission: 'automatic',
        seats: 2,
        fuel: 'petrol',
        pricePerDay: 280,
        image: '/cars/car-13.jpg',
        images: JSON.stringify(['/cars/car-13.jpg', '/cars/car-13-2.jpg', '/cars/car-13-3.jpg']),
        features: JSON.stringify(['Air Conditioning', 'GPS Navigation', 'Heated Seats', 'Sunroof', 'Apple CarPlay', 'Lane Assist']),
        description: 'The Porsche 911 2023 is the pinnacle of sports car engineering, delivering breathtaking performance and iconic styling. An extraordinary experience reserved for the true enthusiast.',
        available: true,
        rating: 5.0,
        reviews: 29,
        location: 'Downtown',
        mileage: 'Unlimited',
      },
    }),

    // 14. Kia Sportage 2023
    prisma.car.create({
      data: {
        name: 'Kia Sportage 2023',
        brand: 'Kia',
        model: 'Sportage',
        year: 2023,
        type: 'SUV',
        transmission: 'automatic',
        seats: 5,
        fuel: 'petrol',
        pricePerDay: 58,
        image: '/cars/car-14.jpg',
        images: JSON.stringify(['/cars/car-14.jpg', '/cars/car-14-2.jpg', '/cars/car-14-3.jpg']),
        features: JSON.stringify(['Air Conditioning', 'GPS Navigation', 'Bluetooth', 'Backup Camera', 'Electric Windows']),
        description: 'The Kia Sportage 2023 offers a bold design and impressive feature set at a competitive price point. A smart choice for families looking for SUV practicality.',
        available: true,
        rating: 4.5,
        reviews: 95,
        location: 'City Center',
        mileage: 'Unlimited',
      },
    }),

    // 15. Range Rover Sport 2023
    prisma.car.create({
      data: {
        name: 'Range Rover Sport 2023',
        brand: 'Range Rover',
        model: 'Sport',
        year: 2023,
        type: 'luxury',
        transmission: 'automatic',
        seats: 5,
        fuel: 'petrol',
        pricePerDay: 195,
        image: '/cars/car-15.jpg',
        images: JSON.stringify(['/cars/car-15.jpg', '/cars/car-15-2.jpg', '/cars/car-15-3.jpg']),
        features: JSON.stringify(['Air Conditioning', 'GPS Navigation', 'Heated Seats', 'Sunroof', 'Lane Assist', 'Apple CarPlay']),
        description: 'The Range Rover Sport 2023 combines breathtaking luxury with outstanding all-terrain capability. The definitive premium SUV for those who accept no compromise.',
        available: true,
        rating: 4.9,
        reviews: 41,
        location: 'Airport',
        mileage: 'Unlimited',
      },
    }),
  ]);

  console.log(`Created ${cars.length} cars`);

  // Create bookings for John Doe
  const camry = cars[0];   // Toyota Camry
  const bmw = cars[1];     // BMW 5 Series
  const mustang = cars[2]; // Ford Mustang

  await prisma.booking.create({
    data: {
      userId: john.id,
      carId: camry.id,
      startDate: new Date('2024-07-10'),
      endDate: new Date('2024-07-15'),
      totalDays: 5,
      totalPrice: 5 * camry.pricePerDay,
      status: 'confirmed',
      pickupLoc: 'City Center',
      dropoffLoc: 'City Center',
      driverName: 'John Doe',
      driverPhone: '+1234567890',
      notes: 'Please have the car ready by 9am.',
    },
  });

  await prisma.booking.create({
    data: {
      userId: john.id,
      carId: bmw.id,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-04'),
      totalDays: 3,
      totalPrice: 3 * bmw.pricePerDay,
      status: 'completed',
      pickupLoc: 'Airport',
      dropoffLoc: 'Downtown',
      driverName: 'John Doe',
      driverPhone: '+1234567890',
      notes: null,
    },
  });

  await prisma.booking.create({
    data: {
      userId: john.id,
      carId: mustang.id,
      startDate: new Date('2024-08-20'),
      endDate: new Date('2024-08-23'),
      totalDays: 3,
      totalPrice: 3 * mustang.pricePerDay,
      status: 'pending',
      pickupLoc: 'Downtown',
      dropoffLoc: 'Downtown',
      driverName: 'John Doe',
      driverPhone: '+1234567890',
      notes: 'Interested in the red colour if available.',
    },
  });

  console.log('Created 3 bookings for john@example.com');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
