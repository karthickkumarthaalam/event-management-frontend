import { useEffect, useState, useMemo } from "react";
import { fetchEvents } from "@/lib/events";
import { Button } from "@/components/ui/button";
import {
    Plus,
    Calendar,
    TrendingUp,
    Clock,
    MapPin,
    Eye,
    ChevronLeft,
    ChevronRight,
    Search,
    Target,
    Zap,
    Crown,
    Sparkles,
    Activity
} from "lucide-react";
import EventModal from "./EventModal";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ViewEventModal from "./viewModal";
import { Line, Pie } from "react-chartjs-2";
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend, Filler);

export default function Dashboard() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewEvent, setViewEvent] = useState<any | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [activeTab, setActiveTab] = useState("overview");

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

    // Filtered events
    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" || event.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [events, searchTerm, statusFilter]);

    // Stats with enhanced metrics
    const stats = useMemo(() => {
        const totalEvents = events.length;
        const upcomingEvents = events.filter(e => new Date(e.start_date) > new Date()).length;
        const completedEvents = events.filter(e => e.status === "completed").length;
        const cancelledEvents = events.filter(e => e.status === "cancelled").length;
        const confirmedEvents = events.filter(e => e.status === "confirmed").length;
        const ongoingEvents = events.filter(e => e.status === "ongoing").length;

        // Performance metrics
        const completionRate = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;
        const cancellationRate = totalEvents > 0 ? (cancelledEvents / totalEvents) * 100 : 0;
        const successRate = totalEvents > 0 ? ((completedEvents + confirmedEvents) / totalEvents) * 100 : 0;

        return {
            totalEvents,
            upcomingEvents,
            completedEvents,
            cancelledEvents,
            confirmedEvents,
            ongoingEvents,
            completionRate,
            cancellationRate,
            successRate
        };
    }, [events]);

    const statusColor = (status: string) => {
        switch (status) {
            case "planning": return "bg-slate-100 text-slate-700 border-slate-200";
            case "confirmed": return "bg-purple-100 text-purple-700 border-purple-200";
            case "ongoing": return "bg-amber-100 text-amber-700 border-amber-200";
            case "completed": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "cancelled": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    // Enhanced chart data
    const availableYears = Array.from(
        new Set(events.map(event => new Date(event.start_date).getFullYear()))
    ).sort((a, b) => b - a);

    if (!availableYears.includes(selectedYear) && availableYears.length > 0) {
        setSelectedYear(availableYears[0]);
    }

    // Enhanced Line Chart Data
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
                label: "Events Created",
                data: eventsPerMonth,
                borderColor: "rgba(139, 92, 246, 1)",
                backgroundColor: "rgba(139, 92, 246, 0.1)",
                tension: 0.4,
                fill: true,
                pointBackgroundColor: "rgba(139, 92, 246, 1)",
                pointBorderColor: "#fff",
                pointBorderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 8,
            },
        ],
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#fff',
                bodyColor: '#fff',
                cornerRadius: 12,
                displayColors: false,
                padding: 12,
                callbacks: {
                    title: (context: any) => {
                        return `${months[context[0].dataIndex]} ${selectedYear}`;
                    },
                    label: (context: any) => {
                        return `${context.parsed.y} events`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    color: '#64748B',
                    font: { size: 11 }
                },
                grid: {
                    color: 'rgba(100, 116, 139, 0.1)',
                    drawBorder: false
                },
                border: { display: false }
            },
            x: {
                grid: { display: false },
                ticks: {
                    color: '#64748B',
                    font: { size: 11 }
                },
                border: { display: false }
            },
        },
        elements: {
            line: {
                borderWidth: 3,
            }
        }
    };

    // Enhanced Pie Chart
    const pieChartData = {
        labels: ["Upcoming", "Completed", "Cancelled", "Confirmed", "Ongoing"],
        datasets: [
            {
                data: [
                    stats.upcomingEvents,
                    stats.completedEvents,
                    stats.cancelledEvents,
                    stats.confirmedEvents,
                    stats.ongoingEvents
                ],
                backgroundColor: [
                    "rgba(59, 130, 246, 0.9)",
                    "rgba(16, 185, 129, 0.9)",
                    "rgba(239, 68, 68, 0.9)",
                    "rgba(139, 92, 246, 0.9)",
                    "rgba(245, 158, 11, 0.9)"
                ],
                borderColor: [
                    "rgba(59, 130, 246, 1)",
                    "rgba(16, 185, 129, 1)",
                    "rgba(239, 68, 68, 1)",
                    "rgba(139, 92, 246, 1)",
                    "rgba(245, 158, 11, 1)"
                ],
                borderWidth: 3,
                hoverOffset: 8,
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
                    font: { size: 11 },
                    color: '#64748B'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#fff',
                bodyColor: '#fff',
                cornerRadius: 12,
                padding: 12,
            }
        },
        cutout: '50%'
    };


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

    const getPerformanceColor = (rate: number) => {
        if (rate >= 80) return "text-emerald-600";
        if (rate >= 60) return "text-amber-600";
        return "text-red-600";
    };

    const getPerformanceIcon = (rate: number) => {
        if (rate >= 80) return <Crown className="h-4 w-4" />;
        if (rate >= 60) return <TrendingUp className="h-4 w-4" />;
        return <Target className="h-4 w-4" />;
    };

    return (
        <>
            <div className="min-h-screen md:p-6">
                <div className="max-w-8xl mx-auto space-y-8">
                    {/* Enhanced Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-2xl shadow-lg border border-slate-100">
                                    <Activity className="h-6 w-6 text-purple-600" />
                                </div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                                    Event Dashboard
                                </h1>
                            </div>
                            <p className="text-slate-600 text-lg">Manage and analyze your events performance</p>
                        </div>
                        <div className="flex items-center gap-3">

                            <Button
                                className="flex items-center gap-2 bg-gradient-to-br from-blue-500 to-blue-700  text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 group"
                                onClick={() => setModalOpen(true)}
                            >
                                <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                Create Event
                            </Button>
                        </div>
                    </div>

                    {/* Enhanced Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50/80 shadow-lg hover:shadow-xl transition-all duration-300 group">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-slate-600">Total Events</p>
                                        <p className="text-3xl font-bold text-slate-800">{stats.totalEvents}</p>
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <Sparkles className="h-3 w-3" />
                                            All time events
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl group-hover:from-slate-200 group-hover:to-slate-300 transition-all duration-300">
                                        <Calendar className="h-8 w-8 text-slate-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-blue-50/80 shadow-lg hover:shadow-xl transition-all duration-300 group">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-slate-600">Upcoming</p>
                                        <p className="text-3xl font-bold text-blue-600">{stats.upcomingEvents}</p>
                                        <div className="flex items-center gap-1 text-xs text-blue-500">
                                            <Clock className="h-3 w-3" />
                                            Scheduled events
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                                        <Clock className="h-8 w-8 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-emerald-50/80 shadow-lg hover:shadow-xl transition-all duration-300 group">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-slate-600">Completed</p>
                                        <p className="text-3xl font-bold text-emerald-600">{stats.completedEvents}</p>
                                        <div className="flex items-center gap-1 text-xs text-emerald-500">
                                            <TrendingUp className="h-3 w-3" />
                                            Successful events
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl group-hover:from-emerald-200 group-hover:to-emerald-300 transition-all duration-300">
                                        <TrendingUp className="h-8 w-8 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-amber-50/80 shadow-lg hover:shadow-xl transition-all duration-300 group">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-slate-600">Success Rate</p>
                                        <p className={`text-3xl font-bold ${getPerformanceColor(stats.successRate)}`}>
                                            {stats.successRate.toFixed(1)}%
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-amber-500">
                                            {getPerformanceIcon(stats.successRate)}
                                            Performance score
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl group-hover:from-amber-200 group-hover:to-amber-300 transition-all duration-300">
                                        <Zap className="h-8 w-8 text-amber-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Enhanced Charts Section */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            {/* Enhanced Line Chart */}
                            <Card className="xl:col-span-2 border-0 bg-gradient-to-br from-white to-slate-50/80 shadow-lg hover:shadow-xl transition-all duration-300">
                                <CardHeader className="pb-4">
                                    <div className="flex flex-col md:flex-row items-start gap-2 md:items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl font-bold text-slate-800">Events Trend</CardTitle>
                                            <CardDescription>Monthly event creation overview for {selectedYear}</CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={goToPreviousYear}
                                                    className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100"
                                                    disabled={availableYears.length <= 1}
                                                >
                                                    <ChevronLeft size={16} />
                                                </Button>
                                                <span className="px-3 text-sm font-medium text-slate-700 min-w-[80px] text-center">
                                                    {selectedYear}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={goToNextYear}
                                                    className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100"
                                                    disabled={availableYears.length <= 1}
                                                >
                                                    <ChevronRight size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <Line data={lineChartData} options={lineChartOptions} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Enhanced Pie Chart */}
                            <Card className="border-0 bg-gradient-to-br from-white to-slate-50/80 shadow-lg hover:shadow-xl transition-all duration-300">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl font-bold text-slate-800">Status Distribution</CardTitle>
                                    <CardDescription>Current event status breakdown</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <Pie data={pieChartData} options={pieChartOptions} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Enhanced Events Table */}
                    <Card className="border-0 bg-gradient-to-br from-white to-slate-50/80 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <CardHeader className="border-b border-slate-100">
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-xl font-bold text-slate-800">Upcoming Events</CardTitle>
                                    <CardDescription>Your scheduled and confirmed events</CardDescription>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                    <div className="relative flex-1 lg:flex-none">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Search events..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-full lg:w-64"
                                        />
                                    </div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-full lg:w-40 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                                            <SelectValue placeholder="Filter status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="planning">Planning</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="ongoing">Ongoing</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-12 text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                    <p className="text-slate-500 mt-4">Loading events...</p>
                                </div>
                            ) : filteredEvents.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-400 text-lg">No events found</p>
                                    <p className="text-slate-400 text-sm">Create your first event to get started</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50/80 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Event Name</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Start Date</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Location</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredEvents
                                                .filter(e => new Date(e.start_date) > new Date())
                                                .slice(0, 8)
                                                .map(event => (
                                                    <tr key={event.id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                                    <Calendar className="h-6 w-6 text-purple-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-800 whitespace-nowrap">{event.name}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge className={`px-3 py-1.5 rounded-full text-xs font-medium border ${statusColor(event.status)}`}>
                                                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-medium text-slate-700 whitespace-nowrap">
                                                                {new Date(event.start_date).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3 text-slate-400" />
                                                                <p className="text-sm text-slate-600">{event.location || "Not specified"}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setViewEvent(event)}
                                                                    className="h-9 w-9 p-0 hover:bg-slate-100 rounded-xl transition-colors duration-200"
                                                                >
                                                                    <Eye className="h-4 w-4 text-slate-600" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div >

            {/* Event Modal */}
            < EventModal
                open={modalOpen}
                onClose={() => setModalOpen(false)
                }
                event={null}
                onSaved={() => loadEvents()}
            />

            < ViewEventModal
                open={!!viewEvent}
                onClose={() => setViewEvent(null)}
                event={viewEvent}
            />
        </>
    );
}
