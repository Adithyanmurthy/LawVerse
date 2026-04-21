'use client'

import Link from 'next/link'
import { Scale, Github, Twitter, Linkedin, Mail } from 'lucide-react'

const footerLinks = {
  Platform: [
    { label: 'Search', href: '/search' },
    { label: 'Timeline', href: '/timeline' },
    { label: 'Citation Network', href: '/network' },
    { label: 'SMI Dashboard', href: '/smi' },
    { label: 'Impact Analysis', href: '/impact' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'GDPR', href: '#' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Status', href: '#' },
    { label: 'Changelog', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-navy-950">
      <div className="section-container py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-blue-600 flex items-center justify-center">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">LCET</span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed mb-6">
              AI-powered legal concept evolution tracking across 80+ countries and 6 legal system families.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Github, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/40 hover:text-white/80 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} LCET. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-white/30">Tracking legal evolution across 80+ countries</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-white/40">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
