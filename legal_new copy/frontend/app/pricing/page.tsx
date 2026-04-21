'use client'
import { Check } from 'lucide-react'
import GlassCard from '@/components/GlassCard'
import Link from 'next/link'

const plans = [
  { name: 'Researcher', price: 'Free', features: ['5 concept searches/day', 'Basic timeline view', 'US jurisdiction', 'Community support'], cta: 'Get Started', href: '/signup', highlight: false },
  { name: 'Professional', price: '$49/mo', features: ['Unlimited searches', 'All visualizations', 'All jurisdictions', 'API access', 'Priority support', 'Export reports'], cta: 'Start Free Trial', href: '/signup', highlight: true },
  { name: 'Enterprise', price: 'Custom', features: ['Everything in Pro', 'Custom models', 'On-premise deployment', 'SLA guarantee', 'Dedicated support', 'Custom integrations'], cta: 'Contact Sales', href: '#', highlight: false },
]

export default function PricingPage() {
  return (
    <div className="section-container pt-28 pb-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4"><span className="gradient-text">Simple Pricing</span></h1>
        <p className="text-white/40 max-w-xl mx-auto">Start free, scale as you grow</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map(plan => (
          <GlassCard key={plan.name} className={`p-8 ${plan.highlight ? 'border-brand-500/30 shadow-lg shadow-brand-500/10' : ''}`}>
            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
            <div className="text-3xl font-bold gradient-text mb-6">{plan.price}</div>
            <ul className="space-y-3 mb-8">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/50">
                  <Check className="w-4 h-4 text-brand-400 flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Link href={plan.href} className={`block text-center py-3 rounded-xl text-sm font-medium transition-all ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}>
              {plan.cta}
            </Link>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
