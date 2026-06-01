'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

interface Car {
  id: string; name: string; brand: string; model: string; year: number;
  type: string; transmission: string; seats: number; fuel: string;
  pricePerDay: number; image: string; available: boolean; rating: number;
  location: string; description: string; features: string; images: string; mileage: string;
}

interface Booking {
  id: string; status: string; startDate: string; endDate: string;
  totalDays: number; totalPrice: number; createdAt: string;
  user: { name: string; email: string };
  car: { name: string };
}

const EMPTY_CAR = {
  name: '', brand: '', model: '', year: new Date().getFullYear(), type: 'sedan',
  transmission: 'automatic', seats: 5, fuel: 'petrol', pricePerDay: 0,
  image: '', description: '', features: '', available: true, rating: 4.5,
  location: 'City Center', mileage: 'Unlimited',
};

export default function AdminPage() {
  const { user, token, isAdmin, isLoading } = useAuth() as { user: unknown; token: string | null; isAdmin: boolean; isLoading?: boolean };
  const router = useRouter();
  const [tab, setTab] = useState<'overview' | 'cars' | 'bookings'>('overview');
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [carModal, setCarModal] = useState(false);
  const [editCar, setEditCar] = useState<Partial<Car> | null>(null);
  const [carForm, setCarForm] = useState<typeof EMPTY_CAR & { id?: string }>(EMPTY_CAR);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) router.push('/');
  }, [user, isAdmin, isLoading, router]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    const [carsRes, bookingsRes] = await Promise.all([
      fetch('/api/admin/cars', { headers }),
      fetch('/api/admin/bookings', { headers }),
    ]);
    const [carsData, bookingsData] = await Promise.all([carsRes.json(), bookingsRes.json()]);
    setCars(carsData.cars || []);
    setBookings(bookingsData.bookings || []);
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function openAddCar() { setEditCar(null); setCarForm(EMPTY_CAR); setCarModal(true); }
  function openEditCar(car: Car) {
    setEditCar(car);
    setCarForm({ ...car, features: Array.isArray(car.features) ? (car.features as unknown as string[]).join(', ') : car.features });
    setCarModal(true);
  }

  async function saveCar() {
    if (!token) return;
    setSaving(true);
    const payload = {
      ...carForm,
      year: Number(carForm.year),
      seats: Number(carForm.seats),
      pricePerDay: Number(carForm.pricePerDay),
      rating: Number(carForm.rating),
      features: JSON.stringify(String(carForm.features).split(',').map((f: string) => f.trim()).filter(Boolean)),
      images: JSON.stringify([carForm.image, carForm.image, carForm.image]),
    };
    const url = editCar ? `/api/admin/cars/${editCar.id}` : '/api/admin/cars';
    const method = editCar ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
    setSaving(false);
    setCarModal(false);
    fetchData();
  }

  async function deleteCar(id: string) {
    if (!token || !confirm('Delete this car?')) return;
    await fetch(`/api/admin/cars/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchData();
  }

  async function updateBookingStatus(id: string, status: string) {
    if (!token) return;
    await fetch('/api/admin/bookings', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id, status }) });
    fetchData();
  }

  const revenue = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.totalPrice, 0);
  const pending = bookings.filter(b => b.status === 'pending').length;

  if (isLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><div className="text-5xl mb-4 animate-bounce">🛡️</div><p className="text-gray-500">Loading admin panel…</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 py-12 px-4 text-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">🛡️ Admin Panel</h1>
          <p className="text-gray-400 mt-1">Manage cars, bookings, and more</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1 mb-8 w-fit">
          {(['overview', 'cars', 'bookings'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${tab === t ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{t}</button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Cars', value: cars.length, icon: '🚗', color: 'bg-blue-50 border-blue-200' },
              { label: 'Total Bookings', value: bookings.length, icon: '📋', color: 'bg-indigo-50 border-indigo-200' },
              { label: 'Revenue', value: formatCurrency(revenue), icon: '💰', color: 'bg-green-50 border-green-200' },
              { label: 'Pending', value: pending, icon: '⏳', color: 'bg-yellow-50 border-yellow-200' },
            ].map(s => (
              <div key={s.label} className={`bg-white border ${s.color} rounded-2xl p-6`}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Cars */}
        {tab === 'cars' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Cars ({cars.length})</h2>
              <button onClick={openAddCar} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">+ Add Car</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Car</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Price/Day</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cars.map(car => (
                    <tr key={car.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{car.name}</div>
                        <div className="text-gray-400">{car.brand} • {car.year}</div>
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-700">{car.type}</td>
                      <td className="px-4 py-3 font-semibold text-blue-600">{formatCurrency(car.pricePerDay)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${car.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {car.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEditCar(car)} className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">Edit</button>
                          <button onClick={() => deleteCar(car.id)} className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings */}
        {tab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">All Bookings ({bookings.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Car</th>
                    <th className="px-4 py-3 text-left">Dates</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">#{b.id.slice(-6)}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{b.user?.name}</div>
                        <div className="text-gray-400 text-xs">{b.user?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{b.car?.name}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {formatDate(b.startDate)} → {formatDate(b.endDate)}<br />
                        <span className="text-gray-400">{b.totalDays} days</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-blue-600">{formatCurrency(b.totalPrice)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={b.status}
                          onChange={e => updateBookingStatus(b.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full border-0 font-semibold cursor-pointer ${getStatusColor(b.status)}`}
                        >
                          {['pending', 'confirmed', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Car Modal */}
      {carModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">{editCar ? 'Edit Car' : 'Add New Car'}</h2>
              <button onClick={() => setCarModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { key: 'name', label: 'Car Name', type: 'text' },
                { key: 'brand', label: 'Brand', type: 'text' },
                { key: 'model', label: 'Model', type: 'text' },
                { key: 'year', label: 'Year', type: 'number' },
                { key: 'pricePerDay', label: 'Price/Day ($)', type: 'number' },
                { key: 'seats', label: 'Seats', type: 'number' },
                { key: 'image', label: 'Image URL', type: 'text' },
                { key: 'location', label: 'Location', type: 'text' },
                { key: 'rating', label: 'Rating (1-5)', type: 'number' },
                { key: 'mileage', label: 'Mileage', type: 'text' },
              ].map(f => (
                <div key={f.key} className={f.key === 'image' ? 'col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={(carForm as Record<string, unknown>)[f.key] as string}
                    onChange={e => setCarForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>
              ))}
              {[
                { key: 'type', label: 'Type', options: ['sedan', 'suv', 'luxury', 'sports', 'economy', 'van'] },
                { key: 'transmission', label: 'Transmission', options: ['automatic', 'manual'] },
                { key: 'fuel', label: 'Fuel', options: ['petrol', 'diesel', 'electric', 'hybrid'] },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <select value={(carForm as Record<string, unknown>)[f.key] as string} onChange={e => setCarForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                    {f.options.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                  </select>
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma-separated)</label>
                <input type="text" value={carForm.features as string} onChange={e => setCarForm(p => ({ ...p, features: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" placeholder="Air Conditioning, GPS, Bluetooth" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={carForm.description} onChange={e => setCarForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="avail" checked={carForm.available} onChange={e => setCarForm(p => ({ ...p, available: e.target.checked }))} className="accent-blue-600" />
                <label htmlFor="avail" className="text-sm font-medium text-gray-700">Available for booking</label>
              </div>
            </div>
            <div className="p-6 pt-0 flex justify-end gap-3">
              <button onClick={() => setCarModal(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={saveCar} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving…' : editCar ? 'Save Changes' : 'Add Car'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
