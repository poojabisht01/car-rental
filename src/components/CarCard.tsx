'use client';

import Link from 'next/link';
import { Star, Users, Fuel, Zap, MapPin, Settings2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CarData {
  id: string | number;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  transmission: string;
  seats: number;
  fuel: string;
  pricePerDay: number;
  image: string;
  rating: number;
  reviews: number;
  available: boolean;
  location: string;
}

interface CarCardProps {
  car: CarData;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.floor(rating);
        return (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              filled ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
            }`}
          />
        );
      })}
    </div>
  );
}

function FuelIcon({ fuel }: { fuel: string }) {
  const isElectric = /electric/i.test(fuel);
  return isElectric ? (
    <Zap className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
  ) : (
    <Fuel className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
  );
}

// ─── CarCard ──────────────────────────────────────────────────────────────────

export default function CarCard({ car }: CarCardProps) {
  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200">

      {/* ── Image ── */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-50">
        <img
          src={car.image || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&auto=format&fit=crop&q=80'}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Year chip */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
          {car.year}
        </span>

        {/* Brand badge */}
        <span className="absolute top-3 right-3 bg-[#1a56db]/90 backdrop-blur-sm text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          {car.brand}
        </span>

        {/* Unavailable overlay */}
        {!car.available && (
          <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-sm font-semibold px-4 py-2 rounded-full shadow">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-4">

        {/* Name + price */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
              {car.name}
            </h3>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {car.type}
            </span>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-xl font-bold text-[#1a56db]">${car.pricePerDay}</span>
            <span className="text-xs text-gray-400 block">/day</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <StarRating rating={car.rating} />
          <span className="text-xs text-gray-500">
            {car.rating.toFixed(1)} ({car.reviews} reviews)
          </span>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-4 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Settings2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{car.transmission}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>{car.seats} seats</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <FuelIcon fuel={car.fuel} />
            <span className="truncate">{car.fuel}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{car.location}</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/cars/${car.id}`}
          className={`block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            car.available
              ? 'bg-[#1a56db] text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 pointer-events-none cursor-not-allowed'
          }`}
          aria-disabled={!car.available}
          tabIndex={car.available ? undefined : -1}
        >
          {car.available ? 'View Details' : 'Not Available'}
        </Link>
      </div>
    </div>
  );
}
