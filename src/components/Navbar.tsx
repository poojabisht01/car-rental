'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// ─── Nav links ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Cars', href: '/cars' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logout, isLoading } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (href: string) => {
    if (href.startsWith('#')) return false;
    return href === '/' ? pathname === '/' : pathname.startsWith(href);
  };

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      isActive(href)
        ? 'text-[#1a56db] border-b-2 border-[#1a56db] pb-0.5'
        : 'text-gray-300 hover:text-[#60a5fa]'
    }`;

  const mobileLinkClass = (href: string) =>
    `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(href)
        ? 'bg-blue-900/40 text-[#60a5fa]'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  function handleLogout() {
    logout();
    setMenuOpen(false);
    setDropdownOpen(false);
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl" aria-hidden="true">🚗</span>
            <span className="text-xl font-bold text-[#60a5fa] tracking-tight">
              DriveEasy
            </span>
          </Link>

          {/* ── Desktop nav links ── */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Desktop right side ── */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? null : user ? (
              /* ── Logged-in ── */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-200 hover:bg-gray-700 transition-colors"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#1a56db] text-white text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
                  <span>{user?.name}</span>
                  <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1a56db] transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span>📋</span> My Bookings
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <span>🛡️</span> Admin
                      </Link>
                    )}
                    <div className="my-1 border-t border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span>🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ── Guest ── */
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-lg border border-gray-500 text-sm font-medium text-gray-200 hover:border-[#60a5fa] hover:text-[#60a5fa] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 rounded-lg bg-[#1a56db] text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* ── Mobile menu panel ── */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-3 space-y-1 border-t border-gray-700">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={mobileLinkClass(link.href)}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="h-px bg-gray-700 my-2" />

            {isLoading ? null : user ? (
              <>
                <div className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-200">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#1a56db] text-white text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
                  {user?.name}
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  <span>📋</span> My Bookings
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-purple-400 hover:bg-gray-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>🛡️</span> Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-gray-700 transition-colors"
                >
                  <span>🚪</span> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-4 py-2 rounded-lg border border-gray-600 text-sm font-medium text-gray-300 hover:border-[#60a5fa] hover:text-[#60a5fa] mx-0"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <div className="px-0 pt-1">
                  <Link
                    href="/auth/register"
                    className="block w-full text-center px-4 py-2 rounded-lg bg-[#1a56db] text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
