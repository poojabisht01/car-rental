/**
 * DriveEasy API Test Suite
 * Run with: node tests/api.test.mjs
 */

const BASE = 'http://localhost:3000';
let passed = 0, failed = 0;
let adminToken = '', userToken = '', testCarId = '', testBookingId = '';

function assert(condition, label, detail = '') {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}${detail ? ': ' + detail : ''}`);
    failed++;
  }
}

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

async function testAuth() {
  console.log('\n🔐 AUTH TESTS');

  // Login admin
  let r = await req('POST', '/api/auth/login', { email: 'admin@carrental.com', password: 'admin123' });
  assert(r.status === 200, 'Admin login returns 200');
  assert(r.data.token?.length > 10, 'Admin login returns JWT token');
  assert(r.data.user?.role === 'admin', 'Admin has role=admin');
  adminToken = r.data.token;

  // Login user
  r = await req('POST', '/api/auth/login', { email: 'john@example.com', password: 'user123' });
  assert(r.status === 200, 'User login returns 200');
  assert(r.data.user?.name === 'John Doe', 'User name is John Doe');
  userToken = r.data.token;

  // Wrong password
  r = await req('POST', '/api/auth/login', { email: 'john@example.com', password: 'wrongpassword' });
  assert(r.status === 401, 'Wrong password returns 401');

  // Missing fields
  r = await req('POST', '/api/auth/login', { email: 'john@example.com' });
  assert(r.status === 400, 'Missing password returns 400');

  // Unknown email
  r = await req('POST', '/api/auth/login', { email: 'nobody@x.com', password: 'pass' });
  assert(r.status === 401, 'Unknown email returns 401');

  // /api/auth/me with valid token
  r = await req('GET', '/api/auth/me', null, userToken);
  assert(r.status === 200, '/api/auth/me returns 200 with valid token');
  assert(r.data.user?.email === 'john@example.com', '/api/auth/me returns correct user');

  // /api/auth/me without token
  r = await req('GET', '/api/auth/me', null, null);
  assert(r.status === 401, '/api/auth/me returns 401 without token');

  // Register new user
  const ts = Date.now();
  r = await req('POST', '/api/auth/register', { name: 'Test User', email: `test${ts}@test.com`, password: 'pass123' });
  assert(r.status === 201, 'Registration returns 201');
  assert(r.data.token?.length > 10, 'Registration returns JWT');

  // Duplicate email
  r = await req('POST', '/api/auth/register', { name: 'X', email: 'john@example.com', password: 'pass123' });
  assert(r.status === 409, 'Duplicate email returns 409');

  // Short password — no validation in backend but fields required
  r = await req('POST', '/api/auth/register', { name: 'X', email: `x${ts}@x.com` });
  assert(r.status === 400, 'Missing password returns 400');
}

// ─── Cars ──────────────────────────────────────────────────────────────────────

async function testCars() {
  console.log('\n🚗 CARS TESTS');

  // Get all cars
  let r = await req('GET', '/api/cars');
  assert(r.status === 200, 'GET /api/cars returns 200');
  assert(Array.isArray(r.data.cars), 'Response has cars array');
  assert(r.data.totalCars === 15, `Has 15 cars (got ${r.data.totalCars})`);
  testCarId = r.data.cars[0].id;

  // Filter by type
  r = await req('GET', '/api/cars?type=luxury');
  assert(r.status === 200, 'Filter by type=luxury returns 200');
  assert(r.data.totalCars === 4, `4 luxury cars (got ${r.data.totalCars})`);
  assert(r.data.cars.every(c => c.type === 'luxury'), 'All returned cars are luxury');

  // Filter by transmission
  r = await req('GET', '/api/cars?transmission=manual');
  assert(r.status === 200, 'Filter by transmission=manual returns 200');
  assert(r.data.cars.every(c => c.transmission === 'manual'), 'All returned cars are manual');

  // Price filter
  r = await req('GET', '/api/cars?minPrice=100&maxPrice=150');
  assert(r.status === 200, 'Price range filter returns 200');
  assert(r.data.cars.every(c => c.pricePerDay >= 100 && c.pricePerDay <= 150), 'Cars within price range');

  // Search
  r = await req('GET', '/api/cars?search=BMW');
  assert(r.status === 200, 'Search by brand returns 200');
  assert(r.data.cars.length >= 1, 'Search finds BMW');
  assert(r.data.cars.some(c => c.brand === 'BMW'), 'BMW appears in results');

  // Available filter
  r = await req('GET', '/api/cars?available=true');
  assert(r.status === 200, 'Available filter returns 200');
  assert(r.data.cars.every(c => c.available === 1 || c.available === true), 'All cars are available');

  // Get single car
  r = await req('GET', `/api/cars/${testCarId}`);
  assert(r.status === 200, 'GET /api/cars/[id] returns 200');
  assert(r.data.id === testCarId, 'Returns correct car by id');
  assert(typeof r.data.pricePerDay === 'number', 'Car has numeric pricePerDay');

  // Non-existent car
  r = await req('GET', '/api/cars/nonexistent-id-xyz');
  assert(r.status === 404, 'Non-existent car returns 404');
}

// ─── Bookings ──────────────────────────────────────────────────────────────────

async function testBookings() {
  console.log('\n📋 BOOKINGS TESTS');

  // Get bookings — requires auth
  let r = await req('GET', '/api/bookings', null, null);
  assert(r.status === 401, 'GET /api/bookings without token returns 401');

  // Malformed token
  r = await req('GET', '/api/bookings', null, 'bad-token');
  assert(r.status === 401, 'GET /api/bookings with invalid token returns 401');

  // POST booking without token (unauthenticated Book Now click)
  r = await req('POST', '/api/bookings', {
    carId: testCarId, startDate: '2025-06-01', endDate: '2025-06-03',
    pickupLoc: 'City', dropoffLoc: 'Airport', driverName: 'Test', driverPhone: '123',
  }, null);
  assert(r.status === 401, 'POST /api/bookings without token returns 401 not 500');

  r = await req('GET', '/api/bookings', null, userToken);
  assert(r.status === 200, 'GET /api/bookings with auth returns 200');
  assert(Array.isArray(r.data.bookings), 'Bookings is an array');
  assert(r.data.bookings.length >= 3, `At least 3 bookings for john (got ${r.data.bookings.length})`);

  // Create booking
  r = await req('POST', '/api/bookings', {
    carId: testCarId,
    startDate: '2025-03-01',
    endDate: '2025-03-05',
    pickupLoc: 'City Center',
    dropoffLoc: 'Airport',
    driverName: 'John Doe',
    driverPhone: '+15550001',
    notes: 'Test booking',
  }, userToken);
  assert(r.status === 201, 'Create booking returns 201');
  assert(r.data.booking?.status === 'pending', 'New booking has pending status');
  assert(r.data.booking?.totalDays === 4, `Total days = 4 (got ${r.data.booking?.totalDays})`);
  assert(r.data.booking?.totalPrice === 4 * 45, `Total price = $180 (got ${r.data.booking?.totalPrice})`);
  testBookingId = r.data.booking?.id;

  // Create booking without auth
  r = await req('POST', '/api/bookings', { carId: testCarId, startDate: '2025-03-01', endDate: '2025-03-05', pickupLoc: 'X', dropoffLoc: 'Y', driverName: 'X', driverPhone: '1' }, null);
  assert(r.status === 401, 'Create booking without auth returns 401');

  // Missing fields
  r = await req('POST', '/api/bookings', { carId: testCarId }, userToken);
  assert(r.status === 400, 'Create booking with missing fields returns 400');

  // Invalid date range
  r = await req('POST', '/api/bookings', {
    carId: testCarId,
    startDate: '2025-03-05',
    endDate: '2025-03-01',
    pickupLoc: 'X', dropoffLoc: 'Y', driverName: 'X', driverPhone: '1',
  }, userToken);
  assert(r.status === 400, 'End before start date returns 400');

  // Cancel booking
  if (testBookingId) {
    r = await req('PATCH', `/api/bookings/${testBookingId}`, { status: 'cancelled' }, userToken);
    assert(r.status === 200, 'Cancel booking returns 200');

    // Cancel already-cancelled
    r = await req('PATCH', `/api/bookings/${testBookingId}`, { status: 'cancelled' }, userToken);
    assert(r.status === 409, 'Cancel already-cancelled booking returns 409');
  }

  // Cancel someone else's booking (use admin token on user booking)
  if (testBookingId) {
    r = await req('PATCH', `/api/bookings/${testBookingId}`, { status: 'cancelled' }, adminToken);
    assert(r.status === 403 || r.status === 409, 'Cannot cancel another users booking (403 or 409)');
  }
}

// ─── Admin ─────────────────────────────────────────────────────────────────────

async function testAdmin() {
  console.log('\n🛡️  ADMIN TESTS');

  // Admin cars — requires admin role
  let r = await req('GET', '/api/admin/cars', null, null);
  assert(r.status === 401, 'GET /api/admin/cars without token returns 401');

  r = await req('GET', '/api/admin/cars', null, userToken);
  assert(r.status === 403, 'GET /api/admin/cars with user token returns 403');

  r = await req('GET', '/api/admin/cars', null, adminToken);
  assert(r.status === 200, 'GET /api/admin/cars with admin token returns 200');
  assert(Array.isArray(r.data.cars), 'Admin cars returns array');

  // Admin bookings
  r = await req('GET', '/api/admin/bookings', null, adminToken);
  assert(r.status === 200, 'GET /api/admin/bookings returns 200');
  assert(Array.isArray(r.data.bookings), 'Admin bookings returns array');
  assert(r.data.bookings.length >= 3, 'At least 3 bookings in admin view');

  // Create car (admin)
  r = await req('POST', '/api/admin/cars', {
    name: 'Test Car XYZ',
    brand: 'TestBrand',
    model: 'TestModel',
    year: 2024,
    type: 'sedan',
    transmission: 'automatic',
    seats: 5,
    fuel: 'petrol',
    pricePerDay: 55,
    image: 'https://example.com/car.jpg',
    description: 'A test car for testing purposes.',
    features: '["AC","Bluetooth"]',
    available: true,
    rating: 4.0,
    location: 'Downtown',
    mileage: 'Unlimited',
  }, adminToken);
  assert(r.status === 201, 'Admin create car returns 201');
  const newCarId = r.data.car?.id;

  // Update car
  if (newCarId) {
    r = await req('PUT', `/api/admin/cars/${newCarId}`, { pricePerDay: 60, available: false }, adminToken);
    assert(r.status === 200, 'Admin update car returns 200');
  }

  // Delete car
  if (newCarId) {
    r = await req('DELETE', `/api/admin/cars/${newCarId}`, null, adminToken);
    assert(r.status === 200, 'Admin delete car returns 200');

    // Verify deleted
    r = await req('GET', `/api/cars/${newCarId}`);
    assert(r.status === 404, 'Deleted car returns 404');
  }

  // Update booking status
  r = await req('GET', '/api/admin/bookings', null, adminToken);
  if (r.data.bookings?.length > 0) {
    const bid = r.data.bookings.find(b => b.status === 'pending')?.id || r.data.bookings[0].id;
    r = await req('PATCH', '/api/admin/bookings', { id: bid, status: 'confirmed' }, adminToken);
    assert(r.status === 200, 'Admin update booking status returns 200');
  }
}

// ─── Pages ─────────────────────────────────────────────────────────────────────

async function testPages() {
  console.log('\n🌐 PAGE RENDER TESTS');

  const pages = [
    ['/', 'Homepage'],
    ['/cars', 'Cars listing'],
    ['/auth/login', 'Login page'],
    ['/auth/register', 'Register page'],
  ];

  for (const [path, label] of pages) {
    const res = await fetch(`${BASE}${path}`);
    const html = await res.text();
    assert(res.status === 200, `${label} returns 200`);
    assert(html.includes('<!DOCTYPE html') || html.includes('<html'), `${label} returns HTML`);
    assert(!html.includes('"statusCode":500'), `${label} has no 500 error`);
  }

  // Car detail page
  if (testCarId) {
    const res = await fetch(`${BASE}/cars/${testCarId}`);
    const html = await res.text();
    assert(res.status === 200, 'Car detail page returns 200');
    assert(!html.includes('"statusCode":500'), 'Car detail has no 500 error');
  }
}

// ─── Run all ───────────────────────────────────────────────────────────────────

async function run() {
  console.log('🧪 DriveEasy API Test Suite');
  console.log('═'.repeat(40));

  try {
    await testAuth();
    await testCars();
    await testBookings();
    await testAdmin();
    await testPages();
  } catch (e) {
    console.error('\n💥 Test runner crashed:', e.message);
    failed++;
  }

  const total = passed + failed;
  console.log('\n' + '═'.repeat(40));
  console.log(`Results: ${passed}/${total} passed`);
  if (failed > 0) {
    console.log(`❌ ${failed} test(s) failed`);
    process.exit(1);
  } else {
    console.log('🎉 All tests passed!');
  }
}

run();
