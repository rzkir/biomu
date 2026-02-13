import {
    Palette,
    Wand2,
    Zap,
    ShieldCheck,
    Activity,
} from "lucide-react";

export default function Design() {
    return (
        <section id="features-section" className="mt-60">
            <div className="mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                <div className="max-w-3xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-px bg-purple-500/50" />
                        <span className="text-purple-400 font-bold uppercase tracking-[0.4em] text-[10px]">
                            The Standard for High-End Creators
                        </span>
                    </div>
                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.85] text-zinc-100">
                        Crafted for the <br />
                        <span className="text-zinc-600">creative</span> ecosystem.
                    </h2>
                </div>
                <div className="flex flex-col gap-4 text-left">
                    <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
                        Every detail meticulously engineered to provide an experience
                        that matches the caliber of your work.
                    </p>
                    <div className="w-full h-px bg-zinc-700" />
                    <div className="flex gap-6">
                        <div className="flex flex-col">
                            <span className="text-xl font-bold">99.9%</span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                                Uptime
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold">4.9/5</span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                                Rating
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {/* Row 1: 7 + 5 */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Infinite Customization */}
                    <div className="flex-1 lg:flex-7 min-w-0 h-[500px] aether-glass rounded-[3.5rem] p-12 flex flex-col justify-end relative overflow-hidden group aether-card-reveal border border-zinc-700 backdrop-blur-sm">
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
                            <h3 className="text-4xl md:text-5xl mb-6 font-bold leading-tight text-zinc-100">
                                Infinite <br /> Customization
                            </h3>
                            <p className="text-zinc-400 max-w-md text-lg leading-relaxed">
                                Precision-crafted layout engine that ensures your aesthetic is
                                never compromised. Custom typography, motion signatures, and
                                depth controls.
                            </p>
                        </div>
                        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-t from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </div>

                    {/* Instant Speed */}
                    <div className="flex-1 lg:flex-5 min-w-0 h-[500px] bg-linear-to-br from-[#121212] to-[#1e1b4b] border border-white/10 rounded-[3.5rem] p-12 flex flex-col justify-between group aether-card-reveal relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full group-hover:bg-blue-500/30 transition-colors" />
                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center group-hover:border-blue-500/50 transition-colors">
                            <Zap className="text-3xl text-blue-400 w-8 h-8" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-4xl mb-4 font-bold text-zinc-100">
                                Hyper-Fast <br /> Delivery
                            </h3>
                            <p className="text-zinc-400 text-base leading-relaxed">
                                Experience true zero-lag interactions with sub-100ms load times
                                globally. We handle the heavy lifting while you focus on the
                                art.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Row 2: 5 + 7 */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Privacy First */}
                    <div className="flex-1 lg:flex-5 min-w-0 h-[500px] aether-glass rounded-[3.5rem] p-12 flex flex-col items-start justify-between group aether-card-reveal relative overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-br from-white/2 to-transparent pointer-events-none" />
                        <div className="space-y-6">
                            <ShieldCheck className="text-6xl text-zinc-500 group-hover:text-emerald-400/80 transition-colors duration-500 w-14 h-14" />
                            <h3 className="text-4xl font-bold leading-tight text-zinc-100">
                                Sovereign <br /> Privacy
                            </h3>
                        </div>
                        <p className="text-zinc-400 text-lg leading-relaxed">
                            No trackers. No third-party data collection. Your profile
                            belongs to you, and the data stays between you and your
                            audience.
                        </p>
                    </div>

                    {/* Deep Analytics */}
                    <div className="flex-1 lg:flex-7 min-w-0 h-[500px] bg-[#080808] rounded-[3.5rem] p-12 flex flex-col justify-between border border-white/5 relative overflow-hidden group aether-card-reveal">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">
                                    Business Intelligence
                                </span>
                                <h3 className="text-4xl font-bold text-zinc-100">
                                    Intelligent <br /> Analytics
                                </h3>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-4 py-2 rounded-full bg-zinc-800/80 border border-zinc-600 text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
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

                        <div className="flex justify-between items-center text-zinc-500 text-[10px] font-bold uppercase tracking-tighter pt-6 border-t border-zinc-700">
                            <span>Daily Impressions</span>
                            <span className="text-zinc-400">+24% Growth</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
