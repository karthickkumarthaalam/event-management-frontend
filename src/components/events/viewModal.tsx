import React, { useEffect, useState } from "react";
import { X, Calendar, MapPin, Clock, Users, Star, Building2, Building, Banknote } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { env } from "@/lib/env";

// Fix default marker icon in Leaflet
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function statusColor(status: string) {
    const colors = {
        planning: "bg-slate-100 text-slate-700 border-slate-200",
        confirmed: "bg-blue-100 text-blue-700 border-blue-200",
        ongoing: "bg-emerald-100 text-emerald-700 border-emerald-200",
        completed: "bg-green-100 text-green-700 border-green-200",
        cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    return (colors as Record<string, string>)[status] || colors.planning;
}

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${className}`}>
            {children}
        </span>
    );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>{children}</div>;
}

function Button({ children, onClick, variant = "primary", size = "md", className = "" }: { children: React.ReactNode; onClick?: () => void; variant?: string; size?: string; className?: string }) {
    const baseClasses =
        "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500",
        secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-500",
        ghost: "hover:bg-gray-100 text-gray-600 focus:ring-gray-500",
    };
    const sizes = {
        sm: "px-3 py-1.5 text-sm rounded-lg",
        md: "px-4 py-2 text-sm rounded-lg",
        icon: "p-2 rounded-lg",
    };

    return (
        <button onClick={onClick} className={`${baseClasses} ${(variants as Record<string, string>)[variant]} ${(sizes as Record<string, string>)[size]} ${className}`}>
            {children}
        </button>
    );
}

function SimpleMap({ location, coords }: { location: string; coords: [number, number] | null }) {
    if (!coords) return <p className="text-gray-500 text-sm">Loading map...</p>;

    return (
        <div className="h-64 rounded-xl overflow-hidden border border-blue-100">
            <MapContainer center={coords} zoom={13} className="h-full w-full">
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={coords}>
                    <Popup>{location}</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}

export default function ViewEventModal({ open = true, onClose, event }: { open?: boolean; onClose: () => void; event: Record<string, string | undefined | null> | null }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [coords, setCoords] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (event?.location) {
            fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(event.location as string)}`
            )
                .then((res) => res.json())
                .then((data) => {
                    if (data.length > 0) {
                        setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                    } else {
                        setCoords([40.7829, -73.9654]); // fallback
                    }
                })
                .catch(() => setCoords([40.7829, -73.9654]));
        }
    }, [event?.location]);

    if (!event || !open) return null;

    const e = event as Record<string, string>;

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    const getDateRange = () => {
        if (e.end_date && e.start_date !== e.end_date) {
            return `${formatDate(e.start_date)} - ${formatDate(e.end_date)}`;
        }
        return formatDate(e.start_date);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-gray-600 to-gray-100 px-4 py-6 text-white">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <Badge className={`${statusColor(e.status)} bg-white/20 border-white/30 text-white`}>
                                    {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                                </Badge>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">{e.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-white/90">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-sm">{getDateRange()}</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-black hover:bg-white/20 focus:ring-white/30"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="space-y-6">
                            <Card className="overflow-hidden">
                                <div className="flex items-center justify-center">
                                    {e.logo ? (
                                        <div className="relative">
                                            <img
                                                src={`${env.baseApi}${e.logo}`}
                                                alt={e.name}
                                                className={`w-48 h-48 object-contain rounded-lg transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"
                                                    }`}
                                                onLoad={() => setImageLoaded(true)}
                                            />
                                            {!imageLoaded && (
                                                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center p-8">
                                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Calendar className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 text-sm">No image available</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                            <Card className="p-6">
                                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <div className="h-2 w-2 bg-indigo-500 rounded-full" />
                                    Other Details
                                </h3>
                                <div className="flex flex-col gap-2">
                                    {e.country && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-slate-600" />
                                            <p className="text-slate-500">{e.country}</p>
                                        </div>
                                    )}
                                    {e.location && (
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-slate-600" />
                                            <p className="text-slate-500">{e.location}</p>
                                        </div>
                                    )}
                                    {e.address && (
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4 text-slate-600" />
                                            <p className="text-slate-500">{e.address}</p>
                                        </div>
                                    )}
                                    {e.currency && (
                                        <div className="flex items-center gap-2">
                                            <Banknote className="h-4 w-4 text-slate-600" />
                                            <p className="text-slate-500">{e.currency} - ( {e.currency_symbol} )</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                        <div className="lg:col-span-2 space-y-6">
                            {e.description && (
                                <Card className="p-6">
                                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <div className="h-2 w-2 bg-indigo-500 rounded-full" />
                                        About This Event
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">{e.description}</p>
                                </Card>
                            )}

                            <Card className="p-6">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="h-2 w-2 bg-indigo-500 rounded-full" />
                                    Location
                                </h3>
                                <SimpleMap location={e.location} coords={coords} />
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
