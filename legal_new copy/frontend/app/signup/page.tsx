'use client'
import { useState } from 'react'
import Link from 'next/link'
import { register, login } from '@/lib/api'
import { Scale } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(email, password, name)
      const data = await login(email, password)
      localStorage.setItem('lcet_token', data.access_token)
      window.location.href = '/search'
    } catch { setError('Registration failed. Email may already be in use.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-8 w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-blue-600 flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">LCET</span>
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Create account</h2>
        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name"
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-brand-500/30" />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-brand-500/30" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-brand-500/30" />
          <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-sm disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-white/30 text-sm mt-6">Already have an account? <Link href="/login" className="text-brand-400 hover:text-brand-300">Log in</Link></p>
      </div>
    </div>
  )
}
