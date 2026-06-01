'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BookingModal from '@/components/BookingModal';
import { formatCurrency } from '@/lib/utils';

const FAKE_REVIEWS = [
  { name: 'Sarah M.', date: 'May 2024', rating: 5, text: 'Absolutely fantastic car! Clean, well-maintained and drove like a dream. Will definitely rent again.' },
  { name: 'James K.', date: 'Apr 2024', rating: 5, text: 'Very smooth rental experience. Pick-up was easy and the car was exactly as described.' },
  { name: 'Priya S.', date: 'Mar 2024', rating: 4, text: 'Great value for money. The car had all the features I needed for my road trip.' },
];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
      ))}
    </span>
  );
}

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  return [];
}

interface Car {
  id: string; name: string; brand: string; model: string; year: number;
  type: string; transmission: string; seats: number; fuel: string;
  pricePerDay: number; image: string; images: unknown; description: string;
  features: unknown; available: number | boolean; rating: number;
  reviews: number; location: string; mileage: string;
}

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'features' | 'reviews'>('overview');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/cars/${id}`)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
      .then(data => { setCar(data); setLoading(false); })
      .catch(() => { router.push('/cars'); });
  }, [id, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🚗</div>
        <p className="text-gray-500">Loading car details…</p>
      </div>
    </div>
  );

  if (!car) return null;

  const images = parseJsonArray(car.images);
  const displayImages = images.length ? images : [car.image, car.image, car.image];
  const features = parseJsonArray(car.features);
  const isAvailable = car.available === true || car.available === 1;

  const specs = [
    { label: 'Year', value: String(car.year) },
    { label: 'Fuel', value: car.fuel },
    { label: 'Transmission', value: car.transmission },
    { label: 'Seats', value: `${car.seats} passengers` },
    { label: 'Location', value: car.location },
    { label: 'Mileage', value: car.mileage },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/cars" className="hover:text-blue-600">Cars</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{car.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main image */}
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-gray-200 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayImages[activeImg] || car.image}
                alt={car.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${car.id}/800/500`; }}
              />
              <div className="absolute top-4 left-4">
                <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">{car.type}</span>
              </div>
              {!isAvailable && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-red-500 text-white font-bold px-6 py-2 rounded-full text-lg">Not Available</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {displayImages.slice(0, 3).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-24 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${activeImg === i ? 'border-blue-600' : 'border-gray-200 hover:border-blue-400'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`View ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${car.id}${i}/400/300`; }}
                  />
                </button>
              ))}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex border-b">
                {(['overview', 'features', 'reviews'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors ${tab === t ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-800'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="p-6">
                {tab === 'overview' && (
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">{car.description}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {specs.map(s => (
                        <div key={s.label} className="bg-gray-50 rounded-xl p-4">
                          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</div>
                          <div className="font-semibold text-gray-900 capitalize">{s.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {tab === 'features' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {features.length ? features.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 bg-green-50 rounded-lg px-4 py-3">
                        <span className="text-green-500 font-bold">✓</span>
                        <span className="text-gray-700 text-sm">{f}</span>
                      </div>
                    )) : <p className="text-gray-500">No features listed.</p>}
                  </div>
                )}
                {tab === 'reviews' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-4xl font-bold text-gray-900">{car.rating}</span>
                      <div>
                        <Stars rating={car.rating} />
                        <p className="text-sm text-gray-500">{car.reviews} reviews</p>
                      </div>
                    </div>
                    {FAKE_REVIEWS.map((r, i) => (
                      <div key={i} className="border rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">{r.name[0]}</div>
                            <div>
                              <div className="font-semibold text-sm text-gray-900">{r.name}</div>
                              <div className="text-xs text-gray-400">{r.date}</div>
                            </div>
                          </div>
                          <Stars rating={r.rating} />
                        </div>
                        <p className="text-sm text-gray-700">{r.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — Booking card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-20">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {formatCurrency(car.pricePerDay)}<span className="text-base font-normal text-gray-400"> / day</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Stars rating={car.rating} />
                <span className="text-sm text-gray-500">({car.reviews} reviews)</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full capitalize">{car.type}</span>
                <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full capitalize">{car.transmission}</span>
                <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">{car.seats} seats</span>
                <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full capitalize">{car.fuel}</span>
              </div>

              {bookingSuccess ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="font-semibold text-green-700 mb-3">Booking placed successfully!</p>
                  <Link href="/dashboard" className="block text-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold">
                    View My Bookings
                  </Link>
                </div>
              ) : isAvailable ? (
                <button
                  onClick={() => setBookingOpen(true)}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-lg shadow-sm"
                >
                  Book Now
                </button>
              ) : (
                <div className="w-full py-3 bg-gray-200 text-gray-500 font-bold rounded-xl text-center text-lg">Not Available</div>
              )}

              <div className="mt-4 text-center">
                <Link href="/cars" className="text-sm text-blue-600 hover:underline">← Back to all cars</Link>
              </div>
              <div className="mt-4 pt-4 border-t text-xs text-gray-400 text-center">
                Need help? <a href="mailto:support@driveeasy.com" className="text-blue-500">Contact support</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        car={car as Parameters<typeof BookingModal>[0]['car']}
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onSuccess={() => { setBookingOpen(false); setBookingSuccess(true); }}
      />
    </div>
  );
}
