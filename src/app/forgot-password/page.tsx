'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authservice } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            await authservice.forgotPassword({ email });
            setSuccess("Password reset OTP sent to your email.");
            setTimeout(() => {
                router.push(`/reset-password?email=${encodeURIComponent(email)}`);
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to send password reset email");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br  from-blue-50  to-indigo-50 relative">
            <button
                onClick={() => router.push('/')}
                className="absolute top-6 left-6 flex items-center text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700 hover:text-blue-600"
            >
                <ArrowLeft className="w-5 h-5 mr-2 " />
                Back to Home
            </button>
            <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200 animate-fadeIn">
                <div className="text-center mb-8">
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
                        Forgot Password
                    </h2>
                    <p className="mt-2 text-gray-600">
                        Enter your registered email to reset your password
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md text-center">
                            {success}
                        </div>
                    )}

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-200 disabled:opacity-50"
                    >
                        {isLoading ? "Sending..." : "Send Reset OTP"}
                    </button>

                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <Link href="/login" className="hover:text-indigo-600">
                            Back to login
                        </Link>
                        <Link href="/register" className="hover:text-indigo-600">
                            Create account
                        </Link>
                    </div>
                </form>

                <div className="mt-8 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Thaalam. All rights reserved.
                </div>
            </div>
        </div>
    );
}
