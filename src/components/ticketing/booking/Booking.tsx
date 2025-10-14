"use client";
import { useTicketing } from "@/contexts/TicketingContextT";
import React, { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { fetchAddons, fetchTicketsByEvent } from "@/lib/ticketing";
import { validatePromoCode, createOrder } from "@/lib/order";
import { toast } from "react-toastify";
import { EventBanner } from "../EventBanner";
import { Search, Users, ShoppingCart, Loader, Minus, Plus, Tag, Ticket, User, CreditCard } from "lucide-react";

// Types
type OrderAddonDto = {
    addonRefId: string;
    addonName: string;
    price: number;
    quantity: number;
    totalAmount?: number;
};

type CreateOrderItemTaxDto = {
    taxRefId: string;
    taxName: string;
    taxRate: number;
    taxAmount: number;
};

type CreateOrderItemDto = {
    ticketRefId: string;
    ticketClass: string;
    quantity: number;
    price: number;
    taxes?: CreateOrderItemTaxDto[];
};

type PurchaserDto = {
    name: string;
    email: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
};

type CreateOrderDto = {
    eventId: string;
    promoCode?: string;
    affiliateCode?: string;
    purchaser: PurchaserDto;
    addons: OrderAddonDto[];
    items: CreateOrderItemDto[];
};

type Ticket = {
    id: string;
    ticket_name: string;
    price: string;
    early_bird_enabled: boolean;
    early_bird_discount_value?: string;
    early_bird_start?: string;
    early_bird_end?: string;
    taxes: {
        id: string;
        name: string;
        mode: "exclusive" | "inclusive";
        type: "percentage" | "fixed";
        value: string;
        status: boolean;
        applicable_on: "ticket" | "addon";
    }[];
    event: {
        currency_symbol: string;
        name: string;
        venue: string;
        date: string;
    };
};

type Purchaser = {
    purchaserName: string;
    purchaseEmail: string;
    purchaseMobile: string;
    purchaseBillingAddress: string;
};

type Addon = {
    id: string;
    addon_name: string;
    addon_type: string;
    addon_value: string;
};

type CartItem = {
    ticketId: string;
    quantity: number;
};

type Step = "cart" | "purchaser" | "review";

export default function Booking() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [allTickets, setAllTickets] = useState<Ticket[]>([]);
    const [addons, setAddons] = useState<Addon[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [promoCode, setPromoCode] = useState<string>("");
    const [discountAmount, setDiscountAmount] = useState(0);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderAddons, setOrderAddons] = useState<OrderAddonDto[]>([]);

    const [step, setStep] = useState<Step>("cart");
    const { selectedEvent } = useTicketing();

    const initiatePurchaser = {
        name: "",
        email: "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        country: "",
        postal_code: ""
    };

    const [purchaser, setPurchaser] = useState<PurchaserDto>(initiatePurchaser);

    const fetchAddonsForBooking = async () => {
        try {
            const data = await fetchAddons(selectedEvent.id);
            setAddons(data);
        } catch (error) {
            toast.error("Failed to fetch Addons");
        }
    };

    useEffect(() => {
        if (!selectedEvent) return;
        setLoading(true);
        fetchAddonsForBooking();
        fetchTicketsByEvent(selectedEvent.id)
            .then((res) => {
                setAllTickets(res);
                setTickets(res);
            })
            .finally(() => setLoading(false));
    }, [selectedEvent]);

    const debouncedSearch = useMemo(
        () =>
            debounce((query: string) => {
                if (!query) return setTickets(allTickets);
                setTickets(
                    allTickets.filter((t) =>
                        t.ticket_name.toLowerCase().includes(query.toLowerCase())
                    )
                );
            }, 300),
        [allTickets]
    );

    useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        debouncedSearch(e.target.value);
    };

    const applyPromoCode = async () => {
        if (!promoCode.trim()) return;

        try {
            const res = await validatePromoCode(promoCode.trim());

            if (!res.valid) {
                setPromoError(res.reason || "Invalid promo code");
                setDiscountAmount(0);
                return;
            }

            setPromoError(null);
            let discount = 0;
            if (res.discountType === "percentage") {
                discount = (totalAmount * res.discountValue) / 100;
            } else {
                discount = res.discountValue;
            }
            setDiscountAmount(discount);
        } catch (error: any) {
            setPromoError("Failed to validate promo code. Please try again.");
            setDiscountAmount(0);
        }
    };

    const updateCart = (ticketId: string, change: number) => {
        setCart((prev) => {
            const existing = prev.find((c) => c.ticketId === ticketId);
            if (existing) {
                const newQty = existing.quantity + change;
                if (newQty <= 0) return prev.filter((c) => c.ticketId !== ticketId);
                return prev.map((c) =>
                    c.ticketId === ticketId ? { ...c, quantity: newQty } : c
                );
            } else if (change > 0) {
                return [...prev, { ticketId, quantity: change }];
            }
            return prev;
        });
    };

    // 🔹 Order-level Addon updater
    const updateAddonQuantity = (
        addonId: string,
        addonName: string,
        price: number,
        change: number
    ) => {
        setOrderAddons((prev) => {
            const existing = prev.find((a) => a.addonRefId === addonId);

            if (existing) {
                const newQty = existing.quantity + change;
                if (newQty <= 0) {
                    return prev.filter((a) => a.addonRefId !== addonId);
                }
                return prev.map((a) =>
                    a.addonRefId === addonId
                        ? { ...a, quantity: newQty, totalAmount: price * newQty }
                        : a
                );
            } else if (change > 0) {
                return [
                    ...prev,
                    {
                        addonRefId: addonId,
                        addonName,
                        price,
                        quantity: change,
                        totalAmount: price * change,
                    },
                ];
            }

            return prev;
        });
    };

    // Cart calculations
    const cartDetails = useMemo(() => {
        return cart
            .map((item) => {
                const ticket = allTickets.find((t) => t.id === item.ticketId);
                if (!ticket) return null;

                const now = new Date();
                let earlyBirdActive = false;

                if (ticket.early_bird_enabled && ticket.early_bird_start && ticket.early_bird_end) {
                    const earlyBirdStart = new Date(ticket.early_bird_start);
                    earlyBirdStart.setHours(0, 0, 0, 0);

                    const earlyBirdEnd = new Date(ticket.early_bird_end);
                    earlyBirdEnd.setHours(23, 59, 59, 999);

                    earlyBirdActive = earlyBirdStart <= now && now <= earlyBirdEnd;
                }

                const basePrice =
                    earlyBirdActive && ticket.early_bird_discount_value
                        ? parseFloat(ticket.early_bird_discount_value)
                        : parseFloat(ticket.price);
                const basePriceTotal = basePrice * item.quantity;
                const taxes = ticket.taxes.filter(t => t.status === true);
                const applicableTaxes = taxes.filter((t) => t.mode === "exclusive");
                const taxDetails = applicableTaxes.map((tax) => {
                    const taxable = basePrice * item.quantity;
                    const amount =
                        tax.type === "percentage"
                            ? (taxable * parseFloat(tax.value)) / 100
                            : parseFloat(tax.value) * item.quantity;
                    return {
                        id: tax.id,
                        name: tax.name,
                        rate: parseFloat(tax.value),
                        totalAmount: amount,
                    };
                });

                const taxTotal = taxDetails.reduce((sum, t) => sum + t.totalAmount, 0);
                const grandTotal = basePriceTotal + taxTotal;

                return {
                    ticketId: item.ticketId,
                    name: ticket.ticket_name,
                    currency: ticket.event.currency_symbol,
                    quantity: item.quantity,
                    earlyBirdActive,
                    basePrice,
                    basePriceTotal,
                    taxDetails,
                    taxTotal,
                    grandTotal,
                };
            })
            .filter(Boolean) as any[];
    }, [cart, allTickets]);

    const totalBase = cartDetails.reduce((sum, i) => sum + i.basePriceTotal, 0);
    const totalTaxes = cartDetails.reduce((sum, i) => sum + i.taxTotal, 0);
    const totalAddons = orderAddons.reduce((sum, a) => sum + (a.totalAmount || 0), 0);
    const totalAmount = totalBase + totalTaxes + totalAddons;

    const buildOrderDto = (): CreateOrderDto => {
        return {
            eventId: selectedEvent.id,
            purchaser: purchaser,
            promoCode: promoCode || undefined,
            items: cartDetails.map((item) => ({
                ticketRefId: item.ticketId,
                ticketClass: item.name,
                quantity: item.quantity,
                price: item.basePrice,
                taxes: item.taxDetails.map((tax: any) => ({
                    taxRefId: tax.id,
                    taxName: tax.name,
                    taxRate: tax.rate,
                    taxAmount: tax.totalAmount,
                })),
            })),
            addons: orderAddons,
        };
    };

    const handleCheckout = async () => {
        setIsProcessing(true);
        try {
            const orderDto = buildOrderDto();
            await createOrder(orderDto);

            setCart([]);
            setOrderAddons([]);
            setPromoCode("");
            setPromoError("");
            setDiscountAmount(0);
            setPurchaser(initiatePurchaser);
            setStep("cart");
            toast.success("Payment link sent successfully to purchaser’s email!");
        } catch (error: any) {
            console.error("Checkout failed:", error);
            toast.error("Failed to create order. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };


    const ProgressIndicator = () => {
        const steps: Step[] = ["cart", "purchaser", "review"];
        const stepIndex = steps.indexOf(step);

        return (
            <div className="mb-10">
                {/* Event Header */}

                {/* Progress Indicator - Mobile */}
                <div className=" flex items-center justify-center mt-6 gap-3">
                    {steps.map((_, idx) => {
                        const isActive = stepIndex === idx;
                        const isCompleted = stepIndex > idx;

                        return (
                            <div
                                key={idx}
                                className={`w-3 h-3 rounded-full transition-all
                                ${isCompleted
                                        ? "bg-green-500"
                                        : isActive
                                            ? "bg-gray-800 scale-125"
                                            : "bg-gray-400"
                                    }`}
                            />
                        );
                    })}
                </div>
            </div >
        );
    };


    const renderStep = () => {
        switch (step) {
            case "cart":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Tickets Section */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={handleSearchChange}
                                    placeholder="Search tickets..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-300 shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 transition"
                                />
                            </div>

                            {/* Ticket List */}
                            <div className="space-y-5">
                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader className="w-8 h-8 animate-spin text-gray-600" />
                                    </div>
                                ) : tickets.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p className="text-base">No tickets available</p>
                                    </div>
                                ) : (
                                    tickets.map((ticket) => {
                                        const cartItem = cart.find((c) => c.ticketId === ticket.id);
                                        const qty = cartItem?.quantity || 0;
                                        const now = new Date();

                                        let earlyBirdActive = false;

                                        if (ticket.early_bird_enabled && ticket.early_bird_start && ticket.early_bird_end) {
                                            const earlyBirdStart = new Date(ticket.early_bird_start);
                                            earlyBirdStart.setHours(0, 0, 0, 0);

                                            const earlyBirdEnd = new Date(ticket.early_bird_end);
                                            earlyBirdEnd.setHours(23, 59, 59, 999);

                                            earlyBirdActive = earlyBirdStart <= now && now <= earlyBirdEnd;
                                        }

                                        const displayPrice = earlyBirdActive && ticket.early_bird_discount_value
                                            ? parseFloat(ticket.early_bird_discount_value)
                                            : parseFloat(ticket.price);

                                        return (
                                            <div
                                                key={ticket.id}
                                                className="rounded-2xl bg-white border border-gray-300 shadow-md hover:shadow-xl transition p-6"
                                            >
                                                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                                    {/* Ticket Info */}
                                                    <div className="flex-1 space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <h3 className="font-semibold text-base md:text-lg text-indigo-600">
                                                                {ticket.ticket_name}
                                                            </h3>
                                                            {earlyBirdActive && (
                                                                <span className="px-2 md:px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full shadow-sm border border-yellow-200">
                                                                    Early Bird
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="text-lg md:text-2xl font-bold text-gray-900">
                                                            {ticket.event.currency_symbol} {displayPrice.toFixed(2)}
                                                            {earlyBirdActive && (
                                                                <span className="ml-3 text-sm text-red-700 line-through">
                                                                    {ticket.price}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            className="w-6 h-6 md:w-10 md:h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-xl transition border border-gray-300"
                                                            onClick={() => updateCart(ticket.id, -1)}
                                                        >
                                                            <Minus className="w-3 h-3 md:w-5 md:h-5 text-gray-700" />
                                                        </button>
                                                        <span className="text-lg md:text-xl font-semibold w-6 text-center text-gray-900">{qty}</span>
                                                        <button
                                                            className="w-6 h-6 md:w-10 md:h-10 flex items-center justify-center bg-gradient-to-r from-gray-700 to-black text-white rounded-xl hover:from-gray-800 hover:to-gray-900 transition shadow-lg"
                                                            onClick={() => updateCart(ticket.id, 1)}
                                                        >
                                                            <Plus className="w-3 h-3 md:w-5 md:h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                {addons.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-base font-semibold text-gray-800">Add-ons:</h4>
                                        {addons.map((addon) => {
                                            const existingAddon = orderAddons.find(
                                                (oa) => oa.addonRefId === addon.id
                                            );
                                            const addonQty = existingAddon?.quantity || 0;
                                            return (
                                                <div
                                                    key={addon.id}
                                                    className="flex items-center justify-between max-w-md bg-gray-50 border border-gray-300 rounded-lg px-4 py-2"
                                                >
                                                    <div>
                                                        <span className="text-xs md:text-sm text-gray-700 font-semibold">
                                                            <span className="text-sm md:text-base text-indigo-600">{addon.addon_name}</span> - {addon.addon_type === "fixed" ? selectedEvent.currency_symbol : "%"} {addon.addon_value}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded transition border border-gray-300"
                                                            onClick={() => updateAddonQuantity(addon.id, addon.addon_name, parseFloat(addon.addon_value), -1)}
                                                        >
                                                            <Minus className="w-3 h-3 text-gray-700" />
                                                        </button>
                                                        <span className="w-6 text-center text-sm font-medium text-gray-900">
                                                            {addonQty}
                                                        </span>
                                                        <button
                                                            className="w-6 h-6 flex items-center justify-center bg-gradient-to-r from-gray-700 to-black hover:from-gray-800 hover:to-gray-900 text-white rounded transition"
                                                            onClick={() => updateAddonQuantity(addon.id, addon.addon_name, parseFloat(addon.addon_value), +1)}
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cart Section */}
                        <div className="bg-white border border-gray-300 rounded-2xl p-6 h-fit sticky top-20 shadow-lg">
                            <div className="flex items-center gap-2 mb-6">
                                <ShoppingCart className="w-6 h-6 text-indigo-600" />
                                <h2 className="text-lg md:text-xl font-semibold text-indigo-600">Your Cart</h2>
                            </div>

                            {cartDetails.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                    <p>No tickets added yet</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {cartDetails.map(item => (
                                        <div key={item.ticketId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{item.name} x {item.quantity}</h4>
                                                </div>
                                                <span className="font-semibold text-gray-900">
                                                    {item.currency} {item.basePrice.toFixed(2)}
                                                </span>
                                            </div>
                                            {
                                                item.taxDetails.length > 0 && (
                                                    item.taxDetails.map((tax: any) => (
                                                        <div className="flex justify-between mb-2" key={tax.id}>
                                                            <p className="font-medium text-sm text-gray-700">{tax.name}</p>
                                                            <p className="font-medium text-sm text-gray-900">{item.currency} {tax.totalAmount.toFixed(2)}</p>
                                                        </div>
                                                    ))
                                                )
                                            }
                                        </div>
                                    ))}

                                    <div className="space-y-2">
                                        {orderAddons.length > 0 && (
                                            orderAddons.map((addon) => (
                                                <div key={addon.addonRefId} className="flex justify-between items-start mb-2 bg-gray-50 rounded-lg p-4 border-gray-200 border">
                                                    <p className="font-medium text-sm text-gray-700">{addon.addonName} x {addon.quantity}</p>
                                                    <span className="font-semibold text-gray-900 text-sm">
                                                        {cartDetails[0]?.currency} {(addon.price * addon.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter promo code"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value)}
                                            />
                                            <button
                                                className="bg-gradient-to-r from-gray-700 to-black text-white px-4 py-2 rounded-lg hover:from-gray-800 hover:to-gray-900 transition shadow"
                                                onClick={applyPromoCode}
                                            >
                                                <Tag className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {promoError && <p className="text-red-600 text-sm">{promoError}</p>}
                                    </div>

                                    <div className="border-t border-gray-300 pt-4 space-y-2">
                                        <div className="flex justify-between text-gray-700">
                                            <span>Subtotal</span>
                                            <span>{cartDetails[0]?.currency} {totalBase.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-700">
                                            <span>Addons</span>
                                            <span>{cartDetails[0]?.currency} {totalAddons.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-700">
                                            <span>Taxes</span>
                                            <span>{cartDetails[0]?.currency} {totalTaxes.toFixed(2)}</span>
                                        </div>
                                        {discountAmount > 0 && (
                                            <div className="flex justify-between text-green-700">
                                                <span>Discount</span>
                                                <span>-{cartDetails[0]?.currency} {Number(discountAmount).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-300">
                                            <span className="text-gray-900">Total</span>
                                            <span className="text-black">
                                                {cartDetails[0]?.currency} {(totalAmount - Number(discountAmount)).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        className="w-full bg-gradient-to-r from-gray-700 to-black hover:from-gray-800 hover:to-gray-900 text-white py-3 rounded-xl font-medium transition shadow-lg"
                                        onClick={() => setStep("purchaser")}
                                        disabled={cartDetails.length === 0}
                                    >
                                        Continue to Details →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case "purchaser":
                return (
                    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-3xl p-4 md:p-10 border border-gray-300">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-10">
                            <Users className="w-6 h-6 text-indigo-600" />
                            <h2 className="text-lg md:text-xl font-bold text-indigo-600">
                                Purchaser Details
                            </h2>
                        </div>

                        {/* Form */}
                        <div className="space-y-6">
                            {[
                                {
                                    label: "Full Name",
                                    value: purchaser.name,
                                    placeholder: "John Doe",
                                    type: "text",
                                    required: true,
                                    key: "name",
                                },
                                {
                                    label: "Email",
                                    value: purchaser.email,
                                    placeholder: "you@example.com",
                                    type: "email",
                                    required: true,
                                    key: "email",
                                },
                                {
                                    label: "Mobile",
                                    value: purchaser.phone,
                                    placeholder: "+91 98765 43210",
                                    type: "tel",
                                    required: true,
                                    key: "phone",
                                },
                            ].map(({ label, value, placeholder, type, required, key }) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-gray-900 mb-1">
                                        {label} {required && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        type={type}
                                        placeholder={placeholder}
                                        value={value}
                                        onChange={(e) =>
                                            setPurchaser({ ...purchaser, [key]: e.target.value })
                                        }
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-600 focus:outline-none transition shadow-sm"
                                    />
                                </div>
                            ))}

                            {/* Billing Address */}
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Billing Address <span className="text-gray-500 text-sm">(optional)</span>
                                </label>
                                <textarea
                                    placeholder="Enter your billing address"
                                    value={purchaser.purchaseBillingAddress}
                                    onChange={(e) =>
                                        setPurchaser({ ...purchaser, purchaseBillingAddress: e.target.value })
                                    }
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-600 focus:outline-none transition shadow-sm"
                                    rows={4}
                                />
                            </div> */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-1">Address Line 1 <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="Enter address line 1"
                                        value={purchaser.line1}
                                        onChange={(e) =>
                                            setPurchaser({ ...purchaser, line1: e.target.value })
                                        }
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-600 focus:outline-none transition shadow-sm"

                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-1">Address Line 2 </label>
                                    <input
                                        type="text"
                                        placeholder="Enter address line 2"
                                        value={purchaser.line2}
                                        onChange={(e) =>
                                            setPurchaser({ ...purchaser, line2: e.target.value })
                                        }
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-600 focus:outline-none transition shadow-sm"

                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-1">City <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="eg: Chennai"
                                        value={purchaser.city}
                                        onChange={(e) =>
                                            setPurchaser({ ...purchaser, city: e.target.value })
                                        }
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-600 focus:outline-none transition shadow-sm"

                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-1">State <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="eg: TamilNadu"
                                        value={purchaser.state}
                                        onChange={(e) =>
                                            setPurchaser({ ...purchaser, state: e.target.value })
                                        }
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-600 focus:outline-none transition shadow-sm"

                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-1">Country <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="eg: India"
                                        value={purchaser.country}
                                        onChange={(e) =>
                                            setPurchaser({ ...purchaser, country: e.target.value })
                                        }
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-600 focus:outline-none transition shadow-sm"

                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-1">Postal Code <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="eg: 600048"
                                        value={purchaser.postal_code}
                                        onChange={(e) =>
                                            setPurchaser({ ...purchaser, postal_code: e.target.value })
                                        }
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-600 focus:outline-none transition shadow-sm"

                                    />
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col md:flex-row gap-4 mt-12">
                            <button
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-xl transition shadow-sm border border-gray-300"
                                onClick={() => setStep("cart")}
                            >
                                Back to Cart
                            </button>
                            <button
                                className="flex-1 bg-gradient-to-r from-gray-700 to-black hover:from-gray-800 hover:to-gray-900 text-white font-medium py-3 rounded-xl transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setStep("review")}
                                disabled={!purchaser.name || !purchaser.email || !purchaser.phone || !purchaser.line1 || !purchaser.city || !purchaser.state || !purchaser.country || !purchaser.postal_code}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                );

            case "review":
                return (
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Header Section */}
                        <div className="text-center md:text-left">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                                Review Your Order
                            </h2>
                            <p className="text-gray-600 text-sm">Please review your tickets and details before proceeding to payment</p>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Order Summary - Left Column */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Tickets Card */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
                                    <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                        <h3 className="text-lg font-semibold text-indigo-600 flex items-center gap-2">
                                            <Ticket className="w-5 h-5" />
                                            Tickets Summary
                                        </h3>
                                    </div>

                                    {/* Desktop Table Header */}
                                    <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700">
                                        <span className="col-span-4">Ticket Type</span>
                                        <span className="col-span-3 text-center">Quantity</span>
                                        <span className="col-span-2 text-right">Price</span>
                                        <span className="col-span-3 text-right">Total</span>
                                    </div>

                                    {/* Tickets List */}
                                    <div className="divide-y divide-gray-200">
                                        {cartDetails.map((ticket, index) => (
                                            <div key={ticket.ticketId} className="p-4 md:p-6">
                                                {/* Desktop View */}
                                                <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                                                    <div className="col-span-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-200 to-indigo-300 rounded-lg flex items-center justify-center">
                                                                <span className="text-indigo-600 font-semibold">{index + 1}</span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-indigo-600 block">{ticket.name}</span>
                                                                {ticket.earlyBirdActive && (
                                                                    <span className="text-xs text-yellow-800 bg-yellow-100 px-2 py-1 rounded-full">
                                                                        Early Bird
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-3 text-center text-gray-700">
                                                        {ticket.quantity}
                                                    </div>
                                                    <div className="col-span-2 text-right text-gray-700">
                                                        {ticket.currency} {ticket.basePrice.toFixed(2)}
                                                    </div>
                                                    <div className="col-span-3 text-right font-semibold text-gray-900">
                                                        {ticket.currency} {ticket.basePriceTotal.toFixed(2)}
                                                    </div>
                                                </div>

                                                {/* Mobile View */}
                                                <div className="md:hidden space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <span className="font-medium text-indigo-600 block">{ticket.name}</span>
                                                            {ticket.earlyBirdActive && (
                                                                <span className="text-xs text-yellow-800 bg-yellow-100 px-2 py-1 rounded-full">
                                                                    Early Bird
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="font-semibold text-gray-900">
                                                            {ticket.currency} {ticket.basePriceTotal.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm text-gray-600">
                                                        <span>Qty: {ticket.quantity}</span>
                                                        <span>Unit: {ticket.currency} {ticket.basePrice.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                {ticket.taxDetails.length > 0 && (
                                                    <div className="mt-3 pl-2 border-l-2 border-gray-300">
                                                        {ticket.taxDetails.map((tax: addon) => (
                                                            <div key={tax.id} className="flex justify-between text-sm text-gray-700 mb-1">
                                                                <span>• {tax.name} </span>
                                                                <span>{ticket.currency} {tax.totalAmount.toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-2 px-4 md:px-6 mb-4">
                                        {orderAddons.length > 0 && (
                                            <>
                                                <h2 className="text-base text-indigo-700">Add-ons :</h2>
                                                {
                                                    orderAddons.map((addon) => (
                                                        <div key={addon.addonRefId} className="flex justify-between items-start mb-2">
                                                            <p className="font-medium text-sm text-gray-700">{addon.addonName} x {addon.quantity}</p>
                                                            <span className="font-semibold text-gray-900 text-sm">
                                                                {cartDetails[0]?.currency} {(addon.price * addon.quantity).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ))
                                                }
                                            </>

                                        )}
                                    </div>

                                    {/* Grand Total */}
                                    <div className="border-t border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 p-4 md:p-6">
                                        {
                                            discountAmount > 0 && (
                                                <>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-base font-semibold text-gray-900">Sub Total</span>
                                                        <span className="text-base font-bold text-black">
                                                            {cartDetails[0]?.currency} {totalAmount.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center ">
                                                        <span className="text-base font-semibold text-green-600">Discounted Amount</span>
                                                        <span className="text-base font-bold text-green-600">
                                                            - {cartDetails[0]?.currency} {Number(discountAmount).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </>
                                            )
                                        }
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-lg font-semibold text-gray-900">TotalAmount</span>
                                            <span className="text-xl font-bold text-black">
                                                {cartDetails[0]?.currency} {(totalAmount - Number(discountAmount)).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Purchaser Details Card */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-300">
                                    <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                        <h3 className="text-lg font-semibold text-indigo-600 flex items-center gap-2">
                                            <User className="w-5 h-5" />
                                            Purchaser Information
                                        </h3>
                                    </div>
                                    <div className="p-4 md:p-6">
                                        <div className="space-y-1  mb-2">
                                            <label className="text-sm text-gray-600">Full Name</label>
                                            <p className="font-medium text-gray-900">{purchaser.name}</p>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-sm text-gray-600">Email Address</label>
                                                <p className="font-medium text-gray-900">{purchaser.email}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm text-gray-600">Mobile Number</label>
                                                <p className="font-medium text-gray-900">{purchaser.phone}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm text-gray-600">Address Line 1 </label>
                                                <p className="font-medium text-gray-900">{purchaser.line1}</p>
                                            </div>
                                            {
                                                purchaser.line2 && (
                                                    <div className="space-y-1">
                                                        <label className="text-sm text-gray-600">Address Line 2</label>
                                                        <p className="font-medium text-gray-900">{purchaser.line2}</p>
                                                    </div>
                                                )
                                            }
                                            <div className="space-y-1">
                                                <label className="text-sm text-gray-600">City</label>
                                                <p className="font-medium text-gray-900">{purchaser.city}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm text-gray-600">State</label>
                                                <p className="font-medium text-gray-900">{purchaser.state}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm text-gray-600">Country</label>
                                                <p className="font-medium text-gray-900">{purchaser.country}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm text-gray-600">Postal Code</label>
                                                <p className="font-medium text-gray-900">{purchaser.postal_code}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary Sidebar - Right Column */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-300 sticky top-12">
                                    <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                        <h3 className="text-lg font-semibold text-indigo-600">Order Summary</h3>
                                    </div>

                                    <div className="p-4 md:p-6 space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Tickets ({cartDetails.reduce((acc, t) => acc + t.quantity, 0)})</span>
                                            <span className="text-gray-900">{cartDetails[0]?.currency} {(totalBase).toFixed(2)}</span>
                                        </div>

                                        {totalAddons > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Add-ons</span>
                                                <span className="text-gray-900">{cartDetails[0]?.currency} {totalAddons.toFixed(2)}</span>
                                            </div>
                                        )}

                                        {totalTaxes > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Taxes</span>
                                                <span className="text-gray-900">{cartDetails[0]?.currency} {totalTaxes.toFixed(2)}</span>
                                            </div>
                                        )}

                                        {discountAmount > 0 && (
                                            <div className="flex justify-between text-green-700">
                                                <span>Discount</span>
                                                <span>- {cartDetails[0]?.currency} {Number(discountAmount).toFixed(2)}</span>
                                            </div>
                                        )}

                                        <div className="border-t border-gray-300 pt-4">
                                            <div className="flex justify-between font-semibold text-gray-900">
                                                <span>Total</span>
                                                <span className="text-lg text-black">{cartDetails[0]?.currency} {(totalAmount - Number(discountAmount)).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="p-4 md:p-6 space-y-3 border-t border-gray-200">
                                        <button
                                            onClick={handleCheckout}
                                            disabled={isProcessing}
                                            className="w-full bg-gradient-to-r from-gray-700 to-black hover:from-gray-800 hover:to-gray-900 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader className="w-5 h-5 animate-spin" />
                                                    Sharing Payment link...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="w-5 h-5" />
                                                    Share Payment Link
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => setStep("purchaser")}
                                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-all"
                                        >
                                            ← Back to Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };
    return (
        <div className="min-h-screen">
            <EventBanner selectedEvent={selectedEvent} />
            <ProgressIndicator />
            {renderStep()}
        </div>
    );
}