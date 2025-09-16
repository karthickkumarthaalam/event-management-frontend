'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authservice } from '@/lib/auth';
import { ArrowLeft } from 'lucide-react';

export default function Register() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        tenantName: '',
        name: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...dataToSend } = formData;
            await authservice.register(dataToSend);
            setSuccess('Registration successful! Redirecting...');
            setTimeout(() => {
                router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
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
            </button>
            <div className="w-full max-w-xl p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200 animate-fadeIn">
                <div className="text-center mb-8">

                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
                        Join Thaalam
                    </h2>
                    <p className="mt-2 text-gray-600">
                        Create your event management account
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-center">{error}</div>}
                    {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md text-center">{success}</div>}

                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />

                    <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />

                    <input
                        type="text"
                        name="tenantName"
                        placeholder="Tenant Name"
                        value={formData.tenantName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-200 disabled:opacity-50"
                    >
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>

                    <div className="mt-4 text-center text-gray-600 text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-semibold">
                            Sign In
                        </Link>
                    </div>
                </form>

                <div className="mt-6 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Thaalam. All rights reserved.
                </div>
            </div>
        </div>
    );
}
