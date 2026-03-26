import { fetchSingleOrder, generateToken } from "@/lib/order";
import { downloadAllTicketsAsZip } from "@/lib/pdf";
import { formatDate } from "@/lib/utils";
import { env } from "@/lib/env";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    Loader,
    Calendar,
    MapPin,
    Ticket,
    Download,
    Gift,
} from "lucide-react";
import QRCode from "qrcode";

interface TicketType {
    id: string;
    ticketId: string;
    ticketClass: string;
    quantity: number;
    price: string;
    totalAmount: string;
    status: string;
    checkedIn: boolean;
    taxes?: { taxName: string; taxAmount: string; }[];
    qrCode?: string;
}

interface AddonType {
    id: string;
    addonName: string;
    description?: string;
    price: string;
    quantity: string;
    totalAmount: string;
}

interface Order {
    orderId: string;
    event: {
        name: string;
        logo?: string;
        start_date: string;
        end_date: string;
        location: string;
        address: string;
        currency: string;
        currency_symbol: string;
    };
    Items: TicketType[];
    addons?: AddonType[];
}

export default function TicketListing() {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const data: Order = await fetchSingleOrder(orderId as string, true);

            const ticketsWithQR = await Promise.all(
                data.Items.map(async (ticket) => {
                    const token = await generateToken(ticket.id);
                    const qrCode = await QRCode.toDataURL(token);
                    return { ...ticket, qrCode };
                })
            );

            setOrder({ ...data, Items: ticketsWithQR });
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to fetch Order");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                <Loader className="animate-spin w-10 h-10 text-purple-600" />
            </div>
        );

    if (!order)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="text-center text-gray-600">Order not found</div>
            </div>
        );

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-6 md:py-10">
            <div className="max-w-7xl mx-auto px-4 space-y-10">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                        <Ticket className="w-8 h-8 text-purple-600" />
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                            Event {order.Items.length > 1 ? "Tickets" : "Ticket"}
                        </h1>
                    </div>
                    <p className="text-gray-600 text-sm md:text-base">
                        Download and present{" "}
                        {order.Items.length > 1 ? "these tickets" : "this ticket"} at the
                        venue entrance.
                    </p>
                </div>

                {/* Download Button */}
                <div className="flex justify-center">
                    <button
                        onClick={() => {
                            const ticketIds = order.Items.map((ticket) => `ticket-${ticket.ticketId}`);
                            const addonIds = order.addons?.map((addon) => `ticket-${addon.id}`) || [];
                            const allIds = [...ticketIds, ...addonIds];
                            downloadAllTicketsAsZip(allIds);

                        }}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-500 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-sm"
                    >
                        <Download size={16} />
                        <span>Download All Tickets</span>
                    </button>
                </div>

                {/* Tickets */}
                <div
                    className={`${order.Items.length > 1
                        ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
                        : "flex items-center justify-center"
                        }`}
                >
                    {order.Items.map((ticket) => (
                        <div
                            key={ticket.ticketId}
                            id={`ticket-${ticket.ticketId}`}
                            className="relative bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 w-full max-w-[600px] mx-auto"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-purple-600   to-pink-500 p-5 md:p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-center space-x-3 md:space-x-4">
                                    {order.event.logo && (
                                        <img
                                            src={`${env.baseApi}${order.event.logo}`}
                                            alt="Event Logo"
                                            className="w-12 h-12 md:w-14 md:h-14 rounded-lg shadow-md object-cover"
                                        />
                                    )}
                                    <div>
                                        <h2 className="text-lg md:text-xl font-bold whitespace-nowrap">
                                            {order.event.name}
                                        </h2>
                                        <p className="text-purple-100 text-xs md:text-sm">
                                            {formatDate(order.event.start_date)} -{" "}
                                            {formatDate(order.event.end_date)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${ticket.checkedIn
                                            ? "bg-green-500 text-white"
                                            : "bg-yellow-300 text-gray-800"
                                            }`}
                                    >
                                        {ticket.checkedIn ? "Checked In" : "Not Checked In"}
                                    </span>
                                    <p className="font-semibold text-sm md:text-base">
                                        {order.event.currency_symbol} {ticket.totalAmount}
                                    </p>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-5 md:p-6 flex flex-col md:flex-row justify-between items-start gap-6">
                                <div className="flex-1 w-full space-y-4">
                                    <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                                        <h2 className="text-xl font-bold text-indigo-700 mb-1">
                                            {ticket.ticketClass}
                                        </h2>
                                        <h4 className="text-3xl font-bold text-gray-800">
                                            #{ticket.ticketId}
                                        </h4>
                                        <div>
                                            <span className="text-gray-600">Status: </span>
                                            <span
                                                className={`font-semibold ${ticket.status === "confirmed"
                                                    ? "text-green-600"
                                                    : "text-yellow-600"
                                                    }`}
                                            >
                                                {ticket.status.charAt(0).toUpperCase() +
                                                    ticket.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center space-x-2 text-gray-700">
                                            <Calendar className="w-4 h-4 text-purple-500" />
                                            <span>{formatDate(order.event.start_date)}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-700">
                                            <MapPin className="w-4 h-4 text-purple-500" />
                                            <span className="truncate">
                                                {order.event.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {ticket.qrCode && (
                                    <div className="flex flex-col items-center space-y-3 self-center">
                                        <img
                                            src={ticket.qrCode}
                                            alt="Ticket QR Code"
                                            className="w-28 h-28 md:w-32 md:h-32 rounded-lg border shadow-sm"
                                        />
                                        <p className="text-xs text-gray-500">Scan at entrance</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="bg-gradient-to-r from-purple-600 to-pink-500 h-2"></div>
                        </div>
                    ))}
                </div>

                {/* Add-ons */}
                {order.addons && order.addons.length > 0 && (
                    <div className="mt-12 space-y-6">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center space-x-2">
                            <Gift className="text-pink-500 w-5 h-5" />
                            <span>Purchased Add-ons</span>
                        </h2>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {order.addons.map((addon) => (
                                <div
                                    key={addon.id}
                                    id={`ticket-${addon.id}`}
                                    className="relative bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 w-full max-w-[600px] mx-auto"
                                >
                                    {/* Top Event Section */}
                                    <div className="bg-gradient-to-r from-pink-600  to-rose-500 text-white px-6 py-5 flex flex-col justify-between">
                                        <h2 className="text-xl font-bold">{order.event.name}</h2>
                                        <p className="text-sm text-pink-100 mt-1">
                                            {order.event.location} • {new Date(order.event.start_date).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Ticket Body */}
                                    <div className="flex flex-col relative">
                                        {/* Tear Line Effect */}
                                        <div className="absolute left-0 right-0 top-0 border-t border-dashed border-gray-300"></div>

                                        <div className="flex justify-between items-start p-6">
                                            {/* Left Section */}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-800">{addon.addonName}</h3>
                                                {addon.description && (
                                                    <p className="text-sm text-gray-500 mt-1">{addon.description}</p>
                                                )}

                                                <p className="text-sm text-gray-500">Qty: {addon.quantity}</p>

                                            </div>

                                            {/* Right Section */}
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-800 text-lg">
                                                    {order.event.currency_symbol} {addon.totalAmount}
                                                </p>
                                                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold">
                                                    Confirmed
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Gradient Strip */}
                                    <div className="bg-gradient-to-r from-pink-600 to-rose-500 h-1.5"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* Footer Note */}
                <div className="text-center text-xs text-gray-500 mt-10 print:hidden">
                    <p>Please present this QR code at the entrance for verification.</p>
                    <p className="mt-1">Each ticket is unique and non-transferable.</p>
                </div>
            </div>
        </div >
    );
}
