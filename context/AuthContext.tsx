"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { useRouter } from 'next/navigation';

import { auth, db } from '@/lib/firebase';

import React from 'react';

import {
    signOut,
    onAuthStateChanged,
    signInWithCustomToken,
} from 'firebase/auth';

import { doc, getDoc } from 'firebase/firestore';

import { toast } from 'sonner';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserAccount | null>(null);
    const [loading, setLoading] = useState(true);
    const [showInactiveModal, setShowInactiveModal] = useState(false);
    const router = useRouter();

    // Signin state (reserved, belum digunakan)
    const [isLoading] = useState(false);

    // OTP state (email yang sedang diverifikasi)
    const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

    const getDashboardUrl = () => {
        return '/dashboard';
    };

    const login = async (email: string): Promise<void> => {
        try {
            if (!email || !email.trim()) {
                throw new Error('Email harus diisi');
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Format email tidak valid');
            }

            const emailString = email.trim().toLowerCase();

            const response = await fetch('/api/auth/verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailString }),
            });

            const data = await response.json();

            if (response.status === 404) {
                throw new Error('Email tidak terdaftar. Silakan daftar terlebih dahulu.');
            }

            if (!response.ok) {
                throw new Error((data as { error?: string }).error || 'Gagal mengirim kode verifikasi');
            }

            setVerificationEmail(emailString);
            toast.success('Kode verifikasi telah dikirim ke email Anda. Silakan cek inbox.');
            router.push('/verification');
        } catch (error) {
            if (error instanceof Error) {
                toast.error('Login gagal: ' + error.message);
            } else {
                toast.error('Terjadi kesalahan saat login');
            }
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Sign out from Firebase
            await signOut(auth);
            setUser(null);

            // Clear the session cookie through an API call
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include', // Important: This ensures cookies are included
            });

            // Clear any stored redirect URLs
            localStorage.removeItem('redirectAfterLogin');

            // Force reload the page to clear any remaining state
            window.location.href = '/';

            toast.success('Anda berhasil logout');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Terjadi kesalahan saat logout');
        }
    };

    const deleteAccount = async () => {
        try {
            if (!user) {
                throw new Error('No user logged in');
            }

            const idToken = await auth.currentUser?.getIdToken();
            if (!idToken) {
                throw new Error('Failed to get authentication token');
            }

            const response = await fetch('/api/user/delete', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete account');
            }

            setUser(null);
            toast.success('Akun berhasil dihapus');
            router.push('/signin');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Gagal menghapus akun');
            throw error;
        }
    };

    const startEmailSignup = async (email: string): Promise<void> => {
        try {
            if (!email || email.trim() === "") {
                throw new Error('Email harus diisi');
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Format email tidak valid');
            }

            const emailString = email.trim();

            // Send OTP for signup verification
            const otpResponse = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: emailString }),
            });

            const data = await otpResponse.json();

            if (!otpResponse.ok) {
                throw new Error(data.error || 'Failed to send signup verification code');
            }

            // Store email in state only (no localStorage)
            setVerificationEmail(emailString);

            toast.success('Kode verifikasi telah dikirim ke email Anda. Silakan cek inbox.');
        } catch (error) {
            if (error instanceof Error) {
                toast.error('Gagal mengirim kode verifikasi: ' + error.message);
            } else {
                toast.error('Gagal mengirim kode verifikasi.');
            }
            throw error;
        }
    };

    const verifyOTP = async (otp: string): Promise<void> => {
        try {
            if (!verificationEmail) {
                throw new Error('Email tidak ditemukan. Silakan mulai dari awal.');
            }

            if (!otp || otp.length !== 6) {
                throw new Error('OTP harus 6 digit');
            }

            setIsVerifyingOTP(true);

            const response = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: verificationEmail,
                    otp: otp.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Gagal memverifikasi OTP");
            }

            // Jika server mengirimkan custom token, langsung login ke Firebase Auth
            if (data.token && typeof data.token === "string") {
                const userCredential = await signInWithCustomToken(auth, data.token);
                try {
                    const idToken = await userCredential.user.getIdToken(true);
                    await fetch("/api/auth/session", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({ idToken }),
                    });
                } catch (sessionError) {
                    console.error("Gagal membuat session cookie:", sessionError);
                }
            }

            toast.success("OTP berhasil diverifikasi");
            // Redirect ke halaman profil setelah verifikasi berhasil
            router.push("/profile");
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Gagal memverifikasi OTP");
            }
            throw error;
        } finally {
            setIsVerifyingOTP(false);
        }
    };

    const resendOTP = async (): Promise<void> => {
        try {
            if (!verificationEmail) {
                throw new Error('Email tidak ditemukan');
            }

            const response = await fetch("/api/auth/verification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: verificationEmail }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Gagal mengirim ulang OTP");
            }

            toast.success("OTP telah dikirim ulang ke email Anda");
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Gagal mengirim ulang OTP");
            }
            throw error;
        }
    };

    const resetOTPState = () => {
        setVerificationEmail(null);
        setIsVerifyingOTP(false);
    };

    // Catatan: flow lupa password, upload avatar, dan update display name dihapus karena tidak digunakan saat ini

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser && process.env.NEXT_PUBLIC_COLLECTIONS_ACCOUNTS) {
                    const userDoc = await getDoc(doc(db, process.env.NEXT_PUBLIC_COLLECTIONS_ACCOUNTS as string, firebaseUser.uid));
                    const userData = userDoc.data() as UserAccount;
                    setUser(userData);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const value = {
        user,
        loading,
        login,
        logout,
        deleteAccount,
        getDashboardUrl,
        startEmailSignup,
        showInactiveModal,
        setShowInactiveModal,
        // Signin state
        isLoading,
        // OTP state
        verificationEmail,
        isVerifyingOTP,
        verifyOTP,
        resendOTP,
        resetOTPState,
    };
    return (
        <AuthContext.Provider value={value as AuthContextType}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};