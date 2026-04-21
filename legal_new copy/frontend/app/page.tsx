'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import {
  Search, Clock, Network, BarChart3, Zap, GitCompare, Bell, Globe,
  ArrowRight, Check, ChevronDown, Users, Building2,
  GraduationCap, Briefcase, TrendingUp, Sparkles, Shield, Brain,
  MessageSquare, FileText, Star
} from 'lucide-react'
import ScrollReveal from '@/components/ScrollReveal'
import GlassCard from '@/components/GlassCard'
import AnimatedBackground from '@/components/AnimatedBackground'

const Scene3D = dynamic(() => import('@/components/Scene3D'), { ssr: false })
const FeatureScene = dynamic(() => import('@/components/FeatureScene'), { ssr: false })

export default function Home() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <>
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <AnimatedBackground />

        {/* 3D Scene */}
        <Suspense fallback={null}>
          <Scene3D className="opacity-60" />
        </Suspense>

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }}
          className="section-container relative z-10 pt-32 pb-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] text-brand-400 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Legal Intelligence Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.div>

            {/* Main heading */}
            <motion.h1 initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-[1.05] mb-8 tracking-tight">
              Track How Legal{' '}
              <br className="hidden sm:block" />
              Concepts{' '}
              <span className="relative inline-block">
                <span className="gradient-text">Evolve</span>
                <motion.span
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full origin-left"
                />
              </span>
              {' '}Over Time
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
              Our custom 350M-parameter neural language model analyzes how legal meanings
              shift across decades, jurisdictions, and 80+ countries worldwide.
            </motion.p>

            {/* Search bar */}
            <motion.form onSubmit={handleSearch}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
              className="max-w-2xl mx-auto mb-16">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-700" />
                <div className="relative flex items-center bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden focus-within:border-brand-500/30 transition-all duration-300">
                  <Search className="w-5 h-5 text-white/25 ml-6" />
                  <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="Search legal concepts — privacy, due process, free speech..."
                    className="flex-1 bg-transparent px-4 py-5 text-white placeholder-white/25 focus:outline-none text-lg" />
                  <button type="submit"
                    className="mr-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-medium px-7 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40">
                    Analyze
                  </button>
                </div>
              </div>
            </motion.form>

            {/* Stats row */}
            <motion.div initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
              {[
                { value: '80+', label: 'Countries Covered', icon: Globe },
                { value: '350M', label: 'Model Parameters', icon: Brain },
                { value: '6', label: 'Legal System Families', icon: Shield },
                { value: '24/7', label: 'Real-time Monitoring', icon: Bell },
              ].map((stat, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
                  className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent rounded-2xl" />
                  <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-2xl p-4 sm:p-5 text-center hover:border-white/[0.1] transition-all duration-300">
                    <stat.icon className="w-5 h-5 text-brand-400/60 mx-auto mb-2" />
                    <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                    <div className="text-xs text-white/30">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-white/20 tracking-widest uppercase">Scroll</span>
            <ChevronDown className="w-5 h-5 text-white/20" />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════ FEATURES WITH 3D ═══════════════════ */}
      <section id="features" className="py-32 relative">
        <AnimatedBackground />
        <div className="section-container relative z-10">
          <ScrollReveal>
            <div className="text-center mb-20">
              <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium tracking-wider uppercase mb-6">
                Platform Features
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                Everything You Need for{' '}
                <span className="gradient-text">Legal Analysis</span>
              </h2>
              <p className="text-white/40 max-w-2xl mx-auto text-lg leading-relaxed">
                From semantic drift detection to cross-jurisdictional comparison,
                LCET provides the tools legal professionals need.
              </p>
            </div>
          </ScrollReveal>

          {/* Feature showcase with 3D */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <ScrollReveal direction="left">
              <GlassCard className="p-8 sm:p-10 h-full" glowColor="rgba(51,102,255,0.1)">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-500/5 flex items-center justify-center border border-brand-500/10">
                    <TrendingUp className="w-6 h-6 text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Semantic Drift Detection</h3>
                    <p className="text-sm text-white/30">Proprietary SMI Scoring</p>
                  </div>
                </div>
                <p className="text-white/40 leading-relaxed mb-6">
                  Track how legal terms change meaning over decades using our proprietary
                  Semantic Meaning Index. Quantify concept evolution with confidence scores.
                </p>
                <Suspense fallback={<div className="w-full h-64 bg-white/[0.02] rounded-xl animate-pulse" />}>
                  <FeatureScene color="#3366ff" />
                </Suspense>
              </GlassCard>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <GlassCard className="p-8 sm:p-10 h-full" glowColor="rgba(139,92,246,0.1)">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center border border-purple-500/10">
                    <Network className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Citation Networks</h3>
                    <p className="text-sm text-white/30">Interactive Force Graphs</p>
                  </div>
                </div>
                <p className="text-white/40 leading-relaxed mb-6">
                  Visualize precedent relationships through force-directed graphs.
                  See how landmark cases influence legal doctrine across jurisdictions.
                </p>
                <Suspense fallback={<div className="w-full h-64 bg-white/[0.02] rounded-xl animate-pulse" />}>
                  <FeatureScene color="#8b5cf6" />
                </Suspense>
              </GlassCard>
            </ScrollReveal>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Clock, title: 'Evolution Timeline', desc: 'Interactive timelines showing concept evolution with key cases and drift scores.', color: 'from-blue-500/20 to-blue-500/5', iconColor: 'text-blue-400' },
              { icon: GitCompare, title: 'Cross-Jurisdictional', desc: 'Compare how the same concept is interpreted across different countries.', color: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-400' },
              { icon: Zap, title: 'Impact Analysis', desc: 'Measure downstream impact of landmark cases on legal doctrine.', color: 'from-amber-500/20 to-amber-500/5', iconColor: 'text-amber-400' },
              { icon: Bell, title: 'Real-time Alerts', desc: 'Get notified instantly when significant semantic drift is detected.', color: 'from-rose-500/20 to-rose-500/5', iconColor: 'text-rose-400' },
            ].map((f, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <GlassCard className="p-7 h-full" hover3D>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-b ${f.color} flex items-center justify-center mb-5 border border-white/[0.05]`}>
                    <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-white/35 leading-relaxed">{f.desc}</p>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ AI CHAT SHOWCASE ═══════════════════ */}
      <section className="py-32 relative overflow-hidden">
        <div className="section-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium tracking-wider uppercase mb-6">
                Internet-Powered
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
                Legal Research{' '}
                <span className="gradient-text">Never Been Easier</span>
              </h2>
              <p className="text-white/40 text-lg leading-relaxed mb-8">
                Have a conversation with your AI legal assistant. Gain insights and
                simple answers to complex legal questions in real-time. Powered by
                our custom-trained NLM with deep legal understanding.
              </p>
              <div className="space-y-4">
                {[
                  'Rapid analysis completing hours of research in seconds',
                  'Summarize agreements, translate documents instantly',
                  'Track concept evolution across 80+ countries',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-brand-400" />
                    </div>
                    <span className="text-white/50 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              {/* Chat mockup */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-2xl" />
                <GlassCard className="p-6 relative" hover3D={false}>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.06]">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-blue-600 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">LCET Assistant</div>
                      <div className="text-xs text-emerald-400 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <div className="bg-brand-500/20 border border-brand-500/10 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                        <p className="text-sm text-white/80">How has the concept of &quot;privacy&quot; evolved in US law since 1960?</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                        <p className="text-sm text-white/60 leading-relaxed">
                          The concept of &quot;privacy&quot; has undergone significant expansion since 1960.
                          The SMI score shows a drift of <span className="text-brand-400 font-medium">7.2/10</span> (major expansion).
                          Key inflection points include <span className="text-brand-400">Griswold v. Connecticut (1965)</span> and
                          <span className="text-brand-400"> Carpenter v. United States (2018)</span>...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                        <span className="text-sm text-white/20">Ask about any legal concept...</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ WHO IS IT FOR ═══════════════════ */}
      <section className="py-32 relative">
        <AnimatedBackground />
        <div className="section-container relative z-10">
          <ScrollReveal>
            <div className="text-center mb-20">
              <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium tracking-wider uppercase mb-6">
                Built For Everyone In Law
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                Who is <span className="gradient-text">LCET</span> for?
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: 'Legal Consumers', desc: 'From deciphering complex terms to understanding rights, we\'ve got you covered. Plain-language insights for everyone.', gradient: 'from-emerald-500 to-teal-600' },
              { icon: GraduationCap, title: 'Law Students', desc: 'Research concept evolution for papers and exams. Visualize how landmark cases shaped modern law.', gradient: 'from-blue-500 to-indigo-600' },
              { icon: Briefcase, title: 'Law Firms', desc: 'Strengthen arguments with data-driven concept analysis. Track precedent shifts across jurisdictions.', gradient: 'from-purple-500 to-violet-600' },
              { icon: Building2, title: 'Enterprise & Gov', desc: 'Monitor regulatory evolution at scale. Compliance tracking across 80+ countries with real-time alerts.', gradient: 'from-amber-500 to-orange-600' },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.12}>
                <GlassCard className="p-8 text-center h-full" hover3D>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-6 shadow-lg`}
                    style={{ boxShadow: `0 8px 32px rgba(0,0,0,0.3)` }}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-white/35 leading-relaxed">{item.desc}</p>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ WHY BETTER ═══════════════════ */}
      <section className="py-32 relative">
        <div className="section-container relative z-10">
          <ScrollReveal>
            <div className="text-center mb-20">
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium tracking-wider uppercase mb-6">
                Why LCET
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                Why our AI in law is{' '}
                <span className="gradient-text">better</span>?
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Shield, title: 'Private', desc: 'We stand firm on privacy, ensuring that users\' data remains secure and anonymous. GDPR compliant.' },
              { icon: Zap, title: 'Fast', desc: 'The fastest legal concept analysis service. Get results in seconds, not hours.' },
              { icon: Globe, title: '80+ Countries', desc: 'Global coverage across 6 legal system families. From common law to civil law jurisdictions.' },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <GlassCard className="p-8 h-full" hover3D>
                  <item.icon className="w-8 h-8 text-brand-400 mb-5" />
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-white/35 leading-relaxed">{item.desc}</p>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>

          {/* Stats bar */}
          <ScrollReveal>
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600/20 via-purple-600/20 to-cyan-600/20" />
              <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-xl" />
              <div className="relative grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06] p-2">
                {[
                  { icon: FileText, value: '5 Seconds', label: 'To summarize any document' },
                  { value: '75%', label: 'Time saved on routine tasks' },
                  { value: '90%', label: 'Cost reduction in legal research' },
                ].map((s, i) => (
                  <div key={i} className="text-center py-8 px-6">
                    <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">{s.value}</div>
                    <div className="text-sm text-white/40">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════ HOW TO USE ═══════════════════ */}
      <section id="how-it-works" className="py-32 relative">
        <AnimatedBackground />
        <div className="section-container relative z-10">
          <ScrollReveal>
            <div className="text-center mb-20">
              <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium tracking-wider uppercase mb-6">
                How To Use
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                How to use{' '}
                <span className="gradient-text">LCET</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Search a Concept', desc: 'Enter any legal concept and our NLM analyzes millions of documents across 80+ countries instantly.' },
              { step: '02', title: 'Explore Evolution', desc: 'View interactive 3D timelines, citation networks, and drift scores showing how meaning has shifted.' },
              { step: '03', title: 'Compare & Act', desc: 'Compare across jurisdictions, set real-time alerts, and export professional reports.' },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div className="relative text-center group">
                  <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white/[0.06] to-transparent mb-6 select-none">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-white/35 leading-relaxed">{item.desc}</p>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-12 -right-4">
                      <ArrowRight className="w-6 h-6 text-white/10" />
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ GLOBAL COVERAGE ═══════════════════ */}
      <section className="py-32 relative">
        <div className="section-container relative z-10">
          <ScrollReveal>
            <div className="text-center mb-20">
              <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium tracking-wider uppercase mb-6">
                Global Reach
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                Covering{' '}
                <span className="gradient-text">80+ Countries</span>
              </h2>
              <p className="text-white/40 max-w-2xl mx-auto text-lg">
                Data sourced from the world&apos;s leading legal databases, updated continuously.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { region: 'United States', source: 'CourtListener + Harvard', flag: '🇺🇸' },
              { region: 'Europe (46)', source: 'HUDOC / ECHR', flag: '🇪🇺' },
              { region: 'EU (27)', source: 'EUR-Lex', flag: '🏛️' },
              { region: 'United Kingdom', source: 'National Archives', flag: '🇬🇧' },
              { region: 'India', source: 'Indian Kanoon + LiveLaw', flag: '🇮🇳' },
              { region: 'Africa (16+)', source: 'AfricaLII', flag: '🌍' },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <GlassCard className="p-6 text-center h-full" hover3D>
                  <div className="text-4xl mb-4">{item.flag}</div>
                  <h4 className="text-sm font-semibold text-white mb-1">{item.region}</h4>
                  <p className="text-xs text-white/25">{item.source}</p>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      <section className="py-32 relative">
        <AnimatedBackground />
        <div className="section-container relative z-10">
          <ScrollReveal>
            <div className="text-center mb-20">
              <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium tracking-wider uppercase mb-6">
                Testimonials
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                What our users{' '}
                <span className="gradient-text">think</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Sarah Chen', role: 'Partner, Chen & Associates', text: 'LCET transformed how we prepare for cases. The concept evolution timeline saved us hundreds of hours of research.', stars: 5 },
              { name: 'Prof. James Wright', role: 'Harvard Law School', text: 'An indispensable tool for academic research. The cross-jurisdictional comparison feature is groundbreaking.', stars: 5 },
              { name: 'Priya Sharma', role: 'Legal Analyst, Deloitte', text: 'The real-time drift alerts keep our compliance team ahead of regulatory changes across all our markets.', stars: 5 },
            ].map((t, i) => (
              <ScrollReveal key={i} delay={i * 0.12}>
                <GlassCard className="p-8 h-full" hover3D>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-white/50 leading-relaxed mb-6 text-sm">&quot;{t.text}&quot;</p>
                  <div>
                    <div className="text-sm font-medium text-white">{t.name}</div>
                    <div className="text-xs text-white/30">{t.role}</div>
                  </div>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PRICING ═══════════════════ */}
      <section id="pricing" className="py-32 relative">
        <div className="section-container relative z-10">
          <ScrollReveal>
            <div className="text-center mb-20">
              <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium tracking-wider uppercase mb-6">
                Pricing
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                Plans for Every{' '}
                <span className="gradient-text">Legal Need</span>
              </h2>
              <p className="text-white/40 max-w-xl mx-auto text-lg">
                Start free. Scale as you grow. No hidden fees.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter', price: 'Free', period: 'forever',
                desc: 'For students and individual researchers',
                features: ['50 searches/month', 'Basic timeline view', '3 concept alerts', 'Single jurisdiction', 'Community support'],
                cta: 'Get Started Free', popular: false,
              },
              {
                name: 'Professional', price: '$49', period: '/month',
                desc: 'For practicing lawyers and small firms',
                features: ['Unlimited searches', 'Full timeline & network', 'Unlimited alerts', 'All jurisdictions', 'PDF/CSV export', 'Priority support', 'API access (1K calls/mo)'],
                cta: 'Start Free Trial', popular: true,
              },
              {
                name: 'Enterprise', price: 'Custom', period: '',
                desc: 'For large firms and government agencies',
                features: ['Everything in Professional', 'Unlimited API access', 'Custom model training', 'SSO & SAML', 'Dedicated account manager', 'SLA guarantee', 'On-premise deployment'],
                cta: 'Contact Sales', popular: false,
              },
            ].map((plan, i) => (
              <ScrollReveal key={i} delay={i * 0.12}>
                <div className={`relative rounded-3xl overflow-hidden h-full ${plan.popular ? 'ring-2 ring-brand-500/30' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-cyan-500" />
                  )}
                  <GlassCard className={`p-8 h-full ${plan.popular ? 'bg-gradient-to-b from-brand-500/[0.06] to-transparent' : ''}`} hover3D>
                    {plan.popular && (
                      <span className="inline-block px-3 py-1 bg-brand-500 text-white text-xs font-medium rounded-full mb-4">
                        Most Popular
                      </span>
                    )}
                    <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                    <p className="text-sm text-white/30 mb-5">{plan.desc}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-white/30 text-sm">{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2.5 text-sm text-white/50">
                          <Check className="w-4 h-4 text-brand-400 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Link href="/signup"
                      className={`block text-center py-3.5 rounded-xl font-medium transition-all ${
                        plan.popular
                          ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40'
                          : 'bg-white/[0.05] text-white border border-white/[0.08] hover:bg-white/[0.08]'
                      }`}>
                      {plan.cta}
                    </Link>
                  </GlassCard>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FAQ ═══════════════════ */}
      <section className="py-32 relative">
        <AnimatedBackground />
        <div className="section-container relative z-10">
          <ScrollReveal>
            <div className="text-center mb-20">
              <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium tracking-wider uppercase mb-6">
                Have A Question?
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Frequently Asked{' '}
                <span className="gradient-text">Questions</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: 'Who is your platform for?', a: 'LCET is built for legal consumers, law students, practicing lawyers, law firms, and enterprise/government organizations. Anyone who needs to understand how legal concepts evolve over time.' },
              { q: 'What countries/languages does it work for?', a: 'LCET covers 80+ countries through data sources including CourtListener (US), Harvard Caselaw (US), HUDOC/ECHR (46 European countries), EUR-Lex (27 EU countries), UK National Archives, Indian Kanoon, LiveLaw (India), and AfricaLII (16+ African countries). We support English, with multi-language support coming soon.' },
              { q: 'How to start using LCET?', a: 'Simply create a free account, choose your role (consumer, student, firm, or enterprise), and start searching for any legal concept. Our AI will analyze millions of documents and show you how that concept has evolved.' },
              { q: 'How to get "Students & Teachers" discount?', a: 'Verified students and academic institutions get 50% off Professional plans. Sign up with your .edu email or contact us with proof of enrollment.' },
              { q: 'Can I receive a refund if I\'m not satisfied?', a: 'Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.' },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <FAQItem question={item.q} answer={item.a} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="py-32 relative">
        <div className="section-container relative z-10">
          <ScrollReveal>
            <div className="relative rounded-3xl overflow-hidden">
              {/* 3D background for CTA */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-purple-600 to-brand-600" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.15),transparent_60%)]" />
              </div>
              <div className="relative px-8 py-20 sm:px-16 sm:py-24 text-center">
                <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
                  Ready to Track Legal Evolution?
                </h2>
                <p className="text-white/60 max-w-xl mx-auto mb-10 text-lg">
                  Join thousands of legal professionals using LCET to understand how law evolves.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup"
                    className="bg-white text-brand-600 font-semibold px-10 py-4 rounded-xl hover:bg-white/90 transition-all shadow-xl shadow-black/20 text-lg">
                    Get Started Free
                  </Link>
                  <Link href="/search"
                    className="bg-white/10 text-white font-medium px-10 py-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all text-lg backdrop-blur-sm">
                    Try a Search
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <GlassCard className="overflow-hidden" hover3D={false}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left group">
        <span className="font-medium text-white pr-4 group-hover:text-brand-400 transition-colors">{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-white/30 flex-shrink-0" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="overflow-hidden">
        <p className="px-6 pb-6 text-sm text-white/40 leading-relaxed">{answer}</p>
      </motion.div>
    </GlassCard>
  )
}
