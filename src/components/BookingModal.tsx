'use client'

import { useState } from 'react'
import { X, Calendar, MapPin, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Car {
  id: string
  name: string
  pricePerDay: number
}

interface BookingModalProps {
  car: Car
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function BookingModal({ car, isOpen, onClose, onSuccess }: BookingModalProps) {
  if (!isOpen) return null
  const { token } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    pickupLoc: '',
    dropoffLoc: '',
    driverName: '',
    driverPhone: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const calcDays = () => {
    if (!formData.startDate || !formData.endDate) return 0
    const diff = Math.ceil(
      (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
    return diff > 0 ? diff : 0
  }

  const days = calcDays()
  const total = days * car.pricePerDay

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      onClose()
      router.push('/auth/login')
      return
    }
    if (days <= 0) {
      setError('Please select valid start and end dates.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          carId: car.id,
          startDate: formData.startDate,
          endDate: formData.endDate,
          pickupLoc: formData.pickupLoc,
          dropoffLoc: formData.dropoffLoc,
          driverName: formData.driverName,
          driverPhone: formData.driverPhone,
          notes: formData.notes,
        }),
      })
      if (res.status === 401) {
        // Stale token — clear it and send user to login
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        onClose()
        router.push('/auth/login')
        return
      }
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || 'Booking failed. Please try again.')
      }
      setSuccess(true)
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-500 mb-6">You need to be logged in to book a car.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <Link href="/auth/login" className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 text-center">Login</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Book {car.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              ${car.pricePerDay} / day
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
            <p className="text-gray-500 mb-6">
              Your booking has been submitted and is pending confirmation.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 text-left text-sm text-gray-700 space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="font-semibold">{days} day{days !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-[#1a56db]">${total.toFixed(2)}</span>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="block w-full py-3 bg-[#1a56db] text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-center"
            >
              View in Dashboard
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
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

            {/* Price preview */}
            {days > 0 && (
              <div className="bg-blue-50 rounded-lg p-3 text-sm flex justify-between">
                <span className="text-gray-600">
                  ${car.pricePerDay} × {days} day{days !== 1 ? 's' : ''}
                </span>
                <span className="font-bold text-[#1a56db]">${total.toFixed(2)}</span>
              </div>
            )}

            {/* Locations */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="pickupLoc"
                    value={formData.pickupLoc}
                    onChange={handleChange}
                    placeholder="City Center"
                    required
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Drop-off Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="dropoffLoc"
                    value={formData.dropoffLoc}
                    onChange={handleChange}
                    placeholder="Airport"
                    required
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Driver info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Phone
                </label>
                <input
                  type="tel"
                  name="driverPhone"
                  value={formData.driverPhone}
                  onChange={handleChange}
                  placeholder="+1 555 0000"
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Any special requests..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a56db] hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Confirm Booking${total > 0 ? ` · $${total.toFixed(2)}` : ''}`
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
