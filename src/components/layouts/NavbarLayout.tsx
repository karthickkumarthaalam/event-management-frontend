'use client';

import { useAuth } from "@/contexts/AuthContext";
import { Calendar, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

interface NavbarLayoutProps {
    children: ReactNode;
}

export default function NavbarLayout({ children }: NavbarLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const { logout } = useAuth();

    const navlinks = [
        { href: "/events", label: "Events" },
        { href: "/ticketing", label: "Ticketing" },
        { href: "/crew", label: "Crew" },
        { href: "/budget", label: "Budget" },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-green-100 text-gray-900">

            {/* Header */}
            <header className="sticky top-0 z-50 bg-gray-800 border-b border-gray-800 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">

                    {/* Logo */}
                    <Link href="/events" className="flex items-center space-x-2 group">
                        <Calendar className="h-6 w-6 text-white group-hover:text-violet-400 transition-colors" />
                        <span className="text-xl font-heading font-bold text-white group-hover:text-violet-400 transition-colors">
                            Thaalam
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex space-x-6 font-medium">
                        {navlinks.map(link => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={`relative transition duration-200 ${pathname === link.href
                                    ? "text-violet-400 font-semibold"
                                    : "text-gray-200 hover:text-violet-300"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-4">
                        <button
                            className="hidden sm:flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-md transition"
                            onClick={logout}
                        >
                            <LogOut className="h-4 w-4" />
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition"
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6 text-white" />
                            ) : (
                                <Menu className="h-6 w-6 text-white" />
                            )}
                        </button>
                    </div>

                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden fixed top-0 left-0 h-full w-64 bg-gray-800 border-r border-gray-800 shadow-lg z-[100] transform animate-slideInLeft">

                        <nav className="flex flex-col space-y-2 p-4 mt-16">
                            {navlinks.map(link => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className={`px-3 py-2 rounded-lg transition ${pathname === link.href
                                        ? "bg-blue-800 text-blue-400 font-medium"
                                        : "text-gray-300 hover:bg-gray-800 hover:text-blue-400"
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <button
                                className="flex items-center gap-2 text-red-500 hover:bg-red-800 hover:text-red-300 rounded-lg px-3 py-2 transition mt-2"
                                onClick={logout}
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </nav>
                    </div>
                )}

            </header>

            {/* Main Content */}
            <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>

            <style jsx global>{`
        @keyframes slideInLeft {
              from {
                transform: translateX(-100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }

            .animate-slideInLeft {
              animation: slideInLeft 0.3s ease-out forwards;
            }
      `}</style>
        </div>
    );
}
