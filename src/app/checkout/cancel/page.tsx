import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader, XCircle } from "lucide-react";
import { fetchSingleOrder } from "@/lib/order";
import { env } from "@/lib/env";

interface Order {
    id: string;
    totalAmount: number;
    purchaserName: string;
    purchaseEmail: string;
    items: { name: string; quantity: number; totalAmount: number; }[];
    currency: string;
    event?: {
        name: string;
        logo?: string;
        location?: string;
    };
}

export default function PaymentCancelPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    const orderId = searchParams.get("orderId");

    useEffect(() => {
        if (!orderId) {
            navigate(`/error?msg=${encodeURIComponent("Order ID Not Found")}`, { replace: true });
            return;
        }

        const fetchOrder = async () => {
            try {
                const data = await fetchSingleOrder(orderId, true);
                const transformedOrder: Order = {
                    id: data.id,
                    totalAmount: parseFloat(data.totalAmount),
                    purchaserName: data.purchaserName,
                    purchaseEmail: data.purchaseEmail,
                    items: data.Items.map((item: any) => ({
                        name: item.ticketClass,
                        quantity: item.quantity,
                        totalAmount: parseFloat(item.totalAmount)
                    })),
                    currency: data.event?.currency_symbol,
                    event: data.event ? {
                        name: data.event.name,
                        logo: data.event.logo,
                        location: data.event.location
                    } : undefined
                };

                setOrder(transformedOrder);
            } catch (err) {
                console.error(err);
                navigate(`/error?msg=${encodeURIComponent("Order Not Found")}`, { replace: true });
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [navigate, orderId]);

    if (loading) {
        return <Loader className="animate-spin w-10 h-10 mx-auto mt-20" />;
    }

    if (!order) return null;

    return (
        <div className="max-w-3xl mx-auto py-12 px-4 space-y-8">
            {/* Cancel Header */}
            <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 flex items-center justify-center bg-red-100 rounded-full">
                    <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-red-600">
                    Payment Cancelled
                </h1>
                <p className="text-gray-700 text-lg">
                    Hi <span className="font-semibold">{order.purchaserName}</span>, your payment of <span className="font-semibold">{order.currency} {order.totalAmount.toFixed(2)}</span> was not completed.
                </p>
                <p className="text-gray-500 text-sm">
                    You can try again or contact support if you believe this is a mistake.
                </p>
            </div>

            {/* Event Info */}
            {order.event && (
                <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4 border border-gray-100">
                    {order.event.logo && (
                        <img
                            src={`${env.baseApi}${order.event.logo}`}
                            alt={order.event.name}
                            className="w-20 h-20 object-cover rounded-lg"
                        />
                    )}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{order.event.name}</h2>
                        <p className="text-gray-600">{order.event.location}</p>
                        <p className="text-gray-500 text-sm mt-1">Order ID: <span className="font-mono">{order.id}</span></p>
                    </div>
                </div>
            )}

            {/* Order Details */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                <div className="divide-y divide-gray-200">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-2">
                            <span className="text-gray-700">{item.name} × {item.quantity}</span>
                            <span className="font-semibold text-gray-900">{order.currency} {item.totalAmount.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900 text-lg">
                    <span>Total Attempted</span>
                    <span>{order.currency} {order.totalAmount.toFixed(2)}</span>
                </div>
            </div>

            {/* Guidance Message */}
            <div className="bg-red-50 rounded-xl p-6 text-center space-y-2">
                <p className="text-red-700 font-semibold text-lg">
                    Payment Not Completed
                </p>
                <p className="text-red-600 text-sm">
                    If you wish to complete your purchase, please return to the checkout page and try again. You can also contact support for assistance.
                </p>
            </div>

            {/* Action Buttons */}
            <div className="text-center flex flex-col md:flex-row justify-center gap-4">
                <button
                    onClick={() => navigate(`/checkout/${orderId}`)}
                    className="mt-2 bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition shadow-md"
                >
                    Retry Payment
                </button>
            </div>
        </div>
    );
}
