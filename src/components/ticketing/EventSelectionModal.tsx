"use client";

import { useTicketing } from "@/contexts/TicketingContextT";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEvents } from "@/lib/events";



export default function EventSelectionModal() {
    const { selectedEvent, setSelectedEvent } = useTicketing();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function getEvents() {
            try {
                const data = await fetchEvents();
                setEvents(data.data);
            } finally {
                setLoading(false);
            }
        }

        getEvents();
    }, []);

    const handleBackdropClick = () => {
        if (window.history.length > 1) {
            navigate(-1);
            return;
        }

        navigate("/events", { replace: true });
    };

    if (selectedEvent) return null;

    return (
        <div
            className="fixed inset-0 z-[51] flex items-center justify-center bg-black/20 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4 border border-gray-100"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-center mb-5">
                    <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-gray-500 to-gray-900 text-transparent bg-clip-text mb-4">
                        Select an Event to Manage Tickets
                    </h1>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-gray-500">Loading events...</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-500">No events found.</p>
                        <p className="text-sm text-gray-400 mt-1">Create an event to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-blue-50"
                                onClick={() => setSelectedEvent(event)}
                            >
                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{event.name}</h3>
                                    <div className="flex items-center mt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <p className="text-sm text-gray-600 truncate">{event.location || "No location"}</p>
                                    </div>
                                    <div className="flex items-center mt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-xs text-gray-500">
                                            {new Date(event.start_date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

}
