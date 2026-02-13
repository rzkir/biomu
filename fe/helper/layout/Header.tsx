"use client"

import React from 'react'

import Link from 'next/link'

import { Layers } from 'lucide-react'

import { useAuth } from '@/context/AuthContext'

import ProfileMu from './Profile'

const navItems = [
    {
        label: 'Design',
        href: '#features-section'
    },
    {
        label: 'Studio',
        href: '#'
    }
    ,
    {
        label: 'Pricing',
        href: '#'
    },
    {
        label: 'Showcase',
        href: '#'
    }
]

export default function Header() {
    const { user } = useAuth()

    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center bg-transparent backdrop-blur-sm max-w-7xl mx-auto">
            <nav className="flex justify-between items-center bg-transparent backdrop-blur-sm w-full" >
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Layers className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white/90">
                            BIOMU
                        </span>
                    </Link>
                </div>

                <ul className="hidden md:flex items-center gap-10 text-sm font-medium text-white/60">
                    {navItems.map((item) => (
                        <li key={item.label}>
                            <Link href={item.href} className="hover:text-white transition-colors">
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-4">
                    {user ? (
                        <ProfileMu />
                    ) : (
                        <>
                            <Link href="/signin" className="text-sm font-medium text-white/80 hover:text-white">
                                Login
                            </Link>
                            <Link
                                href="/signup"
                                className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-neutral-200 transition-all"
                            >
                                Start Creating
                            </Link>
                        </>
                    )}
                </div>
            </nav >
        </header>
    )
}
