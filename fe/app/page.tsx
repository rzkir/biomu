"use client";

import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

import Home from "@/components/content/home/Home";

import Design from "@/components/content/design/Design";

export default function Page() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-900 text-zinc-100">
      {/* Decorative Background - Aether Mesh & Orbs (Tailwind) */}
      {/* Mesh gradient */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(120,0,255,0.15)_0%,transparent_50%)] pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(59,130,246,0.12)_0%,transparent_40%)] pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_60%,rgba(168,85,247,0.1)_0%,transparent_50%)] pointer-events-none"
        aria-hidden
      />
      {/* Orbs */}
      <div
        className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-purple-500/20 blur-[128px] pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/15 blur-[100px] pointer-events-none"
        aria-hidden
      />
      {/* Hero Section */}
      <main className="relative pt-40 pb-20 px-8 max-w-7xl mx-auto">
        <Home />

        <Design />

        {/* Footer CTA */}
        <section className="mt-40 mb-20 text-center">
          <div className="py-24 px-8 aether-glass rounded-[4rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-r from-purple-500/10 to-blue-500/10 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <h2 className="text-6xl md:text-8xl mb-12 relative z-10">
              Ready for the <br />{" "}
              <span className="text-zinc-500 italic font-light">next level?</span>
            </h2>
            <Link
              href="/signin"
              className="relative z-10 inline-flex items-center gap-6 px-12 py-6 bg-white text-black font-bold rounded-full text-2xl hover:scale-105 transition-transform shadow-2xl shadow-white/10"
            >
              Get Started Now
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </section>

        <footer className="pt-20 border-t border-zinc-700 flex flex-col md:flex-row justify-between gap-10 text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold">
          <div className="flex gap-10">
            <Link href="#" className="hover:text-zinc-100 transition-colors">
              Twitter / X
            </Link>
            <Link href="#" className="hover:text-zinc-100 transition-colors">
              Instagram
            </Link>
            <Link href="#" className="hover:text-zinc-100 transition-colors">
              Dribbble
            </Link>
          </div>
          <div>© 2024 AETHER Studio. Built for the elite.</div>
          <div className="flex gap-10">
            <Link href="#" className="hover:text-zinc-100 transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-zinc-100 transition-colors">
              Privacy
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}