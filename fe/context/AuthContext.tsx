"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { apiUrl } from '@/lib/api';
import React from 'react';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Normalize backend user shape ke UserAccount (session dari BE, bukan Firebase) */
function normalizeUser(data: Record<string, unknown> | null): UserAccount | null {
    if (!data || typeof data.uid !== 'string') return null;
    const role = (data.role as string) || 'user';
    const status = ((data.status as string) || 'reguler') as 'reguler' | 'membership';
    const provider = ((data.provider as string) || 'email') as 'email' | 'google' | 'github';
    return {
        uid: data.uid as string,
        email: (data.email as string) || '',
        image: data.image as string | undefined,
        role: role as Role,
        status,
        provider,
        updatedAt: data.updatedAt != null ? new Date(Number(data.updatedAt)) : new Date(),
        createdAt: data.createdAt != null ? new Date(Number(data.createdAt)) : new Date(),
    };
}

const AUTH_PAGES = ['/signin', '/signup', '/verification'];

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserAccount | null>(null);
    const [loading, setLoading] = useState(true);
    const [showInactiveModal, setShowInactiveModal] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const [isLoading] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

    const getDashboardUrl = () => '/dashboard';

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

            const response = await fetch(apiUrl('/api/auth/verification'), {
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
            await fetch(apiUrl('/api/auth/logout'), {
                method: 'POST',
                credentials: 'include',
            });
            setUser(null);
            localStorage.removeItem('redirectAfterLogin');
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
            const response = await fetch(apiUrl('/api/user/delete'), {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error((data as { error?: string }).error || 'Failed to delete account');
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
            if (!email || email.trim() === '') {
                throw new Error('Email harus diisi');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Format email tidak valid');
            }
            const emailString = email.trim();

            const otpResponse = await fetch(apiUrl('/api/auth/signup'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailString }),
            });

            const data = await otpResponse.json();
            if (!otpResponse.ok) {
                throw new Error((data as { error?: string }).error || 'Failed to send signup verification code');
            }

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

            const response = await fetch(apiUrl('/api/auth/verify-otp'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: verificationEmail,
                    otp: otp.trim(),
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error((data as { error?: string }).error || 'Gagal memverifikasi OTP');
            }

            // Session cookie di-set oleh backend; ambil user dari GET session
            const sessionRes = await fetch(apiUrl('/api/auth/session'), { credentials: 'include' });
            const sessionData = await sessionRes.json();
            if (sessionData.authenticated && sessionData.user) {
                setUser(normalizeUser(sessionData.user));
            }

            toast.success('OTP berhasil diverifikasi');
            // Redirect sesuai role: admin → dashboard, user → profile
            const role = sessionData.user?.role;
            const targetPath = role === 'admin' ? '/dashboard' : '/profile';
            router.push(targetPath);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Gagal memverifikasi OTP');
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
            const response = await fetch(apiUrl('/api/auth/verification'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: verificationEmail }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error((data as { error?: string }).error || 'Gagal mengirim ulang OTP');
            }
            toast.success('OTP telah dikirim ulang ke email Anda');
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Gagal mengirim ulang OTP');
            }
            throw error;
        }
    };

    const resetOTPState = () => {
        setVerificationEmail(null);
        setIsVerifyingOTP(false);
    };

    // Ambil user dari backend session (tidak pakai Firebase di FE)
    useEffect(() => {
        let cancelled = false;
        fetch(apiUrl('/api/auth/session'), { credentials: 'include' })
            .then((res) => res.json())
            .then((data) => {
                if (cancelled) return;
                if (data.authenticated && data.user) {
                    setUser(normalizeUser(data.user));
                } else {
                    setUser(null);
                }
            })
            .catch(() => {
                if (!cancelled) setUser(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // Jika sudah login (ada session) jangan akses halaman auth — redirect sesuai role
    useEffect(() => {
        if (loading || !user || !pathname) return;
        const onAuthPage = AUTH_PAGES.includes(pathname) || AUTH_PAGES.some((p) => pathname.startsWith(`${p}/`));
        if (onAuthPage) {
            const targetPath = user.role === 'admin' ? '/dashboard' : '/profile';
            router.replace(targetPath);
        }
    }, [loading, user, pathname, router]);

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
        isLoading,
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
