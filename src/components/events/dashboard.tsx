'use client';

import { useEffect, useState } from "react";
import { fetchEvents } from "@/lib/events";
import { Line, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, TrendingUp, Users, Clock, MapPin, Eye, MoreVertical, ChevronLeft, ChevronRight, Dot, View } from "lucide-react";
import EventModal from "./EventModal";
import ViewEventModal from "./viewModal";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

export default function Dashboard() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewEvent, setViewEvent] = useState<any | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());


    const loadEvents = async () => {
        setLoading(true);
        try {
            const res = await fetchEvents();
            setEvents(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, []);

    // Stats
    const totalEvents = events.length;
    const upcomingEvents = events.filter(e => new Date(e.start_date) > new Date()).length;
    const completedEvents = events.filter(e => e.status === "completed").length;
    const cancelledEvents = events.filter(e => e.status === "cancelled").length;
    const confirmedEvents = events.filter(e => e.status === "confirmed").length;

    const statusColor = (status: string) => {
        switch (status) {
            case "planning": return "bg-slate-100 text-slate-700 border-slate-200";
            case "confirmed": return "bg-purple-100 text-purple-700 border-purple-200";
            case "ongoing": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "completed": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "cancelled": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    // Get available years from events
    const availableYears = Array.from(
        new Set(events.map(event => new Date(event.start_date).getFullYear()))
    ).sort((a, b) => b - a); // Sort descending (newest first)

    // If current year not in available years, add it
    if (!availableYears.includes(selectedYear) && availableYears.length > 0) {
        setSelectedYear(availableYears[0]);
    }

    // Line Chart - Monthly Events for selected year
    const months = Array.from({ length: 12 }, (_, i) =>
        new Date(0, i).toLocaleString("default", { month: "short" })
    );

    const eventsPerMonth = months.map((month, i) => {
        return events.filter(e => {
            const eventDate = new Date(e.start_date);
            return eventDate.getFullYear() === selectedYear && eventDate.getMonth() === i;
        }).length;
    });

    const lineChartData = {
        labels: months,
        datasets: [
            {
                label: "Events per Month",
                data: eventsPerMonth,
                borderColor: "rgba(99,102,241,1)",
                backgroundColor: "rgba(99,102,241,0.1)",
                tension: 0.4,
                fill: true,
                pointBackgroundColor: "rgba(99,102,241,1)",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    title: (context: any) => {
                        return `${months[context[0].dataIndex]} ${selectedYear}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1, color: '#6B7280' },
                grid: { color: 'rgba(107,114,128,0.1)' },
                border: { display: false }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#6B7280' },
                border: { display: false }
            },
        },
        elements: {
            line: {
                borderWidth: 3,
            }
        }
    };

    // Pie Chart - Status Distribution
    const pieChartData = {
        labels: ["Upcoming", "Completed", "Cancelled", "Confirmed"],
        datasets: [
            {
                data: [upcomingEvents, completedEvents, cancelledEvents, confirmedEvents],
                backgroundColor: [
                    "rgba(59, 130, 246, 0.8)",
                    "rgba(16, 185, 129, 0.8)",
                    "rgba(239, 68, 68, 0.8)",
                    "rgba(139, 92, 246, 0.8)"
                ],
                borderColor: [
                    "rgba(59, 130, 246, 1)",
                    "rgba(16, 185, 129, 1)",
                    "rgba(239, 68, 68, 1)",
                    "rgba(139, 92, 246, 1)"
                ],
                borderWidth: 2,
                hoverOffset: 4,
            },
        ],
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                cornerRadius: 8,
            }
        }
    };

    // Year navigation functions
    const goToPreviousYear = () => {
        if (availableYears.length > 0) {
            const currentIndex = availableYears.indexOf(selectedYear);
            const nextIndex = currentIndex < availableYears.length - 1 ? currentIndex + 1 : 0;
            setSelectedYear(availableYears[nextIndex]);
        }
    };

    const goToNextYear = () => {
        if (availableYears.length > 0) {
            const currentIndex = availableYears.indexOf(selectedYear);
            const nextIndex = currentIndex > 0 ? currentIndex - 1 : availableYears.length - 1;
            setSelectedYear(availableYears[nextIndex]);
        }
    };

    return (
        <>
            <div className="min-h-screen md:p-6 lg:p-8">
                <div className=" space-y-8">
                    {/* Header */}
                    <div className="flex  md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl  font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent mb-2">
                                Dashboard
                            </h1>
                        </div>
                        <Button
                            className="flex items-center gap-2 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                            onClick={() => setModalOpen(true)}
                        >
                            <Plus size={20} /> Create Event
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-slate-100 transition-all duration-300 transform hover:scale-105">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 mb-1">Total Events</p>
                                    <p className="text-3xl font-bold text-slate-800">{totalEvents}</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl group-hover:from-slate-200 group-hover:to-slate-300 transition-all duration-300">
                                    <Calendar className="h-8 w-8 text-slate-600" />
                                </div>
                            </div>
                        </div>

                        <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-blue-100 transition-all duration-300 transform hover:scale-105">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 mb-1">Upcoming</p>
                                    <p className="text-3xl font-bold text-blue-600">{upcomingEvents}</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                                    <Clock className="h-8 w-8 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-emerald-100 transition-all duration-300 transform hover:scale-105">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 mb-1">Completed</p>
                                    <p className="text-3xl font-bold text-emerald-600">{completedEvents}</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl group-hover:from-emerald-200 group-hover:to-emerald-300 transition-all duration-300">
                                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                                </div>
                            </div>
                        </div>

                        <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-red-100 transition-all duration-300 transform hover:scale-105">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 mb-1">Cancelled</p>
                                    <p className="text-3xl font-bold text-red-600">{cancelledEvents}</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl group-hover:from-red-200 group-hover:to-red-300 transition-all duration-300">
                                    <Users className="h-8 w-8 text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Line Chart */}
                        <div className="xl:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex flex-col md:flex-row items-start gap-2 md:items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 mb-2">Events Trend</h2>
                                    <p className="text-sm text-slate-600">Monthly event creation overview</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={goToPreviousYear}
                                            className="h-8 w-8 p-0 rounded-md"
                                            disabled={availableYears.length <= 1}
                                        >
                                            <ChevronLeft size={16} />
                                        </Button>
                                        <span className="px-2 text-sm font-medium text-slate-700 min-w-[80px] text-center">
                                            {selectedYear}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={goToNextYear}
                                            className="h-8 w-8 p-0 rounded-md"
                                            disabled={availableYears.length <= 1}
                                        >
                                            <ChevronRight size={16} />
                                        </Button>
                                    </div>
                                    <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                                        <TrendingUp className="h-6 w-6 text-indigo-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="h-40 md:h-60 lg:h-80">
                                <Line data={lineChartData} options={lineChartOptions} />
                            </div>
                        </div>

                        {/* Pie Chart */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 mb-2">Status Distribution</h2>
                                    <p className="text-sm text-slate-600">Event status breakdown</p>
                                </div>
                                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                            <div className="h-80">
                                <Pie data={pieChartData} options={pieChartOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Events Table */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="p-8 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 mb-2">Upcoming Events</h2>
                                </div>
                                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                                    <Calendar className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                <p className="text-slate-500 mt-4">Loading events...</p>
                            </div>
                        ) : events.length === 0 ? (
                            <div className="p-12 text-center">
                                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-400 text-lg">No events found</p>
                                <p className="text-slate-400 text-sm">Create your first event to get started</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700">Event Name</th>
                                            <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                                            <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700">Start Date</th>
                                            <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700">End Date</th>
                                            <th className="px-8 py-4 text-center text-sm font-semibold text-slate-700 hidden lg:block">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {events
                                            .filter(e => new Date(e.start_date) > new Date())
                                            .slice(0, 5)
                                            .map(event => (
                                                <tr key={event.id} className="hover:bg-slate-50 transition-all duration-200" >
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                                                                <Calendar className="h-5 w-5 text-indigo-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-800 whitespace-nowrap">{event.name}</p>
                                                                {event.location && (
                                                                    <div className="flex items-center gap-1 mt-1">
                                                                        <MapPin className="h-3 w-3 text-slate-400" />
                                                                        <p className="text-xs text-slate-500">{event.location}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColor(event.status)}`}>
                                                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <p className="text-sm font-medium text-slate-700 whitespace-nowrap">
                                                            {new Date(event.start_date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <p className="text-sm font-medium text-slate-700 whitespace-nowrap">
                                                            {event.end_date ? new Date(event.end_date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            }) : "—"}
                                                        </p>
                                                    </td>
                                                    <td className="px-8 py-6 text-center hidden lg:block">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                                                                onClick={() => setViewEvent(event)} >
                                                                <View className="h-4 w-4 text-slate-600" />
                                                            </button>

                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Event Modal */}
            <EventModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                event={null}
                onSaved={() => loadEvents()}
            />

            <ViewEventModal
                open={!!viewEvent}
                onClose={() => setViewEvent(null)}
                event={viewEvent} />
        </>
    );
}