"use client";

import React from "react";

import Link from "next/link";

import Image from "next/image";

import {
  ArrowUpRight,
  Palette,
  Wand2,
  Zap,
  ShieldCheck,
  Activity,
  ArrowRight,
} from "lucide-react";

export default function Page() {
  return (
    <div className="aether-page relative min-h-screen">
      {/* Decorative Background */}
      <div className="aether-mesh-gradient" />
      <div className="aether-orb aether-orb-1" />
      <div className="aether-orb aether-orb-2" />
      {/* Hero Section */}
      <main className="relative pt-40 pb-20 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Side: Copy */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wider text-purple-400 uppercase mb-8">
              <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
              Version 2.0 Now Live
            </div>
            <h1 className="text-6xl md:text-8xl leading-[0.9] mb-8">
              Digital <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                Identity
              </span>{" "}
              <br />
              Redefined.
            </h1>
            <p className="text-lg text-white/50 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              The minimal link-in-bio for high-end creators, architects of the
              digital space, and those who value sophisticated simplicity over
              noise.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <div className="relative flex items-center">
                <span className="absolute left-4 text-white/30 text-lg">
                  aether.bio/
                </span>
                <input
                  type="text"
                  placeholder="yourname"
                  className="pl-[100px] pr-4 py-4 w-72 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-purple-500/50 transition-all text-white font-medium"
                />
              </div>
              <button
                type="button"
                className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-transform shadow-2xl shadow-purple-500/20"
              >
                Claim Yours
              </button>
            </div>
          </div>

          {/* Right Side: Floating Asymmetric Elements */}
          <div className="flex-1 relative w-full h-[600px] hidden lg:block">
            {/* Card 1: Bio Profile */}
            <div className="absolute top-0 right-10 w-64 aether-glass rounded-3xl p-6 transform rotate-3 aether-card-reveal">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-600 mb-4" />
              <div className="h-4 w-24 bg-white/20 rounded-full mb-2" />
              <div className="h-3 w-40 bg-white/10 rounded-full" />
              <div className="mt-8 space-y-3">
                <div className="h-10 w-full bg-white/10 rounded-xl" />
                <div className="h-10 w-full bg-white/10 rounded-xl" />
              </div>
            </div>

            {/* Card 2: Visual Card */}
            <div className="absolute bottom-20 left-10 w-80 aether-glass rounded-[2.5rem] p-4 -rotate-6 aether-card-reveal">
              <div className="aspect-square w-full rounded-[1.8rem] bg-cover bg-center mb-4 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"
                  alt="Art"
                  width={320}
                  height={320}
                  className="object-cover w-full h-full opacity-80"
                />
              </div>
              <div className="px-2 py-2 flex justify-between items-center">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">
                  Portfolio 2024
                </span>
                <ArrowUpRight className="text-white/60 w-5 h-5" />
              </div>
            </div>

            {/* Card 3: Social Proof */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 aether-glass rounded-2xl p-4 flex items-center gap-4 aether-card-reveal">
              <div className="flex -space-x-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#1a1a1a] bg-zinc-800 flex items-center justify-center text-[10px]">
                  AD
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-[#1a1a1a] bg-blue-600" />
                <div className="w-8 h-8 rounded-full border-2 border-[#1a1a1a] bg-purple-600" />
              </div>
              <span className="text-xs font-bold text-white/80">
                Join 12k+ Innovators
              </span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <section id="features-section" className="mt-60">
          <div className="mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-[1px] bg-purple-500/50" />
                <span className="text-purple-400 font-bold uppercase tracking-[0.4em] text-[10px]">
                  The Standard for High-End Creators
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.85]">
                Crafted for the <br />
                <span className="text-white/20">creative</span> ecosystem.
              </h2>
            </div>
            <div className="flex flex-col gap-4 text-left">
              <p className="text-white/40 text-sm max-w-xs leading-relaxed">
                Every detail meticulously engineered to provide an experience
                that matches the caliber of your work.
              </p>
              <div className="w-full h-[1px] bg-white/10" />
              <div className="flex gap-6">
                <div className="flex flex-col">
                  <span className="text-xl font-bold">99.9%</span>
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">
                    Uptime
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold">4.9/5</span>
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">
                    Rating
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="aether-asymmetric-grid">
            {/* Infinite Customization */}
            <div className="col-span-12 lg:col-span-7 h-[500px] aether-glass rounded-[3.5rem] p-12 flex flex-col justify-end relative overflow-hidden group aether-card-reveal">
              <div className="absolute top-0 right-0 p-12 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <div className="relative">
                  <Palette className="text-[240px] text-purple-500/10 blur-[2px] w-[240px] h-[240px]" />
                  <Wand2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] text-white/10 w-32 h-32" />
                </div>
              </div>
              <div className="relative z-10">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4 block">
                  Design Control
                </span>
                <h3 className="text-4xl md:text-5xl mb-6 font-bold leading-tight">
                  Infinite <br /> Customization
                </h3>
                <p className="text-white/40 max-w-md text-lg leading-relaxed">
                  Precision-crafted layout engine that ensures your aesthetic is
                  never compromised. Custom typography, motion signatures, and
                  depth controls.
                </p>
              </div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>

            {/* Instant Speed */}
            <div className="col-span-12 lg:col-span-5 h-[500px] bg-gradient-to-br from-[#121212] to-[#1e1b4b] border border-white/10 rounded-[3.5rem] p-12 flex flex-col justify-between group aether-card-reveal relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full group-hover:bg-blue-500/30 transition-colors" />
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center group-hover:border-blue-500/50 transition-colors">
                <Zap className="text-3xl text-blue-400 w-8 h-8" />
              </div>
              <div className="relative z-10">
                <h3 className="text-4xl mb-4 font-bold">
                  Hyper-Fast <br /> Delivery
                </h3>
                <p className="text-white/50 text-base leading-relaxed">
                  Experience true zero-lag interactions with sub-100ms load times
                  globally. We handle the heavy lifting while you focus on the
                  art.
                </p>
              </div>
            </div>

            {/* Privacy First */}
            <div className="col-span-12 lg:col-span-5 h-[500px] aether-glass rounded-[3.5rem] p-12 flex flex-col items-start justify-between group aether-card-reveal relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
              <div className="space-y-6">
                <ShieldCheck className="text-6xl text-white/20 group-hover:text-emerald-400/80 transition-colors duration-500 w-14 h-14" />
                <h3 className="text-4xl font-bold leading-tight">
                  Sovereign <br /> Privacy
                </h3>
              </div>
              <p className="text-white/40 text-lg leading-relaxed">
                No trackers. No third-party data collection. Your profile
                belongs to you, and the data stays between you and your
                audience.
              </p>
            </div>

            {/* Deep Analytics */}
            <div className="col-span-12 lg:col-span-7 h-[500px] bg-[#080808] rounded-[3.5rem] p-12 flex flex-col justify-between border border-white/5 relative overflow-hidden group aether-card-reveal">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2 block">
                    Business Intelligence
                  </span>
                  <h3 className="text-4xl font-bold">
                    Intelligent <br /> Analytics
                  </h3>
                </div>
                <div className="flex gap-2">
                  <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider">
                    Live
                  </div>
                  <Activity className="text-2xl text-purple-500 animate-pulse w-6 h-6" />
                </div>
              </div>

              <div className="relative h-48 w-full mt-8 flex items-end justify-between gap-1 md:gap-3 px-4">
                <div className="flex-1 h-2/3 bg-purple-500/10 rounded-t-2xl group-hover:h-3/4 transition-all duration-700" />
                <div className="flex-1 h-1/2 bg-blue-500/10 rounded-t-2xl group-hover:h-2/3 transition-all duration-700 delay-75" />
                <div className="flex-1 h-3/4 bg-purple-500/40 rounded-t-2xl group-hover:h-4/5 transition-all duration-700 delay-150" />
                <div className="flex-1 h-4/5 bg-blue-500/60 rounded-t-2xl group-hover:h-full transition-all duration-700 delay-200" />
                <div className="flex-1 h-1/3 bg-purple-500/20 rounded-t-2xl group-hover:h-1/2 transition-all duration-700 delay-300" />
                <div className="flex-1 h-1/2 bg-blue-500/10 rounded-t-2xl group-hover:h-3/4 transition-all duration-700 delay-400" />
                <div className="flex-1 h-2/3 bg-white/10 rounded-t-2xl group-hover:h-5/6 transition-all duration-700 delay-500" />
              </div>

              <div className="flex justify-between items-center text-white/30 text-[10px] font-bold uppercase tracking-tighter pt-6 border-t border-white/5">
                <span>Daily Impressions</span>
                <span className="text-white/60">+24% Growth</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="mt-40 mb-20 text-center">
          <div className="py-24 px-8 aether-glass rounded-[4rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <h2 className="text-6xl md:text-8xl mb-12 relative z-10">
              Ready for the <br />{" "}
              <span className="text-white/30 italic font-light">next level?</span>
            </h2>
            <Link
              href="#"
              className="relative z-10 inline-flex items-center gap-6 px-12 py-6 bg-white text-black font-bold rounded-full text-2xl hover:scale-105 transition-transform shadow-2xl shadow-white/10"
            >
              Get Started Now
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </section>

        <footer className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between gap-10 text-white/30 text-[10px] uppercase tracking-[0.3em] font-bold">
          <div className="flex gap-10">
            <Link href="#" className="hover:text-white transition-colors">
              Twitter / X
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Instagram
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Dribbble
            </Link>
          </div>
          <div>© 2024 AETHER Studio. Built for the elite.</div>
          <div className="flex gap-10">
            <Link href="#" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Privacy
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
