'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { Ticket, Users, Wallet, BarChart, Calendar, CreditCard, PieChart, TrendingUp } from "lucide-react";
import Image from "next/image";

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">

              <span className="text-2xl font-bold text-blue-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-800">Thaalam</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-gradient-to-br from-blue-500 to-blue-700 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Enterprise Event
                  <span className="text-blue-600"> Management</span>
                  Platform
                </h1>
                <p className="text-lg text-gray-600 mt-4 max-w-lg">
                  Comprehensive event management solution with advanced ticketing, crew coordination,
                  financial tracking, and real-time analytics for professional event organizers.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="px-8 py-3 bg-gradient-to-br from-blue-500 to-blue-700 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-center"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-white transition-colors text-center"
                >
                  Sign In to Dashboard
                </Link>
              </div>

              {/* Stats */}

            </div>

            {/* Dashboard Preview */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Dashboard Overview</h3>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">$24.8K</div>
                    <div className="text-sm text-blue-700">Revenue</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="text-2xl font-bold text-green-600">1,248</div>
                    <div className="text-sm text-green-700">Tickets</div>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 h-32 flex items-center justify-center">
                  <BarChart className="w-8 h-8 text-gray-400" />
                </div>

                {/* Recent Activity */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Upcoming Events</span>
                    <span className="text-blue-600 font-medium">3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Team Members</span>
                    <span className="text-green-600 font-medium">12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Event Management Suite
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to plan, execute, and analyze successful events
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Ticket className="w-8 h-8" />}
              title="Advanced Ticketing"
              description="Multi-class tickets, QR code management, and real-time sales tracking"
              color="blue"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Crew Management"
              description="Role-based access, shift scheduling, and team communication"
              color="green"
            />
            <FeatureCard
              icon={<Wallet className="w-8 h-8" />}
              title="Financial Control"
              description="Budget tracking, expense management, and revenue analytics"
              color="purple"
            />
            <FeatureCard
              icon={<BarChart className="w-8 h-8" />}
              title="Business Intelligence"
              description="Custom reports, attendance analytics, and performance insights"
              color="orange"
            />
          </div>
        </div>
      </section>

      {/* Detailed Features */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Event Planning */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Event Planning</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Comprehensive planning tools for schedules, resources, and task management with
                automated reminders and progress tracking.
              </p>
            </div>

            {/* Team Coordination */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Team Coordination</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Assign roles, track responsibilities, and maintain clear communication channels
                across your entire event team.
              </p>
            </div>

            {/* Financial Management */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Financial Management</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Real-time budget monitoring, expense categorization, and profit/loss reporting
                with sponsorship tracking.
              </p>
            </div>

            {/* Analytics & Reporting */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Analytics & Reporting</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Deep insights into ticket sales, attendance patterns, revenue streams, and
                audience demographics.
              </p>
            </div>

            {/* Custom Ticketing */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Custom Ticketing</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Branded ticketing pages, multiple ticket types, and flexible pricing strategies
                with promotional code support.
              </p>
            </div>

            {/* Sponsorship Management */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Sponsorship Management</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Track sponsor contributions, manage benefits fulfillment, and generate
                sponsorship reports and analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Event Management?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join professional event organizers worldwide who trust Thaalam for their most important events.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3 bg-gradient-to-br from-blue-500 to-blue-700 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Start Your Free Trial
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Demo
            </Link>
          </div>
          {/* <p className="text-sm text-gray-500 mt-4">No credit card required • 14-day free trial</p> */}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <span className="font-bold text-sm">T</span>
              </div>
              <span className="text-lg font-semibold">Thaalam</span>
            </div>
            <p className="text-gray-400 text-sm">
              Enterprise event management platform for professional organizers.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/status" className="hover:text-white transition-colors">System Status</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 py-6">
          <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Thaalam. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color = "blue"
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600"
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}