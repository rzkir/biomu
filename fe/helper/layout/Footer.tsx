import React from "react";

import Link from "next/link";

export default function Footer() {
    return (
        <footer className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between gap-10 text-white/30 text-[10px] uppercase tracking-[0.3em] font-bold px-8 max-w-7xl mx-auto">
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
    );
}
