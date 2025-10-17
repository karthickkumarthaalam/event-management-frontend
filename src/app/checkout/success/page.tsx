"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader, MailCheck } from "lucide-react";
import { fetchSingleOrder } from "@/lib/order";

interface Order {
    id: string;
    orderId: string;
    totalAmount: number;
    purchaserName: string;
    purchaseEmail: string;
    items: {
        name: string;
        quantity: number;
        totalAmount: number;
    }[];
    currency: string;
    event?: {
        name: string;
        logo?: string;
        location?: string;
    };
    addons: {
        addonName: string;
        quantity: number;
        totalAmount: number;
    };
}

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    const orderId = searchParams.get("orderId");

    useEffect(() => {
        if (!orderId) {
            router.push(`/error?msg=${encodeURIComponent("Order ID Not Found")}`);
            return;
        }

        const fetchOrder = async () => {
            try {
                const data = await fetchSingleOrder(orderId, true);
                const groupedItems = Object.values(
                    data.Items.reduce((acc: any, item: any) => {
                        const key = item.ticketClass;
                        if (!acc[key]) {
                            acc[key] = {
                                name: item.ticketClass,
                                quantity: 0,
                                totalAmount: 0,
                            };
                        }
                        acc[key].quantity += item.quantity;
                        acc[key].totalAmount += parseFloat(item.totalAmount);
                        return acc;
                    }, {})
                ) as { name: string; quantity: number; totalAmount: number; }[];

                const transfromedOrder: Order = {
                    id: data.id,
                    orderId: data.orderId,
                    totalAmount: parseFloat(data.totalAmount),
                    purchaserName: data.purchaserName,
                    purchaseEmail: data.purchaseEmail,
                    items: groupedItems,
                    currency: data.event?.currency_symbol,
                    event: data.event ? {
                        name: data.event.name,
                        logo: data.event.logo,
                        location: data.event.location
                    } : undefined,
                    addons: data.addons.map((addon: any) => ({
                        addonName: addon.addonName,
                        quantity: addon.quantity,
                        totalAmount: addon.totalAmount
                    }))
                };

                setOrder(transfromedOrder);
            } catch (err) {
                console.error(err);
                router.push(`/error?msg=${encodeURIComponent("Order Not Found")}`);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, router]);

    if (loading) {
        return <Loader className="animate-spin w-10 h-10 mx-auto mt-20" />;
    }

    if (!order) return null;

    return (
        <div className="max-w-3xl mx-auto py-12 px-4 space-y-8">
            {/* Success Header */}
            <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 flex items-center justify-center bg-green-100 rounded-full">
                    <MailCheck className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-green-600">
                    Payment Successful!
                </h1>
                <p className="text-gray-700 text-lg">
                    Thank you, <span className="font-semibold">{order.purchaserName}</span>!
                    Your payment of <span className="font-semibold">{order.currency} {order.totalAmount.toFixed(2)}</span> has been successfully processed.
                </p>
                <p className="text-gray-500 text-sm">
                    Your tickets have been sent to your registered email:
                    <span className="font-medium ml-1">{order.purchaseEmail}</span>
                </p>
            </div>

            {/* Event Info */}
            {order.event && (
                <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4 border border-gray-100">
                    {order.event.logo && (
                        <img
                            src={`${process.env.NEXT_PUBLIC_BASE_API}${order.event.logo}`}
                            alt={order.event.name}
                            className="w-20 h-20 object-cover rounded-lg"
                        />
                    )}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{order.event.name}</h2>
                        <p className="text-gray-600">{order.event.location}</p>
                        <p className="text-gray-500 text-sm mt-1">Order ID: <span className="text-gray-800 font-semibold text-lg">#{order.orderId}</span></p>
                    </div>
                </div>
            )}

            {/* Order Details */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Tickets</h3>
                <div className="divide-y divide-gray-200">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-2">
                            <span className="text-gray-700">{item.name} × {item.quantity}</span>
                            <span className="font-semibold text-gray-900">{order.currency} {item.totalAmount.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="divied-y divide-gray-300">
                    {
                        order.addons?.map((addon: any, idx: number) => (
                            <div key={idx} className="flex justify-between py-2">
                                <span className="text-gray-700">{addon.addonName} × {addon.quantity}</span>
                                <span className="font-semibold text-gray-900">{order.currency} {parseFloat(addon.totalAmount).toFixed(2)}</span>
                            </div>
                        ))
                    }
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900 text-lg">
                    <span>Total Paid</span>
                    <span>{order.currency} {order.totalAmount.toFixed(2)}</span>
                </div>
            </div>

            {/* Gratitude Message */}
            <div className="bg-blue-50 rounded-xl p-6 text-center space-y-2">
                <p className="text-blue-700 font-semibold text-lg">
                    We appreciate your purchase!
                </p>
                <p className="text-blue-600 text-sm">
                    Make sure to check your inbox for your tickets. Bring them along to the event, and enjoy the experience!
                </p>
            </div>

        </div>
    );
}
