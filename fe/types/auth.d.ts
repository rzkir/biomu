enum Role {
    ADMIN = "admin",
    USER = "user",
}

interface UserAccount {
    uid: string;
    email: string;
    image?: string;
    role: Role;
    status: "reguler" | "membership";
    provider: "email" | "google" | "github";
    updatedAt: Date;
    createdAt: Date;
}

interface AuthContextType {
    user: UserAccount | null;
    loading: boolean;
    login: (email: string) => Promise<void>;
    logout: () => Promise<void>;
    deleteAccount: () => Promise<void>;
    getDashboardUrl: () => string;
    startEmailSignup: (email: string) => Promise<void>;
    showInactiveModal: boolean;
    setShowInactiveModal: (show: boolean) => void;
    isLoading: boolean;
    verificationEmail: string | null;
    isVerifyingOTP: boolean;
    verifyOTP: (otp: string) => Promise<void>;
    resendOTP: () => Promise<void>;
    resetOTPState: () => void;
}

//===================== Email Config =====================//
interface EmailConfig {
    service?: string;
    auth: {
        user: string;
        pass: string;
    };
}