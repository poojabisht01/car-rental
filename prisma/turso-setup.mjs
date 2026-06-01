import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

async function main() {
  console.log('🚀 Setting up Turso database...\n');

  // Create tables
  console.log('📦 Creating tables...');
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Car (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      type TEXT NOT NULL,
      transmission TEXT NOT NULL,
      seats INTEGER NOT NULL,
      fuel TEXT NOT NULL,
      pricePerDay REAL NOT NULL,
      image TEXT NOT NULL,
      images TEXT NOT NULL DEFAULT '[]',
      description TEXT NOT NULL,
      features TEXT NOT NULL DEFAULT '[]',
      available INTEGER NOT NULL DEFAULT 1,
      rating REAL NOT NULL DEFAULT 4.5,
      reviews INTEGER NOT NULL DEFAULT 0,
      location TEXT NOT NULL DEFAULT 'City Center',
      mileage TEXT NOT NULL DEFAULT 'Unlimited',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Booking (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      carId TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      totalDays INTEGER NOT NULL,
      totalPrice REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      pickupLoc TEXT NOT NULL,
      dropoffLoc TEXT NOT NULL,
      driverName TEXT NOT NULL,
      driverPhone TEXT NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES User(id),
      FOREIGN KEY (carId) REFERENCES Car(id)
    );
  `);
  console.log('✅ Tables created\n');

  // Clear existing data
  await db.executeMultiple(`DELETE FROM Booking; DELETE FROM Car; DELETE FROM User;`);

  // Users
  const adminHash = bcrypt.hashSync('admin123', 10);
  const userHash  = bcrypt.hashSync('user123', 10);
  const now = new Date().toISOString();

  await db.execute({ sql: 'INSERT INTO User (id,name,email,password,phone,role,createdAt) VALUES (?,?,?,?,?,?,?)',
    args: ['admin-driveeasy-001','Admin User','admin@carrental.com', adminHash,'+1-800-555-0001','admin',now] });
  await db.execute({ sql: 'INSERT INTO User (id,name,email,password,phone,role,createdAt) VALUES (?,?,?,?,?,?,?)',
    args: ['user-john-doe-001','John Doe','john@example.com', userHash,'+1-800-555-0100','user',now] });
  console.log('✅ Users created');

  // Cars
  const cars = [
    { name:'Toyota Camry',brand:'Toyota',model:'Camry',year:2023,type:'sedan',transmission:'automatic',seats:5,fuel:'petrol',pricePerDay:45,image:'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',images:JSON.stringify(['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800','https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800','https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800']),description:'The Toyota Camry is a reliable and comfortable mid-size sedan perfect for city and highway driving.',features:JSON.stringify(['Air Conditioning','GPS Navigation','Bluetooth','Backup Camera','Cruise Control','Electric Windows']),rating:4.7,reviews:120,location:'City Center' },
    { name:'BMW 5 Series',brand:'BMW',model:'5 Series',year:2023,type:'luxury',transmission:'automatic',seats:5,fuel:'petrol',pricePerDay:120,image:'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',images:JSON.stringify(['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800','https://images.unsplash.com/photo-1617814065893-00757125efeb?w=800','https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800']),description:'Experience the pinnacle of German engineering with the BMW 5 Series.',features:JSON.stringify(['Heated Seats','Sunroof','Apple CarPlay','Lane Assist','Parking Sensors','Premium Sound System']),rating:4.9,reviews:85,location:'Airport' },
    { name:'Ford Mustang',brand:'Ford',model:'Mustang',year:2022,type:'sports',transmission:'automatic',seats:4,fuel:'petrol',pricePerDay:95,image:'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',images:JSON.stringify(['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800','https://images.unsplash.com/photo-1547744152-14d985cb937f?w=800','https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800']),description:'Feel the thrill of American muscle with the iconic Ford Mustang.',features:JSON.stringify(['Performance Exhaust','Sport Mode','Launch Control','Bluetooth','Backup Camera','Apple CarPlay']),rating:4.8,reviews:64,location:'Downtown' },
    { name:'Honda CR-V',brand:'Honda',model:'CR-V',year:2023,type:'suv',transmission:'automatic',seats:5,fuel:'petrol',pricePerDay:65,image:'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800',images:JSON.stringify(['https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800','https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800','https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800']),description:'The Honda CR-V is the perfect family SUV — spacious, practical, and fuel-efficient.',features:JSON.stringify(['All-Wheel Drive','Roof Rails','Spacious Boot','Air Conditioning','GPS Navigation','Backup Camera']),rating:4.6,reviews:143,location:'City Center' },
    { name:'Tesla Model 3',brand:'Tesla',model:'Model 3',year:2023,type:'sedan',transmission:'automatic',seats:5,fuel:'electric',pricePerDay:89,image:'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',images:JSON.stringify(['https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800','https://images.unsplash.com/photo-1551826152-d7248d9dff52?w=800','https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800']),description:'Drive into the future with the Tesla Model 3. Zero emissions, lightning-fast acceleration.',features:JSON.stringify(['Autopilot','Over-the-Air Updates','Supercharger Access','Glass Roof','Premium Sound','Mobile App Control']),rating:4.9,reviews:211,location:'North Hub' },
    { name:'Mercedes E-Class',brand:'Mercedes',model:'E-Class',year:2023,type:'luxury',transmission:'automatic',seats:5,fuel:'petrol',pricePerDay:150,image:'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',images:JSON.stringify(['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800','https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800','https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800']),description:'The Mercedes E-Class represents the finest in German luxury motoring.',features:JSON.stringify(['Burmester Sound','Massage Seats','Night Vision','Head-Up Display','Air Suspension','Ambient Lighting']),rating:4.9,reviews:56,location:'Airport' },
    { name:'Volkswagen Polo',brand:'Volkswagen',model:'Polo',year:2022,type:'economy',transmission:'manual',seats:5,fuel:'petrol',pricePerDay:30,image:'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',images:JSON.stringify(['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800','https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800','https://images.unsplash.com/photo-1542362567-b07e54358753?w=800']),description:'Budget-friendly without sacrificing quality. Compact, economical, and surprisingly spacious.',features:JSON.stringify(['Air Conditioning','Bluetooth','USB Charging','Electric Windows','Central Locking','Fuel Efficient']),rating:4.4,reviews:89,location:'South Terminal' },
    { name:'Jeep Wrangler',brand:'Jeep',model:'Wrangler',year:2023,type:'suv',transmission:'automatic',seats:4,fuel:'petrol',pricePerDay:85,image:'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',images:JSON.stringify(['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800','https://images.unsplash.com/photo-1564356404954-6f9c80ecef0c?w=800']),description:'Conquer any terrain with the legendary Jeep Wrangler. Built for adventure.',features:JSON.stringify(['4x4 Off-Road','Removable Roof','Skid Plates','Rock Rails','Locking Differentials','Trail Camera']),rating:4.7,reviews:77,location:'North Hub' },
    { name:'Audi A6',brand:'Audi',model:'A6',year:2023,type:'luxury',transmission:'automatic',seats:5,fuel:'petrol',pricePerDay:135,image:'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=800',images:JSON.stringify(['https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=800','https://images.unsplash.com/photo-1591465098978-a9e94e2d36f8?w=800','https://images.unsplash.com/photo-1582513166988-ce218c4cb4b9?w=800']),description:'The Audi A6 combines progressive design with advanced quattro technology.',features:JSON.stringify(['Quattro AWD','Matrix LED Headlights','Virtual Cockpit','Adaptive Cruise','Bang & Olufsen Sound','Wireless Charging']),rating:4.8,reviews:48,location:'Downtown' },
    { name:'Toyota Hiace',brand:'Toyota',model:'Hiace',year:2022,type:'van',transmission:'automatic',seats:12,fuel:'diesel',pricePerDay:110,image:'https://images.unsplash.com/photo-1532974297617-c0f05fe48bff?w=800',images:JSON.stringify(['https://images.unsplash.com/photo-1532974297617-c0f05fe48bff?w=800','https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800','https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=800']),description:'The ultimate people-mover, seating 12 passengers in comfort.',features:JSON.stringify(['12 Passenger Seats','Air Conditioning','USB Charging Ports','Tinted Windows','Central Locking','Luggage Space']),rating:4.5,reviews:32,location:'Airport' },
    { name:'Nissan Patrol',brand:'Nissan',model:'Patrol',year:2023,type:'suv',transmission:'automatic',seats:7,fuel:'petrol',pricePerDay:95,image:'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800',images:JSON.stringify(['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800','https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800','https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800']),description:'The Nissan Patrol is a full-size luxury SUV built for both comfort and serious off-road capability.',features:JSON.stringify(['7 Seats','4x4 Off-Road','Air Suspension','360 Camera','Third Row Folding','Roof Rails']),rating:4.6,reviews:61,location:'City Center' },
    { name:'Hyundai Elantra',brand:'Hyundai',model:'Elantra',year:2022,type:'economy',transmission:'automatic',seats:5,fuel:'petrol',pricePerDay:38,image:'https://images.unsplash.com/photo-1629897048514-3dd7414fe72a?w=800',images:JSON.stringify(['https://images.unsplash.com/photo-1629897048514-3dd7414fe72a?w=800','https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800','https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800']),description:'The Hyundai Elantra offers exceptional value with stylish design and advanced features.',features:JSON.stringify(['Lane Keeping Assist','Forward Collision Warning','Apple CarPlay','Android Auto','Wireless Charging','Smart Cruise']),rating:4.3,reviews:102,location:'South Terminal' },
    { name:'Porsche 911',brand:'Porsche',model:'911',year:2023,type:'sports',transmission:'automatic',seats:2,fuel:'petrol',pricePerDay:280,image:'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',images:JSON.stringify(['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800','https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800','https://images.unsplash.com/photo-1567818735868-e71b99932e29?w=800']),description:'The Porsche 911 is the benchmark sports car delivering spine-tingling performance.',features:JSON.stringify(['Sport Chrono Package','PASM Suspension','Porsche Connect','Sport Exhaust','Carbon Ceramic Brakes','Launch Control']),rating:5.0,reviews:29,location:'Downtown' },
    { name:'Kia Sportage',brand:'Kia',model:'Sportage',year:2023,type:'suv',transmission:'automatic',seats:5,fuel:'petrol',pricePerDay:58,image:'https://images.unsplash.com/photo-1617808906014-e45d3a68c6cc?w=800',images:JSON.stringify(['https://images.unsplash.com/photo-1617808906014-e45d3a68c6cc?w=800','https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800','https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800']),description:'The Kia Sportage redefines value in the compact SUV segment.',features:JSON.stringify(['Panoramic Sunroof','Heated Seats','Wireless CarPlay','Blind Spot Monitor','Rear Cross Traffic Alert','Smart Key']),rating:4.5,reviews:95,location:'North Hub' },
    { name:'Range Rover Sport',brand:'Land Rover',model:'Range Rover Sport',year:2023,type:'luxury',transmission:'automatic',seats:5,fuel:'petrol',pricePerDay:195,image:'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800',images:JSON.stringify(['https://images.unsplash.com/photo-1542362567-b07e54358753?w=800','https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800']),description:'The Range Rover Sport is the definitive luxury performance SUV.',features:JSON.stringify(['Terrain Response','Air Suspension','Pivi Pro Infotainment','Meridian Sound','Electric Deployable Steps','Wade Sensing']),rating:4.9,reviews:41,location:'Airport' },
  ];

  const carIds = [];
  for (const car of cars) {
    const id = uid();
    carIds.push(id);
    await db.execute({
      sql: `INSERT INTO Car (id,name,brand,model,year,type,transmission,seats,fuel,pricePerDay,image,images,description,features,available,rating,reviews,location,mileage,createdAt)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [id,car.name,car.brand,car.model,car.year,car.type,car.transmission,car.seats,car.fuel,car.pricePerDay,car.image,car.images,car.description,car.features,1,car.rating,car.reviews,car.location,'Unlimited',now]
    });
  }
  console.log(`✅ Created ${carIds.length} cars`);

  // Bookings
  const bookings = [
    { carIdx:0, start:'2024-07-10', end:'2024-07-15', days:5, price:5*45, status:'confirmed', pickup:'City Center', dropoff:'Airport', notes:'Airport pickup needed' },
    { carIdx:1, start:'2024-06-01', end:'2024-06-04', days:3, price:3*120, status:'completed', pickup:'Airport', dropoff:'Airport', notes:null },
    { carIdx:2, start:'2024-08-20', end:'2024-08-23', days:3, price:3*95, status:'pending', pickup:'Downtown', dropoff:'Downtown', notes:'Weekend getaway' },
  ];
  for (const b of bookings) {
    await db.execute({
      sql: `INSERT INTO Booking (id,userId,carId,startDate,endDate,totalDays,totalPrice,status,pickupLoc,dropoffLoc,driverName,driverPhone,notes,createdAt)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [uid(),'user-john-doe-001',carIds[b.carIdx],new Date(b.start).toISOString(),new Date(b.end).toISOString(),b.days,b.price,b.status,b.pickup,b.dropoff,'John Doe','+1-800-555-0100',b.notes,now]
    });
  }
  console.log('✅ Created 3 bookings\n');

  // Verify
  const { rows } = await db.execute('SELECT COUNT(*) as c FROM Car');
  console.log(`🎉 Turso ready! ${rows[0].c} cars in database`);
  console.log('   Admin: admin@carrental.com / admin123');
  console.log('   User:  john@example.com / user123');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
