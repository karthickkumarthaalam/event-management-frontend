import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader, Ticket, User, CreditCard, Sun, Moon } from "lucide-react";
import { fetchPaymentModes, fetchSingleOrder, processPayment } from "@/lib/order";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import { env } from "@/lib/env";

interface Addon {
    id: string;
    name: string;
    quantity: number;
    totalAmount: number;
}

interface Tax {
    name: string;
    totalAmount: number;
}

interface OrderItem {
    ticketId: string;
    name: string;
    quantity: number;
    basePrice: number;
    grandTotal: number;
    taxDetails: Tax[];
    earlyBirdActive: boolean;
}

interface Purchaser {
    name: string;
    email: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
}

interface EventDetails {
    id: string;
    name: string;
    location: string;
    country: string;
    startDate: string;
    endDate: string;
    logo?: string;
    currency?: string;
    currencySymbol?: string;
}

interface Order {
    id: string;
    items: OrderItem[];
    purchaser: Purchaser;
    addonsDetails: Addon[];
    totalAmount: number;
    discountAmount: number;
    totalBase: number;
    totalAddons: number;
    totalTaxes: number;
    currency: string;
    event?: EventDetails; // added
}




export default function CheckoutPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentModes, setPaymentModes] = useState<string[]>([]);
    const [selectedPaymentMode, setSelectedPaymentMode] = useState<string>("");
    const navigate = useNavigate();

    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        if (!isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    useEffect(() => {
        if (paymentModes.length > 0) {
            setSelectedPaymentMode(paymentModes[0]);
        }
    }, [paymentModes]);


    const fetchOrder = async () => {
        try {
            const data = await fetchSingleOrder(orderId as string, true);
            // Transform backend order into frontend structure

            if (data.paymentStatus === "paid") {
                navigate(`/checkout/success?orderId=${orderId}`, { replace: true });
                return;
            }

            const groupedItems = Object.values<OrderItem>(
                data.Items.reduce((acc: any, item: any) => {
                    if (!acc[item.ticketRefId]) {
                        acc[item.ticketRefId] = {
                            ticketRefId: item.ticketRefId,
                            ticketId: item.ticketId,
                            name: item.ticketClass,
                            quantity: 0,
                            grandTotal: 0,
                            basePrice: parseFloat(item.price),
                            taxDetails: [] as { name: string; totalAmount: number; }[],
                            earlyBirdActive: false
                        };
                    }

                    acc[item.ticketRefId].quantity += item.quantity;

                    acc[item.ticketRefId].grandTotal += parseFloat(item.totalAmount);

                    item.taxes?.forEach((tax: any) => {
                        const existingTax = acc[item.ticketRefId].taxDetails.find(
                            (t: any) => t.name === tax.taxName
                        );
                        if (existingTax) {
                            existingTax.totalAmount += parseFloat(tax.taxAmount);
                        } else {
                            acc[item.ticketRefId].taxDetails.push({
                                name: tax.taxName,
                                totalAmount: parseFloat(tax.taxAmount)
                            });
                        }
                    });

                    return acc;
                }, {})
            );

            const addonsDetails = data.addons?.map((a: any) => ({
                id: a.id,
                name: a.addonName,
                quantity: a.quantity,
                totalAmount: parseFloat(a.totalAmount)
            })) || [];


            const transformedOrder: Order = {
                id: data.id,
                purchaser: data.purchaser,
                items: groupedItems,
                addonsDetails,
                totalAmount: parseFloat(data.totalAmount),
                discountAmount: parseFloat(data.discountedAmount),
                totalBase: groupedItems.reduce(
                    (acc: number, t: any) => acc + t.basePrice * t.quantity,
                    0
                ),
                totalAddons: addonsDetails.reduce(
                    (acc: number, ad: any) => acc + ad.totalAmount,
                    0
                ),
                totalTaxes: groupedItems.reduce(
                    (acc: number, t: any) =>
                        acc + t.taxDetails.reduce((a: number, tx: any) => a + tx.totalAmount, 0),
                    0
                ),
                currency: data.event?.currency_symbol,
                event: data.event
                    ? {
                        id: data.event.id,
                        name: data.event.name,
                        country: data.event.country,
                        location: data.event.location,
                        startDate: data.event.start_date,
                        endDate: data.event.end_date,
                        logo: data.event.logo,
                        currency: data.event.currency,
                        currencySymbol: data.event.currency_symbol,
                    }
                    : undefined,
            };
            setOrder(transformedOrder);
        } catch (err: any) {
            console.error(err);
            navigate(`/error?msg=${encodeURIComponent("Order Not Found")}`, { replace: true });
        }
    };

    const fetchPaymentModesLocal = async () => {
        const country = order?.event?.country || 'switzerland';
        try {
            const data = await fetchPaymentModes(country);
            setPaymentModes(data.paymentModes);
        } catch (error: any) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [navigate, orderId]);

    useEffect(() => {
        if (order) fetchPaymentModesLocal();
    }, [order]);

    const stripePromise = loadStripe(env.stripePublishableKey);


    const handleCheckout = async () => {
        if (!order) return;
        setIsProcessing(true);

        try {
            const country = order.event?.country || 'switzerland';

            // Call backend to create Stripe session
            const data = await processPayment(order.id, country, selectedPaymentMode);

            const stripe = await stripePromise;
            if (stripe && data.sessionId) {
                await stripe.redirectToCheckout({ sessionId: data.sessionId });
            } else {
                throw new Error('Failed to create Stripe session');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to initiate payment');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!order) return <Loader className="animate-spin w-10 h-10 mx-auto mt-20" />;

    const { items: cartDetails, purchaser, addonsDetails, totalAmount, discountAmount, totalBase, totalAddons, totalTaxes, currency } = order;

    return (
        <div className="max-w-6xl mx-auto space-y-6 py-10 px-4">
            {/* Header */}
            <div className="flex jsutify-center md:justify-between items-center">
                <div className="text-center md:text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-200 mb-2">
                        Review Your Order
                    </h2>
                    <p className="text-gray-600 dark:text-gray-200 text-sm">
                        Please review your tickets and details before proceeding to payment
                    </p>
                </div>
                <button
                    onClick={toggleDarkMode}
                    className="px-4 py-2 hidden  bg-blue-500 dark:bg-gray-700 text-white dark:text-gray-200 rounded-lg"
                >
                    {isDarkMode ? <Sun /> : <Moon />}
                </button>
            </div>

            {order.event && (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-900 p-4 md:p-6 flex items-center gap-4">
                    {order.event.logo && (
                        <img src={`${env.baseApi}${order.event.logo}`} alt={order.event.name} className="w-16 h-16 object-cover rounded-lg" />
                    )}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">{order.event.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300">{order.event.location}</p>
                        <p className="text-gray-500 dark:text-gray-300 text-sm">
                            {new Date(order.event.startDate).toLocaleDateString("en-GB")} - {new Date(order.event.endDate).toLocaleDateString("en-GB")}
                        </p>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tickets Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Ticket className="w-5 h-5" />
                                Tickets Summary
                            </h3>
                        </div>

                        {/* Tickets List */}
                        <div className="divide-y divide-gray-100 dark:divide-gray-900">
                            {cartDetails.map((ticket, index) => (
                                <div key={ticket.ticketId} className="p-4 md:p-6">
                                    {/* Desktop View */}
                                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-4 flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 dark:bg-gray-300 rounded-lg flex items-center justify-center">
                                                <span className="text-blue-600 dark:text-gray-800 font-semibold">{index + 1}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-gray-200 block">{ticket.name}</span>
                                                {ticket.earlyBirdActive && (
                                                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Early Bird</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-span-3 text-center text-gray-700 dark:text-gray-300">{ticket.quantity}</div>
                                        <div className="col-span-2 text-right text-gray-700 dark:text-gray-300">{currency} {ticket.basePrice.toFixed(2)}</div>
                                        <div className="col-span-3 text-right font-semibold text-gray-900 dark:text-gray-200">{currency} {ticket.grandTotal.toFixed(2)}</div>
                                    </div>

                                    {/* Mobile View */}
                                    <div className="md:hidden space-y-3">
                                        <div className="flex justify-between items-start">
                                            <span className="font-medium text-gray-900 dark:text-gray-200 block">{ticket.name}</span>
                                            <span className="font-semibold text-gray-900 dark:text-gray-200">{currency} {ticket.grandTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                            <span>Qty: {ticket.quantity}</span>
                                            <span>Unit: {currency} {ticket.basePrice.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Taxes */}
                                    {ticket.taxDetails.length > 0 && (
                                        <div className="mt-3 pl-2 border-l-2 border-blue-200 dark:text-gray-600">
                                            {ticket.taxDetails.map((tax, idx) => (
                                                <div key={idx} className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-1">
                                                    <span>• {tax.name}</span>
                                                    <span>{currency} {tax.totalAmount.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </div>
                            ))}

                            {addonsDetails.length > 0 && (
                                <div className="px-4 py-2 md:px-6 md:py-4">
                                    {addonsDetails.map((addon: Addon) => (
                                        <div key={addon.id}>
                                            <div className="hidden md:grid grid-cols-12 gap-4 items-center text-sm">
                                                <div className="col-span-4 text-left"> {addon.name}</div>
                                                <div className="col-span-3 text-center text-gray-700 dark:text-gray-300">{addon.quantity}</div>
                                                <div className="col-span-2 text-right text-gray-700 dark:text-gray-300">{currency} {(addon.totalAmount / addon.quantity).toFixed(2)}</div>
                                                <div className="col-span-3 text-right font-semibold text-gray-900 dark:text-gray-200">{currency} {addon.totalAmount.toFixed(2)}</div>
                                            </div>
                                            <div className="md:hidden space-y-2">
                                                <div className="flex justify-between items-start text-sm">
                                                    <span className="font-medium text-gray-900 dark:text-gray-200 block">{addon.name}</span>
                                                    <span className="font-semibold text-gray-900 dark:text-gray-200">{currency} {(addon.quantity * addon.totalAmount).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                                    <span>Qty: {addon.quantity}</span>
                                                    <span>Unit: {currency} {addon.totalAmount.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            )}
                        </div>

                        {/* Grand Total */}
                        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
                            {
                                discountAmount > 0 && (
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-base font-semibold text-green-500">Discount Amount</span>
                                        <span className="text-base font-semibold text-green-500"> - {currency} {discountAmount.toFixed(2)}</span>
                                    </div>
                                )
                            }
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-gray-900 dark:text-gray-200">Total Amount</span>
                                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{currency} {totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Purchaser Details */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 flex items-center gap-2">
                                <User className="w-5 h-5" /> Purchaser Information
                            </h3>
                        </div>
                        <div className="p-4 md:p-6 grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm text-gray-500 dark:text-gray-300">Full Name</label>
                                <p className="font-medium text-gray-900 dark:text-gray-200">{purchaser.name}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-gray-500 dark:text-gray-300">Email Address</label>
                                <p className="font-medium text-gray-900 dark:text-gray-200">{purchaser.email}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-gray-500 dark:text-gray-300">Mobile Number</label>
                                <p className="font-medium text-gray-900 dark:text-gray-200">{purchaser.phone}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-gray-500 dark:text-gray-300">Address line 1</label>
                                <p className="font-medium text-gray-900 dark:text-gray-200">{purchaser.line1}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-gray-500 dark:text-gray-300">Address line 2</label>
                                <p className="font-medium text-gray-900 dark:text-gray-200">{purchaser.line2}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-gray-500 dark:text-gray-300">City</label>
                                <p className="font-medium text-gray-900 dark:text-gray-200">{purchaser.city}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-gray-500 dark:text-gray-300">State</label>
                                <p className="font-medium text-gray-900 dark:text-gray-200">{purchaser.state}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-gray-500 dark:text-gray-300">Country</label>
                                <p className="font-medium text-gray-900 dark:text-gray-200">{purchaser.country}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-gray-500 dark:text-gray-300">Postal Code</label>
                                <p className="font-medium text-gray-900 dark:text-gray-200">{purchaser.postal_code}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Order Summary & Checkout */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-12 p-4 md:p-6 space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Order Summary</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm dark:text-gray-200">
                                <span>Tickets ({cartDetails.reduce((acc, t) => acc + t.quantity, 0)})</span>
                                <span>{currency} {totalBase.toFixed(2)}</span>
                            </div>
                            {totalAddons > 0 && (
                                <div className="flex justify-between text-sm dark:text-gray-200">
                                    <span>Add-ons</span>
                                    <span>{currency} {totalAddons.toFixed(2)}</span>
                                </div>
                            )}
                            {totalTaxes > 0 && (
                                <div className="flex justify-between text-sm dark:text-gray-200">
                                    <span>Taxes</span>
                                    <span>{currency} {totalTaxes.toFixed(2)}</span>
                                </div>
                            )}
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-green-600 dark:text-green-200">
                                    <span>Discount</span>
                                    <span>- {currency} {discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t border-gray-200 dark:border-gray-800 pt-2 flex justify-between font-semibold text-gray-900 dark:text-gray-200">
                                <span>Total</span>
                                <span className="text-lg">{currency} {totalAmount.toFixed(2)}</span>
                            </div>
                        </div>


                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Select Payment Mode</label>
                            <select
                                value={selectedPaymentMode}
                                onChange={(e) => setSelectedPaymentMode(e.target.value)}
                                className="w-full border border-gray-300 dark:bg-gray-800 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {paymentModes.map((mode, index) => (
                                    <option key={index} value={mode}>
                                        {mode}
                                    </option>
                                ))}
                            </select>
                        </div>



                        <button
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? <Loader className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                            {isProcessing ? "Processing Payment..." : "Proceed to Payment"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
