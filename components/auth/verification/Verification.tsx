"use client"

import React from "react"

import { OTPForm } from "@/components/auth/verification/otp-form"

export default function Verification() {
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <OTPForm />
            </div>
        </div>
    )
}