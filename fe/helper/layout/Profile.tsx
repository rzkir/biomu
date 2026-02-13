"use client"

import React, { useState, useRef, useEffect } from 'react'

import Link from 'next/link'
import Image from 'next/image'

import { User, LogOut, ChevronDown } from 'lucide-react'

import { useAuth } from '@/context/AuthContext'

export default function ProfileMu() {
    const { user, logout } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    if (!user) return null

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
                {user.image ? (
                    <Image
                        src={user.image}
                        alt={user.email}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                    </div>
                )}
                <span className="hidden sm:inline">{user.email}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-48 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 overflow-hidden z-50">
                    <div className="py-1">
                        <Link
                            href={user.role === 'admin' ? '/dashboard' : '/profile'}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <User className="w-4 h-4" />
                            <span>{user.role === 'admin' ? 'Dashboard' : 'Profile'}</span>
                        </Link>
                        <button
                            onClick={() => {
                                setIsOpen(false)
                                logout()
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
