import Image from "next/image";

import {
    ArrowUpRight,
} from "lucide-react";

export default function Home() {
    return (
        <section className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
            {/* Left Side: Copy */}
            <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-600 text-xs font-semibold tracking-wider text-purple-400 uppercase mb-8">
                    <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                    Version 2.0 Now Live
                </div>
                <h1 className="text-6xl md:text-8xl leading-[0.9] mb-8 text-zinc-100">
                    Digital <br />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-500 to-pink-500">
                        Identity
                    </span>{" "}
                    <br />
                    Redefined.
                </h1>
                <p className="text-lg text-zinc-400 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                    The minimal link-in-bio for high-end creators, architects of the
                    digital space, and those who value sophisticated simplicity over
                    noise.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                    <div className="relative flex items-center">
                        <span className="absolute left-4 text-zinc-500 text-lg">
                            aether.bio/
                        </span>
                        <input
                            type="text"
                            placeholder="yourname"
                            className="pl-[100px] pr-4 py-4 w-72 bg-zinc-800/80 border border-zinc-600 rounded-2xl focus:outline-none focus:border-purple-500/50 transition-all text-zinc-100 font-medium placeholder:text-zinc-500"
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
                    <div className="w-12 h-12 rounded-full bg-linear-to-tr from-blue-400 to-indigo-600 mb-4" />
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
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                            Portfolio 2024
                        </span>
                        <ArrowUpRight className="text-zinc-400 w-5 h-5" />
                    </div>
                </div>

                {/* Card 3: Social Proof */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 aether-glass rounded-2xl p-4 flex items-center gap-4 aether-card-reveal">
                    <div className="flex -space-x-3">
                        <div className="w-8 h-8 rounded-full border-2 border-zinc-800 bg-zinc-700 flex items-center justify-center text-[10px] text-zinc-300">
                            AD
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-zinc-800 bg-blue-600" />
                        <div className="w-8 h-8 rounded-full border-2 border-zinc-800 bg-purple-600" />
                    </div>
                    <span className="text-xs font-bold text-zinc-200">
                        Join 12k+ Innovators
                    </span>
                </div>
            </div>
        </section>
    )
}
