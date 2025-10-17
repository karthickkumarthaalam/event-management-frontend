"use client";

import React, { useEffect, useState } from "react";
import { X, Ticket, Calendar, MapPin, Gift, Loader } from "lucide-react";
import QRCode from "qrcode";
import { formatDate } from "@/lib/utils";
import { Order, TicketType } from "@/types/order";
import { generateToken } from "@/lib/order";
import { useTicketing } from "@/contexts/TicketingContextT";

interface ViewTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

export default function ViewTicketModal({ isOpen, onClose, order }: ViewTicketModalProps) {
    const [ticketsWithQR, setTicketsWithQR] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(false);
    const { selectedEvent } = useTicketing();

    useEffect(() => {
        if (!order || !isOpen) return;

        const generateQRCodes = async () => {
            setLoading(true);
            try {
                const tickets = await Promise.all(
                    order.items.map(async (ticket) => {
                        const token = await generateToken(ticket.id);
                        const qrCode = await QRCode.toDataURL(token);
                        return { ...ticket, qrCode };
                    })
                );
                setTicketsWithQR(tickets);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        generateQRCodes();
    }, [order, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Right-side sliding panel */}
            <div className="ml-auto w-full max-w-2xl h-full bg-gray-50 shadow-xl overflow-y-auto transform transition-transform duration-300 ease-in-out">
                {/* Header */}
                <div className=" bg-gray-900 flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <Ticket className="w-6 h-6 text-purple-600" />
                        <h2 className="text-lg font-bold text-gray-100">View Ticket</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader className="animate-spin w-10 h-10 text-purple-600" />
                        </div>
                    ) : (
                        <>
                            {ticketsWithQR.map((ticket) => (
                                <div
                                    key={ticket.ticketId}
                                    className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
                                >
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 text-white flex justify-between items-start gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold">{selectedEvent.name}</h3>
                                            <p className="text-sm text-purple-100">
                                                {formatDate(selectedEvent.start_date)} - {formatDate(selectedEvent.end_date)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${ticket.checkedIn ? "bg-green-500 text-white" : "bg-yellow-300 text-gray-800"
                                                    }`}
                                            >
                                                {ticket.checkedIn ? "Checked In" : "Not Checked In"}
                                            </span>
                                            <p className="font-semibold text-sm mt-1">
                                                {selectedEvent.currency_symbol} {ticket.totalAmount}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Ticket Details */}
                                    <div className="p-4 flex flex-col md:flex-row justify-between items-start gap-4">
                                        <div className="flex-1 space-y-3">
                                            <h4 className="text-xl font-bold text-indigo-700">{ticket.ticketClass}</h4>
                                            <p className="text-gray-800 font-semibold text-lg">#{ticket.ticketId}</p>
                                            <p>
                                                Status:{" "}
                                                <span className={`font-semibold ${ticket.status === "confirmed" ? "text-green-600" : "text-yellow-600"}`}>
                                                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                                </span>
                                            </p>
                                            <div className="flex items-center gap-4 text-gray-700 text-sm">
                                                <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-purple-500" /> {formatDate(selectedEvent.start_date)}</div>
                                                <div className="flex items-center gap-1"><MapPin className="w-4 h-4 text-purple-500" /> {selectedEvent.location}</div>
                                            </div>
                                        </div>

                                        {ticket.qrCode && (
                                            <div className="flex flex-col items-center space-y-2">
                                                <img src={ticket.qrCode} className="w-28 h-28 rounded-lg border shadow-sm" />
                                                <span className="text-xs text-gray-500">Scan at entrance</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Add-ons */}
                            {order?.addons && order.addons.length > 0 && (
                                <div className="mt-6 space-y-4">
                                    <h4 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                                        <Gift className="text-pink-500 w-5 h-5" /> Purchased Add-ons
                                    </h4>
                                    {order.addons.map((addon, index) => (
                                        <div key={index} className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h5 className="font-semibold text-gray-800">{addon.addonName}</h5>
                                                    <p className="text-sm text-gray-500 mt-1">Qty: {addon.quantity}</p>
                                                </div>
                                                <p className="font-semibold text-gray-800">
                                                    {selectedEvent.currency_symbol} {addon.totalAmount}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Note */}
                {/* <div className="p-6 text-center text-xs text-gray-500 border-t border-gray-200">
                    Present the QR code at the entrance. Each ticket is unique and non-transferable.
                </div> */}
            </div>
        </div>
    );
}
