'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, Scale, Search, Clock, BarChart3, Bell, BookOpen } from 'lucide-react'

const platformLinks = [
  { href: '/search', label: 'Search', icon: Search, desc: 'Find legal concepts' },
  { href: '/timeline', label: 'Timeline', icon: Clock, desc: 'Evolution over time' },
  { href: '/smi', label: 'SMI Dashboard', icon: BarChart3, desc: 'Semantic metrics' },
  { href: '/cases', label: 'Case Library', icon: BookOpen, desc: 'Browse Indian cases' },
  { href: '/alerts', label: 'Alerts', icon: Bell, desc: 'Real-time drift' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [platformOpen, setPlatformOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('lcet_token'))
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const isLanding = pathname === '/'

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-navy-950/70 backdrop-blur-2xl border-b border-white/[0.04] shadow-2xl shadow-black/20'
          : 'bg-transparent'
      }`}>
      <div className="section-container">
        <div className="flex items-center justify-between h-18 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div whileHover={{ scale: 1.05, rotate: 5 }} transition={{ type: 'spring', stiffness: 400 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-blue-600 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-shadow">
              <Scale className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-white tracking-tight">LCET</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {isLanding && (
              <>
                <a href="#features" className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors duration-200">Features</a>
                <a href="#how-it-works" className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors duration-200">How It Works</a>
                <a href="#pricing" className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors duration-200">Pricing</a>
              </>
            )}

            {/* Platform dropdown */}
            <div className="relative" onMouseEnter={() => setPlatformOpen(true)} onMouseLeave={() => setPlatformOpen(false)}>
              <button className="flex items-center gap-1.5 px-4 py-2 text-sm text-white/50 hover:text-white transition-colors duration-200">
                Platform
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${platformOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {platformOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-navy-900/90 backdrop-blur-2xl border border-white/[0.06] rounded-2xl p-2 shadow-2xl shadow-black/40">
                    {platformLinks.map(link => {
                      const Icon = link.icon
                      return (
                        <Link key={link.href} href={link.href}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 group ${
                            pathname === link.href
                              ? 'bg-brand-500/15 text-brand-400'
                              : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                          }`}>
                          <div className="w-9 h-9 rounded-lg bg-white/[0.04] group-hover:bg-white/[0.08] flex items-center justify-center transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium">{link.label}</div>
                            <div className="text-xs text-white/25">{link.desc}</div>
                          </div>
                        </Link>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {loggedIn ? (
              <button onClick={() => { localStorage.removeItem('lcet_token'); setLoggedIn(false); window.location.href = '/' }}
                className="px-5 py-2.5 text-sm text-white/60 hover:text-white transition-colors duration-200">
                Log Out
              </button>
            ) : (
              <>
                <Link href="/login" className="px-5 py-2.5 text-sm text-white/60 hover:text-white transition-colors duration-200">
                  Log In
                </Link>
                <Link href="/signup"
                  className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40">
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-white/60 hover:text-white transition-colors" aria-label="Toggle menu">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:hidden bg-navy-950/95 backdrop-blur-2xl border-t border-white/[0.04] overflow-hidden">
            <div className="section-container py-6 space-y-1">
              {isLanding && (
                <>
                  <a href="#features" className="block px-4 py-3 text-white/50 hover:text-white rounded-xl hover:bg-white/[0.04] transition-all">Features</a>
                  <a href="#how-it-works" className="block px-4 py-3 text-white/50 hover:text-white rounded-xl hover:bg-white/[0.04] transition-all">How It Works</a>
                  <a href="#pricing" className="block px-4 py-3 text-white/50 hover:text-white rounded-xl hover:bg-white/[0.04] transition-all">Pricing</a>
                </>
              )}
              <div className="border-t border-white/[0.04] pt-3 mt-3">
                <div className="text-xs text-white/20 uppercase tracking-wider px-4 mb-2">Platform</div>
                {platformLinks.map(link => {
                  const Icon = link.icon
                  return (
                    <Link key={link.href} href={link.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                        pathname === link.href ? 'bg-brand-500/15 text-brand-400' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                      }`}>
                      <Icon className="w-4 h-4" /> {link.label}
                    </Link>
                  )
                })}
              </div>
              <div className="border-t border-white/[0.04] pt-4 mt-3 flex gap-3">
                <Link href="/login" className="btn-secondary flex-1 text-center text-sm py-3">Log In</Link>
                <Link href="/signup" className="btn-primary flex-1 text-center text-sm py-3">Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
