'use client';

import { useState } from "react";
import NavbarLayout from "@/components/layouts/NavbarLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LayoutDashboard, Ticket, ChartCandlestick, ShoppingCart } from "lucide-react";
import Dashboard from "@/components/ticketing/Dashboard";
import { TicketingProvider } from "@/contexts/TicketingContextT";
import Tickets from "@/components/ticketing/Tickets";
import { useTicketing } from "@/contexts/TicketingContextT";
import EventSelectionModal from "@/components/ticketing/EventSelectionModal";
import Reports from "@/components/ticketing/reports/Reports";
import Purchase from "@/components/ticketing/purchasing/Purchase";

function TicketingContent() {
    const [activeTab, setActiveTab] = useState<string>("dashboard");
    const { selectedEvent } = useTicketing();

    const tabs = [
        { name: "Dashboard", value: "dashboard", icon: LayoutDashboard },
        { name: "Tickets", value: "tickets", icon: Ticket },
        { name: "Reports", value: "reports", icon: ChartCandlestick },
        { name: "Purchase", value: "purhcase", icon: ShoppingCart }
    ];

    return (
        <ProtectedRoute>
            <NavbarLayout>
                {!selectedEvent && <EventSelectionModal />}
                {selectedEvent && (
                    <div className=" flex flex-col md:flex-row min-h-screen bg-transparent ">
                        <aside className="hidden xl:flex flex-col w-60 bg-white/70 backdrop-blur-md border-r border-gray-200 shadow-xl rounded-3xl p-6">
                            <h2 className=" text-xl font-bold mb-10 bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent tracking-tight">
                                Ticketing Manager
                            </h2>
                            <nav className="flex flex-col gap-2">
                                {
                                    tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.value;
                                        return (
                                            <button
                                                key={tab.value}
                                                onClick={() => setActiveTab(tab.value)}
                                                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative 
                                            ${isActive
                                                        ? "bg-blue-100 text-primary shadow-inner"
                                                        : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                                                    }`}>
                                                {isActive && (
                                                    <span className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-lg"></span>
                                                )}
                                                <Icon size={20} className={`transition-colors ${isActive ? "text-primary" : "text-gray-1500 group-hover:text-primary"}`} />
                                                {tab.name}
                                            </button>
                                        );
                                    })
                                }
                            </nav>
                        </aside>

                        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 xl:hidden bg-white/80 backdrop-blur-lg border border-gray-200 shadow-lg rounded-2xl px-3 py-2 flex justify-around w-[90%] max-w-xl z-50 ">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.value;
                                return (
                                    <button
                                        key={tab.value}
                                        onClick={() => setActiveTab(tab.value)}
                                        className={
                                            `flex flex-col items-center gap-1 text-xs transition-colors ${isActive ? "text-primary font-semibold" : "text-gray-600 hover:text-primary"
                                            }`
                                        }
                                    >
                                        <Icon size={22} className={isActive ? "text=primary" : "text-gray-500"} />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>

                        <main className="flex-1 md:p-8">
                            {activeTab === "dashboard" && <Dashboard />}
                            {activeTab === "tickets" && <Tickets />}
                            {activeTab === "reports" && <Reports />}
                            {activeTab === "purchase" && <Purchase />}
                        </main>

                    </div>
                )
                }
            </NavbarLayout>
        </ProtectedRoute>
    );
}


export default function TicketingPage() {
    return (
        <TicketingProvider>
            <TicketingContent />
        </TicketingProvider>
    );
}