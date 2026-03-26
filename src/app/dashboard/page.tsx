import NavbarLayout from "@/components/layouts/NavbarLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Link } from "react-router-dom";
import { CalendarPlus, Users, Megaphone, Clock, MapPin, Edit, Eye, TrendingUp, DollarSign, CalendarDays } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const events = [
    { id: 1, name: "Music Fest 2025", date: "2025-09-15", location: "Chennai", status: "Planning", attendees: 1200, revenue: 450000 },
    { id: 2, name: "Corporate Meetup", date: "2025-09-20", location: "Bangalore", status: "Confirmed", attendees: 450, revenue: 120000 },
    { id: 3, name: "Wedding Gala", date: "2025-09-22", location: "Mumbai", status: "Completed", attendees: 300, revenue: 80000 },
];

const chartData = [
    { name: "Jul", events: 3 },
    { name: "Aug", events: 5 },
    { name: "Sep", events: 8 },
    { name: "Oct", events: 6 },
    { name: "Nov", events: 9 },
];

export default function Dashboard() {
    const totalAttendees = events.reduce((sum, e) => sum + e.attendees, 0);
    const totalRevenue = events.reduce((sum, e) => sum + e.revenue, 0);

    return (
        <ProtectedRoute>
            <NavbarLayout>
                {/* Hero Section */}
                <section className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-3xl p-10 mb-10 shadow-xl">
                    <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-2">
                        Welcome Back 🎉
                    </h2>
                    <p className="text-white/90 text-lg max-w-xl">
                        Track your events, attendees, and revenue in one beautiful dashboard.
                    </p>
                    <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
                </section>

                {/* Overview Stats */}
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-md hover:shadow-lg transition">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-gray-700 font-medium">Total Events</h4>
                            <CalendarDays className="h-5 w-5 text-indigo-500" />
                        </div>
                        <p className="text-2xl font-bold">{events.length}</p>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-md hover:shadow-lg transition">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-gray-700 font-medium">Total Attendees</h4>
                            <Users className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold">{totalAttendees.toLocaleString()}</p>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-md hover:shadow-lg transition">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-gray-700 font-medium">Total Revenue</h4>
                            <DollarSign className="h-5 w-5 text-amber-500" />
                        </div>
                        <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                </section>

                {/* Event Trend Chart */}
                <section className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-md p-6 mb-12">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-indigo-500" /> Event Growth
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={chartData}>
                            <XAxis dataKey="name" stroke="#888" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="events" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </section>

                {/* Event List */}
                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-md hover:shadow-xl transition transform hover:-translate-y-1 hover:scale-[1.02]"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-gray-800">{event.name}</h3>
                                <div className="flex gap-3">
                                    <Link to={`/events/${event.id}`} className="hover:scale-110 transition">
                                        <Eye className="h-5 w-5 text-gray-600" />
                                    </Link>
                                    <Link to={`/events/edit/${event.id}`} className="hover:scale-110 transition">
                                        <Edit className="h-5 w-5 text-gray-600" />
                                    </Link>
                                </div>
                            </div>

                            <p className="text-gray-600 flex items-center gap-1 mb-1">
                                <Clock className="h-4 w-4" /> {event.date}
                            </p>
                            <p className="text-gray-600 flex items-center gap-1 mb-4">
                                <MapPin className="h-4 w-4" /> {event.location}
                            </p>

                            <div className="flex justify-between items-center">
                                <span className={`px-3 py-1 text-xs font-medium rounded-full 
                                    ${event.status === "Planning" ? "bg-yellow-100 text-yellow-800" :
                                        event.status === "Confirmed" ? "bg-blue-100 text-blue-800" :
                                            "bg-green-100 text-green-800"}`}>
                                    {event.status}
                                </span>
                                <span className="text-sm font-medium text-gray-700">
                                    👥 {event.attendees.toLocaleString()} Attendees
                                </span>
                            </div>
                        </div>
                    ))}
                </section>
            </NavbarLayout>
        </ProtectedRoute>
    );
}
