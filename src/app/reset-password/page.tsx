'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authservice } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";

export default function ResetPassword() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromQuery = searchParams.get("email") || "";

    const [formData, setFormData] = useState({
        email: emailFromQuery,
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (emailFromQuery) {
            setFormData((prev) => ({ ...prev, email: emailFromQuery }));
        }
    }, [emailFromQuery]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            await authservice.resetPassword({
                email: formData.email,
                otp: formData.otp,
                newPassword: formData.newPassword,
            });

            setSuccess("Password reset successfully! Redirecting to login...");
            setTimeout(() => router.push("/login"), 1000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100  to-green-100 relative">
            <button
                onClick={() => router.push('/')}
                className="absolute top-6 left-6 flex items-center text-primary hover:text-indigo-600"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
            </button>            <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200 animate-fadeIn">
                <div className="text-center mb-8">
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-gray-600">
                        Enter the OTP you received and choose a new password
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

                    <div className="space-y-4">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            readOnly={!!emailFromQuery}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition bg-gray-100"
                        />

                        <input
                            type="text"
                            name="otp"
                            placeholder="Enter OTP"
                            value={formData.otp}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                        />

                        <input
                            type="password"
                            name="newPassword"
                            placeholder="New Password"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                        />

                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm New Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-200 disabled:opacity-50"
                    >
                        {isLoading ? "Resetting..." : "Reset Password"}
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
