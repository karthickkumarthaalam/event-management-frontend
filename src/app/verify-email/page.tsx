import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authservice } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";

export default function VerifyEmailPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            await authservice.verifyEmail({ email, otp });
            setSuccess("Email verified successfully! Redirecting to login...");
            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsResending(true);
        setError("");
        setSuccess("");

        try {
            await authservice.resendOtp(email);
            setSuccess("A new OTP has been sent to your email!");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to resend OTP");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100  to-green-100 relative">
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 flex items-center text-primary hover:text-indigo-600"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
            </button>
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
                <h1 className="text-3xl font-bold text-center text-gradient mb-6">
                    Verify Your Email
                </h1>

                {email && (
                    <p className="text-center text-gray-500 text-sm mb-4">
                        OTP has been sent to <span className="font-semibold">{email}</span>
                    </p>
                )}

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                {success && <p className="text-green-500 text-center mb-4">{success}</p>}

                <form onSubmit={handleVerify} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        maxLength={6}
                        required
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full  bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                    >
                        {isLoading ? "Verifying..." : "Verify Email"}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        onClick={handleResendOtp}
                        disabled={isResending}
                        className="text-primary hover:underline disabled:opacity-50"
                    >
                        {isResending ? "Resending..." : "Resend OTP"}
                    </button>
                </div>
            </div>
        </div>
    );
}
