import Link from 'next/link';

// ─── Data ──────────────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Cars', href: '/cars' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

const SUPPORT_LINKS = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Help Center', href: '/help' },
];

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://facebook.com' },
  { label: 'Twitter', href: 'https://twitter.com' },
  { label: 'Instagram', href: 'https://instagram.com' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-gray-400 text-sm hover:text-[#60a5fa] transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#111827' }} className="text-gray-300">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Brand column ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl" aria-hidden="true">🚗</span>
              <span className="text-xl font-bold text-white tracking-tight">DriveEasy</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-5">
              Your journey, our promise. Premium cars, transparent pricing, and seamless bookings — every time.
            </p>
            {/* Social icons as text links */}
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 text-sm font-medium hover:text-[#60a5fa] transition-colors"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <FooterLinkColumn title="Quick Links" links={QUICK_LINKS} />

          {/* ── Support ── */}
          <FooterLinkColumn title="Support" links={SUPPORT_LINKS} />

          {/* ── Contact Info ── */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Contact Info
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a
                  href="mailto:info@driveeasy.com"
                  className="flex items-start gap-2 hover:text-[#60a5fa] transition-colors"
                >
                  <span className="mt-0.5 flex-shrink-0" aria-hidden="true">✉️</span>
                  info@driveeasy.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+18003748332"
                  className="flex items-start gap-2 hover:text-[#60a5fa] transition-colors"
                >
                  <span className="mt-0.5 flex-shrink-0" aria-hidden="true">📞</span>
                  +1-800-DRIVE-EASY
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0" aria-hidden="true">📍</span>
                <span>123 Auto Street</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm text-center sm:text-left">
            &copy; 2024 DriveEasy. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="text-gray-500 text-xs hover:text-[#60a5fa] transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-gray-500 text-xs hover:text-[#60a5fa] transition-colors">
              Privacy
            </Link>
            <Link href="/cookies" className="text-gray-500 text-xs hover:text-[#60a5fa] transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
