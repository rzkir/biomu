"use client"

import React, { useState } from "react"
import Link from "next/link"
import { GalleryVerticalEnd } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"

export function OTPForm({ className, ...props }: React.ComponentProps<"div">) {
    const [otp, setOtp] = useState("")
    const { verifyOTP, resendOTP, verificationEmail, isVerifyingOTP } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (otp.length !== 6) return
        try {
            await verifyOTP(otp)
        } catch {
            // Error shown via toast in AuthContext
        }
    }

    const handleResend = async (e: React.MouseEvent) => {
        e.preventDefault()
        try {
            await resendOTP()
        } catch {
            // Error shown via toast in AuthContext
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <form onSubmit={handleSubmit}>
                <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <Link
                            href="/"
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="flex size-8 items-center justify-center rounded-md">
                                <GalleryVerticalEnd className="size-6" />
                            </div>
                            <span className="sr-only">SMM Panel Landing.</span>
                        </Link>
                        <h1 className="text-xl font-bold">Masukkan kode verifikasi</h1>
                        <FieldDescription>
                            Kami mengirim kode 6 digit ke{" "}
                            {verificationEmail ? (
                                <span className="font-medium">{verificationEmail}</span>
                            ) : (
                                "email Anda"
                            )}
                        </FieldDescription>
                    </div>
                    <Field>
                        <FieldLabel htmlFor="otp" className="sr-only">
                            Kode verifikasi
                        </FieldLabel>
                        <InputOTP
                            maxLength={6}
                            id="otp"
                            value={otp}
                            onChange={setOtp}
                            required
                            containerClassName="gap-4"
                        >
                            <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                        <FieldDescription className="text-center">
                            Tidak menerima kode?{" "}
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={isVerifyingOTP}
                                className="underline underline-offset-4 hover:no-underline disabled:opacity-50"
                            >
                                Kirim ulang
                            </button>
                        </FieldDescription>
                    </Field>
                    <Field>
                        <Button type="submit" disabled={isVerifyingOTP || otp.length !== 6}>
                            {isVerifyingOTP ? "Memverifikasi..." : "Verifikasi"}
                        </Button>
                    </Field>
                    <FieldDescription className="text-center">
                        Ingat password?{" "}
                        <Link href="/signin" className="underline underline-offset-4">
                            Masuk
                        </Link>
                    </FieldDescription>
                </FieldGroup>
            </form>
            <FieldDescription className="px-6 text-center">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </FieldDescription>
        </div>
    )
}