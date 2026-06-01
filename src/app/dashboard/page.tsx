'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

interface Booking {
  id: string;
  carId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: string;
  pickupLoc: string;
  dropoffLoc: string;
  driverName: string;
  createdAt: string;
  car: {
    id: string;
    name: string;
    image: string;
    pricePerDay: number;
    type: string;
  };
}

export default function DashboardPage() {
  const { user, token, isLoading } = useAuth() as { user: unknown; token: string | null; isLoading?: boolean };
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push('/auth/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!token) return;
    fetch('/api/bookings', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setBookings(data.bookings || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  async function cancelBooking(id: string) {
    if (!token) return;
    setCancelling(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      }
    } finally {
      setCancelling(null);
    }
  }

  const stats = {
    total: bookings.length,
    active: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  const typedUser = user as { name: string } | null;

  if (isLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><div className="text-5xl mb-4 animate-bounce">🚗</div><p className="text-gray-500">Loading dashboard…</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-700 py-12 px-4 text-white">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-blue-200 mt-1">Welcome back, {typedUser?.name || 'User'}!</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Bookings', value: stats.total, color: 'bg-blue-50 text-blue-700' },
            { label: 'Active', value: stats.active, color: 'bg-green-50 text-green-700' },
            { label: 'Completed', value: stats.completed, color: 'bg-indigo-50 text-indigo-700' },
            { label: 'Cancelled', value: stats.cancelled, color: 'bg-red-50 text-red-700' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-sm font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">My Bookings</h2>
            <Link href="/cars" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">+ New Booking</Link>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings yet</h3>
              <p className="text-gray-500 mb-4">Browse our fleet and make your first booking!</p>
              <Link href="/cars" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block font-semibold">Browse Cars</Link>
            </div>
          ) : (
            <div className="divide-y">
              {bookings.map(booking => (
                <div key={booking.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 hover:bg-gray-50 transition-colors">
                  {/* Car image placeholder */}
                  <div className="w-full sm:w-32 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl">
                    🚗
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-bold text-gray-900">{booking.car?.name || 'Car'}</h3>
                        <p className="text-sm text-gray-500 capitalize">{booking.car?.type}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div><span className="text-gray-400">From</span><div className="font-medium">{formatDate(booking.startDate)}</div></div>
                      <div><span className="text-gray-400">To</span><div className="font-medium">{formatDate(booking.endDate)}</div></div>
                      <div><span className="text-gray-400">Days</span><div className="font-medium">{booking.totalDays}</div></div>
                      <div><span className="text-gray-400">Total</span><div className="font-bold text-blue-600">{formatCurrency(booking.totalPrice)}</div></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      📍 {booking.pickupLoc} → {booking.dropoffLoc}
                    </div>
                  </div>
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        disabled={cancelling === booking.id}
                        className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {cancelling === booking.id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
