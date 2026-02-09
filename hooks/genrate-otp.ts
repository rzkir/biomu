/**
 * OTP Generation Hook
 * Provides a shared function to generate 6-digit OTP codes for various authentication flows
 */

/**
 * Generates a 6-digit numeric OTP code
 * @returns {string} A 6-digit numeric OTP code as string
 */
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generates a numeric OTP code with specified length
 * @param {number} length - Length of the OTP code (default: 6)
 * @returns {string} A numeric OTP code as string
 */
export function generateCustomOTP(length: number = 6): string {
    const digits = "0123456789";
    let otp = "";

    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }

    return otp;
}

/**
 * Generates an alphanumeric OTP code with specified length
 * @param {number} length - Length of the OTP code (default: 6)
 * @returns {string} An alphanumeric OTP code as string
 */
export function generateAlphanumericOTP(length: number = 6): string {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let otp = "";

    for (let i = 0; i < length; i++) {
        otp += characters[Math.floor(Math.random() * characters.length)];
    }

    return otp;
}