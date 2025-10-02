'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { Ticket, Users, Wallet, BarChart } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/events');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100  to-green-100">

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/50 backdrop-blur-sm shadow-md transition-shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo (always left) */}
          <Link
            href="/"
            className="text-3xl font-bold tracking-normal bg-gradient-to-r from-indigo-600 to-purple-900 bg-clip-text text-transparent"
          >
            Thaalam
          </Link>

          {/* Links (only visible on md+) */}
          <div className="hidden md:flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-primary font-semibold rounded-lg hover:bg-primary/10 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:shadow-lg transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>


      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-32 lg:pt-40 flex flex-col lg:flex-row items-center gap-16">
        {/* Left Content */}
        <div className="lg:w-1/2 text-center lg:text-left space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-normal tracking-tight text-indigo-600">
            Plan <span className="bg-gradient-to-r from-indigo-600 to-purple-900 bg-clip-text text-transparent">Smarter</span>,<br />
            Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-900 ">Better</span>
          </h1>
          <p className="text-lg text-gray-700 max-w-xl mx-auto lg:mx-0">
            Streamline your events with Thaalam — all-in-one platform for ticketing, crew management, budgeting, and expense tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-200"
            >
              🚀 Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border border-primary text-primary text-lg font-semibold rounded-full hover:bg-primary/10 transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Right Card */}
        <div className="lg:w-1/2 flex justify-center mt-12 lg:mt-0">
          <div className="bg-white/20 backdrop-blur-md shadow-2xl rounded-3xl p-12 w-full max-w-md text-center hover:-translate-y-2 hover:shadow-3xl transition-transform duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Your Event, Your Control 🎯
            </h3>
            <p className="text-gray-700 text-base sm:text-lg">
              Save time and cut costs with automation. From planning to execution, keep everything organized and your team in sync — all from one dashboard.
            </p>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="mt-32 py-28 relative">
        {/* Decorative floating circles */}
        <div className="absolute top-0 -left-20 w-72 h-72 bg-gradient-to-tr from-indigo-200 to-pink-200 rounded-full opacity-30 animate-pulse-slow -z-10"></div>
        <div className="absolute bottom-0 -right-24 w-60 h-60 sm:w-96 sm:h-96 bg-gradient-to-br from-pink-100 to-pink-300 rounded-full opacity-20 animate-pulse-slow -z-10"></div>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-4xl font-extrabold text-gray-900 mb-6">
            Everything You Need to Run Flawless Events
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-16">
            Thaalam brings all your event operations into one seamless platform — focus on what matters most: delivering unforgettable experiences.
          </p>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={<Ticket className="w-12 h-12" />} title="Ticketing" description="Sell tickets online, track sales in real time, and manage entry with QR codes." />
            <FeatureCard icon={<Users className="w-12 h-12" />} title="Crew Management" description="Assign tasks, schedule shifts, and keep your team aligned effortlessly." />
            <FeatureCard icon={<Wallet className="w-12 h-12" />} title="Expense Tracking" description="Log expenses, categorize costs, and view reports to stay on budget." />
            <FeatureCard icon={<BarChart className="w-12 h-12" />} title="Budget Planning" description="Create budgets, apply taxes, and see profit/loss insights instantly." />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className=" py-32 overflow-hidden">
        <div className="relative max-w-6xl mx-auto text-center px-6">
          <h1 className="text-4xl  font-extrabold text-gray-900 mb-6 leading-tight">
            Take Charge of Your Events
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto">
            Streamline your event planning with Thaalam. Organize, manage, and track everything in one place effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              href="/register"
              className="px-14 py-5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-full shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-xl"
            >
              Get Started
            </Link>
            <Link
              href="/"
              className="px-10 py-5 border border-primary text-primary font-semibold rounded-full hover:bg-primary/10 transition-all duration-300 text-xl"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-md mt-32 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-12">
          {/* Branding */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">Thaalam</h2>
            <p className="text-gray-600 max-w-sm">
              All-in-one event management platform — ticketing, budgeting, crew scheduling, and expense tracking made simple.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/" className="text-gray-600 hover:text-primary transition">Home</Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-600 hover:text-primary transition">Get Started</Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-600 hover:text-primary transition">Sign In</Link>
              </li>
              <li>
                <Link href="#features" className="text-gray-600 hover:text-primary transition">Features</Link>
              </li>
            </ul>
          </div>

          {/* Contact / Social */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact</h3>
            <p className="text-gray-600">support@thaalam.com</p>
            <div className="flex gap-4">
              <Link href="#" className="text-gray-600 hover:text-primary transition">Twitter</Link>
              <Link href="#" className="text-gray-600 hover:text-primary transition">LinkedIn</Link>
              <Link href="#" className="text-gray-600 hover:text-primary transition">Instagram</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 py-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Thaalam. All rights reserved.
        </div>
      </footer>


    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string; }) {
  return (
    <div className="group p-8 bg-white rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition-transform duration-300 border border-gray-100 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300 mx-auto">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
