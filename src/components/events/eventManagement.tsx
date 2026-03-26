"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchEvents, deleteEvent } from "@/lib/events";
import { env } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import debounce from "lodash.debounce";
import { Plus, Search, Edit, Trash2, Eye, Calendar, MapPin, Grid, List, Building2, Banknote } from "lucide-react";
import EventModal from "./EventModal";
import ConfirmDialog from "../common/confirmDialog";
import ViewEventModal from "./viewModal";

function statusColor(status: string) {
    switch (status) {
        case "planning":
            return "bg-slate-100 text-slate-700 border-slate-200";
        case "confirmed":
            return "bg-blue-100 text-blue-700 border-blue-200";
        case "ongoing":
            return "bg-emerald-100 text-emerald-700 border-emerald-200";
        case "completed":
            return "bg-green-100 text-green-700 border-green-200";
        case "cancelled":
            return "bg-red-100 text-red-700 border-red-200";
        default:
            return "bg-slate-100 text-slate-700 border-slate-200";
    }
}

export default function EventManagement() {
    const [events, setEvents] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [viewEvent, setViewEvent] = useState<any | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    // Fetch events
    const loadEvents = async (query = "") => {
        setLoading(true);
        try {
            const res = await fetchEvents(query ? { search: query } : {});
            setEvents(res.data);
        } finally {
            setLoading(false);
        }
    };

    const debouncedLoadEvents = useMemo(() => debounce(loadEvents, 400), []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedLoadEvents(value);
    };

    useEffect(() => {
        loadEvents();
        return () => {
            debouncedLoadEvents.cancel();
        };
    }, []);

    const formatDateRange = (startDate: string, endDate?: string) => {
        const start = new Date(startDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        if (endDate && endDate !== startDate) {
            const end = new Date(endDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            return `${start} - ${end}`;
        }
        return start;
    };

    return (
        <div className="min-h-screen md:p-6 lg:p-8">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-2xl  font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent mb-2">
                            Event Management
                        </h1>
                    </div>
                    <Button
                        onClick={() => {
                            setSelectedEvent(null);
                            setModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                        <Plus size={20} />
                        Create Event
                    </Button>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                    <div className="flex flex-row gap-4 items-center justify-between">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <Input
                                    placeholder="Search events by name, location, or status..."
                                    className="pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    value={search}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-slate-100 rounded-xl p-1">
                                <Button
                                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('table')}
                                    className="rounded-lg px-3"
                                >
                                    <List size={16} />
                                </Button>
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="rounded-lg px-3"
                                >
                                    <Grid size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-16">
                        <div className="flex flex-col items-center justify-center">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-slate-200 rounded-full animate-spin border-t-indigo-600"></div>
                            </div>
                            <p className="text-slate-500 mt-4 text-lg">Loading events...</p>
                        </div>
                    </div>
                ) : events.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-16">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Calendar className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">No events found</h3>
                            <p className="text-slate-500 mb-6">
                                {search ? "Try adjusting your search terms" : "Get started by creating your first event"}
                            </p>
                            <Button
                                onClick={() => {
                                    setSelectedEvent(null);
                                    setModalOpen(true);
                                }}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl"
                            >
                                <Plus size={16} className="mr-2" />
                                Create Your First Event
                            </Button>
                        </div>
                    </div>
                ) : viewMode === 'table' ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto w-full">
                            <table className="min-w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">Event</th>
                                        <th className="px-2 py-4 text-left text-sm font-semibold text-slate-700 hidden sm:table-cell">Status</th>
                                        <th className="px-2 py-4 text-left text-sm font-semibold text-slate-700 hidden lg:table-cell">Location</th>
                                        <th className="px-2 py-4 text-left text-sm font-semibold text-slate-700 hidden xl:table-cell">Currency</th>
                                        <th className="px-2 py-4 text-left text-sm font-semibold text-slate-700 hidden md:table-cell">Dates</th>
                                        <th className="px-4 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {events.map((event) => (
                                        <tr key={event.id} className="hover:bg-slate-50 transition-all duration-200 group">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3 hover:cursor-pointer" onClick={() => setViewEvent(event)}>
                                                    <div className="relative">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center border border-slate-200">
                                                            <Calendar className="h-5 w-5 text-primary" />
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors duration-200 text-sm md:text-base">
                                                            {event.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500 sm:hidden">
                                                            {formatDateRange(event.start_date, event.end_date)}
                                                        </p>
                                                        <div className="flex items-center gap-1 mt-1 sm:hidden">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor(event.status)}`}>
                                                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 hidden sm:table-cell">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColor(event.status)} whitespace-nowrap`}>
                                                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-2 py-4 hidden lg:table-cell">
                                                <div className="space-y-1">
                                                    {event.country && (
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3 text-slate-400" />
                                                            <span className="text-xs text-slate-700 truncate max-w-32">
                                                                {event.country}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {event.location ? (
                                                        <div className="flex items-center gap-1">
                                                            <Building2 className="h-3 w-3 text-slate-400" />
                                                            <span className="text-xs text-slate-700 truncate max-w-32">
                                                                {event.location}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">—</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 hidden xl:table-cell">
                                                {event.currency && (
                                                    <div className="flex items-center gap-1">
                                                        <Banknote className="h-3 w-3 text-slate-400" />
                                                        <span className="text-xs text-slate-700 truncate max-w-32">
                                                            {event.currency} ({event.currency_symbol})
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-2 py-4 hidden md:table-cell">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 text-slate-400" />
                                                    <span className="text-xs text-slate-700 whitespace-nowrap">
                                                        {formatDateRange(event.start_date, event.end_date)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    {/* <Button
                                                        size="sm"
                                                        onClick={() => setViewEvent(event)}
                                                        className="w-7 h-7 p-0 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-600 transition-all duration-200 hover:scale-105"
                                                    >
                                                        <Eye size={14} />
                                                    </Button> */}
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedEvent(event);
                                                            setModalOpen(true);
                                                        }}
                                                        className="w-7 h-7 p-0 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all duration-200 hover:scale-105"
                                                    >
                                                        <Edit size={14} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setDeleteId(event.id)}
                                                        className="w-7 h-7 p-0 rounded-md bg-red-100 hover:bg-red-200 text-red-600 transition-all duration-200 hover:scale-105"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-20"> {/* Added pb-20 for bottom padding */}
                        {events.map((event) => (
                            <div key={event.id} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group">
                                {/* Card Header */}
                                <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
                                    {event.logo ? (
                                        <img
                                            src={`${env.baseApi}${event.logo}`}
                                            alt={event.name}
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Calendar className="h-16 w-16 text-slate-400" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border backdrop-blur-sm ${statusColor(event.status)} bg-opacity-90`}>
                                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-6">
                                    <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
                                        {event.name}
                                    </h3>

                                    <div className="space-y-3 mb-6">
                                        {event.country && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <MapPin className="h-4 w-4 text-slate-400" />
                                                <span className="truncate">{event.country}</span>
                                            </div>
                                        )}
                                        {event.location && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Building2 className="h-4 w-4 text-slate-400" />
                                                <span className="truncate">{event.location}</span>
                                            </div>
                                        )}
                                        {event.currency && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Banknote className="h-4 w-4 text-slate-400" />
                                                <span className="truncate">{event.currency} - ( {event.currency_symbol} )</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            <span>{formatDateRange(event.start_date, event.end_date)}</span>
                                        </div>
                                    </div>

                                    {/* Card Actions */}
                                    <div className="flex items-center justify-between">
                                        <Button
                                            onClick={() => setViewEvent(event)}
                                            variant="outline"
                                            size="sm"
                                            className="mr-2 bg-blue-100 border-blue-200 hover:bg-blue-50 rounded-xl text-blue-500"
                                        >
                                            <Eye size={14} className="mr-1" />
                                            View
                                        </Button>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedEvent(event);
                                                    setModalOpen(true);
                                                }}
                                                className="w-9 h-9 p-0 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
                                            >
                                                <Edit size={14} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => setDeleteId(event.id)}
                                                className="w-9 h-9 p-0 rounded-xl bg-red-100 hover:bg-red-200 text-red-600"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                )}
                {/* Results Count */}
                {events.length > 0 && (
                    <div className="text-center text-slate-600">
                        <p className="text-sm">
                            Showing {events.length} event{events.length !== 1 ? 's' : ''}
                            {search && ` for "${search}"`}
                        </p>
                    </div>
                )}
            </div>

            {/* Event Modal */}
            <EventModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                event={selectedEvent}
                onSaved={() => loadEvents(search)}
            />

            <ViewEventModal
                open={!!viewEvent}
                onClose={() => setViewEvent(null)}
                event={viewEvent}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={async () => {
                    if (deleteId) {
                        await deleteEvent(deleteId);
                        setDeleteId(null);
                        loadEvents(search);
                    }
                }}
                title="Delete Event"
                message="Are you sure you want to delete this event? This action cannot be undone."
            />
        </div>
    );
}
