'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CarCard, { CarData } from '@/components/CarCard';

// ─── Stats ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '500+', label: 'Cars' },
  { value: '50k+', label: 'Happy Customers' },
  { value: '15+', label: 'Locations' },
  { value: '24/7', label: 'Support' },
];

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '💰',
    title: 'Best Prices',
    description:
      'We offer the most competitive rates in the market. No hidden fees, no surprises — just great value every time you rent.',
  },
  {
    icon: '🎯',
    title: '24/7 Support',
    description:
      'Our dedicated support team is available around the clock. Whether you need help booking or have an issue on the road, we are here.',
  },
  {
    icon: '⚡',
    title: 'Easy Booking',
    description:
      'Book your perfect car in minutes. Our streamlined process means less time filling forms and more time enjoying the drive.',
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: 'Sarah Johnson',
    initials: 'SJ',
    color: 'bg-purple-500',
    rating: 5,
    text: 'Absolutely seamless experience from start to finish! The car was spotless, the pickup was quick, and the prices were unbeatable. Will definitely rent again.',
  },
  {
    name: 'Michael Chen',
    initials: 'MC',
    color: 'bg-green-500',
    rating: 5,
    text: 'DriveEasy made our road trip incredible. The SUV we rented was in perfect condition and the GPS was already set up. Customer service was top notch!',
  },
  {
    name: 'Emily Rodriguez',
    initials: 'ER',
    color: 'bg-orange-500',
    rating: 4,
    text: 'Great selection of vehicles and very fair pricing. The online booking was super easy and I loved that I could filter by exactly what I needed.',
  },
];

// ─── StarRating ───────────────────────────────────────────────────────────────

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < count ? 'text-amber-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </div>
  );
}

// ─── Homepage ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();

  // Featured cars
  const [featuredCars, setFeaturedCars] = useState<CarData[]>([]);
  const [carsLoading, setCarsLoading] = useState(true);

  // Hero search
  const [location, setLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  // Contact form
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    async function loadFeaturedCars() {
      try {
        const res = await fetch('/api/cars?available=true');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const cars: CarData[] = Array.isArray(data)
          ? data
          : Array.isArray(data.cars)
          ? data.cars
          : [];
        setFeaturedCars(cars.slice(0, 6));
      } catch {
        setFeaturedCars([]);
      } finally {
        setCarsLoading(false);
      }
    }
    loadFeaturedCars();
  }, []);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (pickupDate) params.set('pickup', pickupDate);
    if (returnDate) params.set('return', returnDate);
    router.push(`/cars${params.toString() ? `?${params.toString()}` : ''}`);
  }

  function handleContactSubmit(e: FormEvent) {
    e.preventDefault();
    setContactSent(true);
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  }

  return (
    <div className="flex flex-col">
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 px-4 py-24">
        {/* Background overlay pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white_1px,transparent_1px),radial-gradient(circle_at_80%_20%,white_1px,transparent_1px)] bg-[length:40px_40px]" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
            Find Your Perfect Ride
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Premium car rentals at unbeatable prices. Choose from 500+ vehicles.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link
              href="/cars"
              className="px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-lg"
            >
              Browse Cars
            </Link>
            <a
              href="#about"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors text-lg"
            >
              Learn More
            </a>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 max-w-3xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1 text-left">
                  Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select location</option>
                  <option value="city-center">City Center</option>
                  <option value="airport">Airport</option>
                  <option value="downtown">Downtown</option>
                  <option value="north-hub">North Hub</option>
                  <option value="south-terminal">South Terminal</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1 text-left">
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1 text-left">
                  Return Date
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl md:text-5xl font-extrabold text-blue-600 mb-2">
                {stat.value}
              </p>
              <p className="text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Cars ────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Featured Vehicles</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Hand-picked top-rated cars available for your next adventure
            </p>
          </div>

          {carsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : featuredCars.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-xl">No featured cars available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/cars"
              className="inline-block px-10 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md text-lg"
            >
              View All Cars
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────────────────────────────────────── */}
      <section id="about" className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Why Choose Us</h2>
            <p className="text-gray-500 text-lg">
              We make car rental simple, affordable, and hassle-free
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="text-center p-8 rounded-2xl bg-gray-50 hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-5xl mb-5">{f.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">What Our Customers Say</h2>
            <p className="text-gray-500 text-lg">
              Thousands of happy customers cannot be wrong
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className={`w-12 h-12 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <StarRating count={t.rating} />
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-800 py-20 px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5">
          Ready to hit the road?
        </h2>
        <p className="text-blue-100 text-xl mb-10 max-w-lg mx-auto">
          Join thousands of satisfied customers. Sign up today and get your first rental discount.
        </p>
        <Link
          href="/register"
          className="inline-block px-10 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-lg"
        >
          Sign Up
        </Link>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────────── */}
      <section id="contact" className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Get in Touch</h2>
            <p className="text-gray-500 text-lg">
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              {contactSent ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">✅</div>
                  <p className="text-green-600 font-bold text-xl">Message sent!</p>
                  <p className="text-gray-500 mt-2">We'll get back to you within 24 hours.</p>
                  <button
                    onClick={() => setContactSent(false)}
                    className="mt-6 text-sm text-blue-600 hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your name"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="How can we help?"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Contact Details */}
            <div className="space-y-8 pt-4">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">
                  📍
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Head Office</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    123 Drive Street, City Center<br />
                    New York, NY 10001
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">
                  📞
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Phone</h4>
                  <p className="text-gray-500 text-sm">+1 (800) 555-DRIVE</p>
                  <p className="text-gray-400 text-xs mt-0.5">Available 24/7</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">
                  ✉️
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Email</h4>
                  <p className="text-gray-500 text-sm">support@driveeasy.com</p>
                  <p className="text-gray-400 text-xs mt-0.5">Response within 24 hours</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">
                  🕐
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Business Hours</h4>
                  <p className="text-gray-500 text-sm">Mon – Fri: 8am – 8pm</p>
                  <p className="text-gray-500 text-sm">Sat – Sun: 9am – 6pm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
