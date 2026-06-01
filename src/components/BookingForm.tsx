'use client'

import { useState } from 'react'
import { Calendar, MapPin, Phone, Mail, User, Loader2, CheckCircle } from 'lucide-react'

interface BookingFormProps {
  carId: string
  pricePerDay: number
}

export default function BookingForm({ carId, pricePerDay }: BookingFormProps) {
  const [formData, setFormData] = useState({
    pickupLocation: '',
    startDate: '',
    endDate: '',
    name: '',
    email: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const calcDays = () => {
    if (!formData.startDate || !formData.endDate) return 0
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  const days = calcDays()
  const total = days * pricePerDay

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (days <= 0) {
      setError('Please select valid start and end dates.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId,
          startDate: formData.startDate,
          endDate: formData.endDate,
          pickupLocation: formData.pickupLocation,
          totalPrice: total,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || 'Booking failed. Please try again.')
      }
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
        <p className="text-gray-500 mb-1">
          Thank you, <span className="font-semibold text-gray-700">{formData.name}</span>.
        </p>
        <p className="text-gray-500 text-sm">
          A confirmation will be sent to{' '}
          <span className="font-medium text-[#1a56db]">{formData.email}</span>.
        </p>
        <div className="mt-5 bg-gray-50 rounded-xl p-4 text-left text-sm text-gray-700 space-y-1">
          <div className="flex justify-between">
            <span>Duration</span>
            <span className="font-semibold">{days} day{days !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Paid</span>
            <span className="font-bold text-[#1a56db]">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="bg-[#1a56db] px-6 py-4">
        <p className="text-white/80 text-sm">Starting from</p>
        <p className="text-white text-3xl font-bold">
          ${pricePerDay}
          <span className="text-base font-normal text-white/70"> / day</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Pickup Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleChange}
              placeholder="Enter pickup location"
              required
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                min={today}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-2 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                min={formData.startDate || today}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-2 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        {days > 0 && (
          <div className="bg-blue-50 rounded-lg p-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>${pricePerDay} × {days} day{days !== 1 ? 's' : ''}</span>
              <span className="font-semibold text-gray-900">${total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Personal info */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Your Details</p>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name"
              required
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              required
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number"
              required
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#ff6b35] hover:bg-[#e85d28] text-white font-semibold py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Book Now${total > 0 ? ` · $${total.toFixed(2)}` : ''}`
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Free cancellation up to 24 hours before pickup
        </p>
      </form>
    </div>
  )
}
