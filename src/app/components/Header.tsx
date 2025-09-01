'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const nav = [
    { href: '/', label: 'Home' },
    { href: '/dive', label: 'Dive Sites' },
    { href: '/about', label: 'About' },
  ];
  return (
    <div className="dg-header">
      <Link className="dg-brand" href={'/'}>DiveGlobe</Link>
      <nav className="dg-nav">
        {nav.map((n) => {
          const href = n.href;
          const active = pathname?.startsWith(n.href) && n.href !== '/'
            ? 'active'
            : pathname === '/' && n.href === '/'
            ? 'active'
            : '';
          return (
            <Link key={n.href} href={href} className={`dg-nav-link ${active}`}>
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}


