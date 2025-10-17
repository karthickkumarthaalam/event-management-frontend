"use client";

import React, { useState, useEffect } from "react";
import { X, User, Info, CreditCard, AlertTriangle, Mail, Smartphone } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-toastify";

import { Order } from "@/types/order";

interface RefundModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order;
    currency: string;
    onRefund: (reason: string, order: Order) => Promise<void>;
    onRefundSuccess?: () => void;
}

const TICKET_REFUND_REASONS = [
    "Event cancelled",
    "Event postponed",
    "Customer cannot attend",
    "Double booking",
    "Travel issues",
    "Emergency situation",
    "Schedule conflict",
    "Other personal reason",
];

export default function RefundModal({ isOpen, onClose, order, currency, onRefund, onRefundSuccess }: RefundModalProps) {
    const [reason, setReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ reason?: string; }>({});

    useEffect(() => {
        if (isOpen) {
            setReason("");
            setCustomReason("");
            setErrors({});
        }
    }, [isOpen]);

    const validateForm = () => {
        const newErrors: { reason?: string; } = {};
        if (!reason && !customReason.trim()) {
            newErrors.reason = "Please select or provide a refund reason.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const formatCurrency = (amount: string | number) => {
        const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
        }).format(numAmount);
    };

    const handleRefund = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const finalReason = reason === "Other personal reason" ? customReason : reason;
            await onRefund(finalReason, order);
            toast.success("Refund processed successfully.");
            if (onRefundSuccess) {
                onRefundSuccess();
            }
            onClose();
        } catch (error: any) {
            toast.error(error?.message || "Failed to process refund. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = order.orderDetails.totalAmount;
    const totalTickets = order.items.reduce((acc, t) => acc + t.quantity, 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl mx-4 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-gray-700" />
                        <h2 className="text-xl font-semibold text-gray-800">Process Refund</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition"
                    >
                        <X className="w-4 h-4 text-gray-600" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Event & Order Info */}
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                        <div className="flex flex-col md:flex-row gap-4 md:items-center">
                            <p className="font-bold text-blue-900 text-lg">Order Id: #{order.orderId}</p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1 bg-green-100 rounded-full px-3 py-1">
                                <User className="w-4 h-4 text-green-700" /> {order.purchaser.name}
                            </div>
                        </div>
                    </div>

                    {/* Purchaser Info */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex flex-col gap-2">
                        <h4 className="text-md font-semibold text-gray-700">Purchaser Info</h4>
                        <div className="flex flex-col sm:flex-row sm:gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-700" /> {order.purchaser.name}
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-700" /> {order.purchaser.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Smartphone className="w-4 h-4 text-gray-700" /> {order.purchaser.mobile}
                            </div>
                        </div>
                    </div>

                    {/* Tickets */}
                    <div className="bg-blue-50/50 rounded-lg border border-gray-200 p-4 max-h-64 flex flex-col">
                        <div className="flex justify-between items-center mb-3 font-medium text-gray-700">
                            <span>Tickets to Refund</span>
                            <span>{totalTickets} ticket{totalTickets > 1 ? 's' : ''}</span>
                        </div>
                        <div className="divide-y divide-gray-200 overflow-y-auto flex-1">
                            {order.items.map((ticket, index) => (
                                <div
                                    key={`${ticket.ticketRefId}-${index}`}
                                    className="flex justify-between items-center py-3 hover:bg-blue-50 rounded-md px-2 transition"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-800">{ticket.ticketClass}</span>
                                        <span className="text-sm text-gray-500">Qty: {ticket.quantity}</span>
                                    </div>
                                    <span className="font-medium text-gray-800">{formatCurrency(ticket.totalAmount)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-3 pt-3 border-t border-gray-200 font-semibold text-gray-800">
                            <span>Total Refund</span>
                            <span>{formatCurrency(totalAmount)}</span>
                        </div>
                    </div>

                    {/* Refund Reason */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Refund Reason *</Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger className="h-10 border-gray-300 rounded-md">
                                <SelectValue placeholder="Select refund reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {TICKET_REFUND_REASONS.map((r) => (
                                    <SelectItem key={r} value={r}>{r}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {reason === "Other personal reason" && (
                            <Textarea
                                placeholder="Provide custom reason..."
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                className="mt-2 border-gray-300 rounded-md"
                                rows={3}
                            />
                        )}
                        {errors.reason && (
                            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                                <AlertTriangle className="w-4 h-4" /> {errors.reason}
                            </div>
                        )}
                    </div>

                    {/* Notice */}
                    <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <Info className="w-5 h-5 text-yellow-700 mt-1" />
                        <div className="text-sm text-yellow-700">
                            You are about to process a refund of <strong>{formatCurrency(totalAmount)}</strong> for <strong>{totalTickets} ticket{totalTickets > 1 ? 's' : ''}</strong>. This action cannot be undone.
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button
                        onClick={handleRefund}
                        disabled={loading}
                        className="bg-gray-800 hover:bg-gray-900 text-white"
                    >
                        {loading ? "Processing..." : `Confirm Refund`}
                    </Button>
                </div>
            </div>
        </div>
    );
}
