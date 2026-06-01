'use client';

import { useState, useEffect, useCallback } from 'react';
import CarCard, { CarData } from '@/components/CarCard';

const CAR_TYPES = ['All', 'Sedan', 'SUV', 'Luxury', 'Sports', 'Economy', 'Van'];
const TRANSMISSIONS = ['All', 'Automatic', 'Manual'];
const SORT_OPTIONS = [
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
  { label: 'Name A–Z', value: 'name' },
];

export default function CarsPage() {
  const [cars, setCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [transmission, setTransmission] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState('price_asc');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (type !== 'All') params.set('type', type.toLowerCase());
    if (transmission !== 'All') params.set('transmission', transmission.toLowerCase());
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (availableOnly) params.set('available', 'true');
    try {
      const res = await fetch(`/api/cars?${params.toString()}`);
      const data = await res.json();
      let list: CarData[] = data.cars || [];
      if (sort === 'price_asc') list = list.sort((a, b) => a.pricePerDay - b.pricePerDay);
      else if (sort === 'price_desc') list = list.sort((a, b) => b.pricePerDay - a.pricePerDay);
      else if (sort === 'rating') list = list.sort((a, b) => b.rating - a.rating);
      else if (sort === 'name') list = list.sort((a, b) => a.name.localeCompare(b.name));
      setCars(list);
    } finally {
      setLoading(false);
    }
  }, [search, type, transmission, minPrice, maxPrice, availableOnly, sort]);

  useEffect(() => {
    const t = setTimeout(fetchCars, 300);
    return () => clearTimeout(t);
  }, [fetchCars]);

  function clearFilters() {
    setSearch(''); setType('All'); setTransmission('All');
    setMinPrice(''); setMaxPrice(''); setAvailableOnly(false); setSort('price_asc');
  }

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Brand or model…"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Car Type</label>
        <div className="space-y-1">
          {CAR_TYPES.map(t => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="type" checked={type === t} onChange={() => setType(t)} className="accent-blue-600" />
              <span className="text-sm text-gray-700">{t}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Transmission</label>
        <div className="space-y-1">
          {TRANSMISSIONS.map(t => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="trans" checked={transmission === t} onChange={() => setTransmission(t)} className="accent-blue-600" />
              <span className="text-sm text-gray-700">{t}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Day ($)</label>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" />
          <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" />
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)} className="accent-blue-600 w-4 h-4" />
          <span className="text-sm font-semibold text-gray-700">Available Only</span>
        </label>
      </div>
      <button onClick={clearFilters} className="w-full py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
        Clear Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-700 py-12 px-4 text-center text-white">
        <h1 className="text-4xl font-bold mb-2">Browse Our Fleet</h1>
        <p className="text-blue-200">Choose from our wide selection of premium vehicles</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Filters</h2>
              <FilterPanel />
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter toggle + sort bar */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium shadow-sm"
                  onClick={() => setFiltersOpen(o => !o)}
                >
                  <span>⚙️</span> Filters
                </button>
                <span className="text-sm text-gray-500">{loading ? 'Loading…' : `${cars.length} car${cars.length !== 1 ? 's' : ''} found`}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sort:</label>
                <select value={sort} onChange={e => setSort(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Mobile filters panel */}
            {filtersOpen && (
              <div className="lg:hidden bg-white rounded-xl shadow-sm p-6 mb-4">
                <FilterPanel />
              </div>
            )}

            {/* Car grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-80 animate-pulse shadow-sm">
                    <div className="h-48 bg-gray-200 rounded-t-xl" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🚫</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No cars found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters</p>
                <button onClick={clearFilters} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {cars.map(car => <CarCard key={car.id} car={car} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
