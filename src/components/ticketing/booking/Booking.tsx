"use client";
import { useTicketing } from "@/contexts/TicketingContextT";
import React, { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { fetchTicketsByEvent } from "@/lib/ticketing";
import { validatePromoCode, createOrder } from "@/lib/order";
import { ShoppingCart, Users, CreditCard, Ticket, User, Plus, Minus, Search, Tag, Loader, Calendar } from "lucide-react";
import { toast } from "react-toastify";


// Types based on your DTO
type CreateOrderItemAddonDto = {
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
    addons?: CreateOrderItemAddonDto[];
    taxes?: CreateOrderItemTaxDto[];
};

type CreateOrderDto = {
    eventId: string;
    purchaserName: string;
    purchaseEmail: string;
    purchaseMobile: string;
    purchaseBillingAddress?: string;
    promoCode?: string;
    affiliateCode?: string;
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
    addons: {
        id: string;
        addon_name: string;
        addon_type: "percentage" | "fixed";
        addon_value: string;
    }[];
    taxes: {
        id: string;
        name: string;
        mode: "exclusive" | "inclusive";
        type: "percentage" | "fixed";
        value: string;
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



type CartItem = {
    ticketId: string;
    quantity: number;
    selectedAddons: { addonId: string; quantity: number; }[];
};

type Step = "cart" | "purchaser" | "review";

export default function Booking() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [allTickets, setAllTickets] = useState<Ticket[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [promoCode, setPromoCode] = useState<string>("");
    const [discountAmount, setDiscountAmount] = useState(0);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [step, setStep] = useState<Step>("cart");
    const { selectedEvent } = useTicketing();

    const [purchaser, setPurchaser] = useState<Purchaser>({
        purchaserName: "",
        purchaseEmail: "",
        purchaseMobile: "",
        purchaseBillingAddress: ""
    });


    useEffect(() => {
        if (!selectedEvent) return;
        setLoading(true);
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
                return [...prev, { ticketId, quantity: change, selectedAddons: [] }];
            }
            return prev;
        });
    };

    const updateAddonQuantity = (ticketId: string, addonId: string, change: number) => {
        setCart((prev) =>
            prev.map((c) => {
                if (c.ticketId !== ticketId) return c;
                const existing = c.selectedAddons.find((a) => a.addonId === addonId);
                if (existing) {
                    const newQty = existing.quantity + change;
                    if (newQty <= 0)
                        return { ...c, selectedAddons: c.selectedAddons.filter(a => a.addonId !== addonId) };
                    return {
                        ...c,
                        selectedAddons: c.selectedAddons.map(a => a.addonId === addonId ? { ...a, quantity: newQty } : a)
                    };
                } else if (change > 0) {
                    return { ...c, selectedAddons: [...c.selectedAddons, { addonId, quantity: change }] };
                }
                return c;
            })
        );
    };

    // Cart calculations
    const cartDetails = useMemo(() => {
        return cart.map((item) => {
            const ticket = allTickets.find((t) => t.id === item.ticketId);
            if (!ticket) return null;

            const now = new Date();
            const earlyBirdActive =
                ticket.early_bird_enabled &&
                ticket.early_bird_start &&
                ticket.early_bird_end &&
                new Date(ticket.early_bird_start) <= now &&
                now <= new Date(ticket.early_bird_end);

            const basePrice = earlyBirdActive && ticket.early_bird_discount_value
                ? parseFloat(ticket.early_bird_discount_value)
                : parseFloat(ticket.price);
            const basePriceTotal = basePrice * item.quantity;

            const addonsDetails = item.selectedAddons.map(a => {
                const addon = ticket.addons.find(ad => ad.id === a.addonId)!;
                const amountPerTicket = addon.addon_type === "percentage"
                    ? (basePrice * parseFloat(addon.addon_value)) / 100
                    : parseFloat(addon.addon_value);
                return {
                    id: addon.id,
                    name: addon.addon_name,
                    quantity: a.quantity,
                    price: amountPerTicket,
                    totalAmount: amountPerTicket * a.quantity
                };
            });
            const addonsTotal = addonsDetails.reduce((sum, a) => sum + a.totalAmount, 0);

            const applicableTaxes = ticket.taxes.filter(t => t.mode === "exclusive");
            const taxDetails = applicableTaxes.map(tax => {
                const taxable = tax.applicable_on === "ticket"
                    ? basePrice * item.quantity
                    : addonsTotal;
                const amount = tax.type === "percentage"
                    ? (taxable * parseFloat(tax.value)) / 100
                    : parseFloat(tax.value) * item.quantity;
                return {
                    id: tax.id,
                    name: tax.name,
                    rate: parseFloat(tax.value),
                    totalAmount: amount
                };
            });
            const taxTotal = taxDetails.reduce((sum, t) => sum + t.totalAmount, 0);
            const grandTotal = basePriceTotal + addonsTotal + taxTotal;

            return {
                ticketId: item.ticketId,
                name: ticket.ticket_name,
                currency: ticket.event.currency_symbol,
                quantity: item.quantity,
                earlyBirdActive,
                basePrice,
                basePriceTotal,
                addonsDetails,
                addonsTotal,
                taxDetails,
                taxTotal,
                grandTotal,
            };
        }).filter(Boolean) as any[];
    }, [cart, allTickets]);

    const totalBase = cartDetails.reduce((sum, i) => sum + i.basePriceTotal, 0);
    const totalAddons = cartDetails.reduce((sum, i) => sum + i.addonsTotal, 0);
    const totalTaxes = cartDetails.reduce((sum, i) => sum + i.taxTotal, 0);
    const totalAmount = cartDetails.reduce((sum, i) => sum + i.grandTotal, 0);

    const buildOrderDto = (): CreateOrderDto => {
        return {
            eventId: selectedEvent.id,
            purchaserName: purchaser.purchaserName,
            purchaseEmail: purchaser.purchaseEmail,
            purchaseMobile: purchaser.purchaseMobile,
            purchaseBillingAddress: purchaser.purchaseBillingAddress || undefined,
            promoCode: promoCode || undefined,
            items: cartDetails.map((item) => ({
                ticketRefId: item.ticketId,
                ticketClass: item.name,
                quantity: item.quantity,
                price: item.basePrice,
                addons: item.addonsDetails.map((addon: any) => ({
                    addonRefId: addon.id,
                    addonName: addon.name,
                    price: addon.price,
                    quantity: addon.quantity,
                    totalAmount: addon.totalAmount,
                })),
                taxes: item.taxDetails.map((tax: any) => ({
                    taxRefId: tax.id,
                    taxName: tax.name,
                    taxRate: tax.rate,
                    taxAmount: tax.totalAmount,
                })),
            })),
        };
    };

    const handleCheckout = async () => {
        if (!isFormValid()) return;

        setIsProcessing(true);
        try {
            const orderDto = buildOrderDto();
            await createOrder(orderDto);

            setCart([]);
            setPurchaser({
                purchaserName: "",
                purchaseEmail: "",
                purchaseMobile: "",
                purchaseBillingAddress: "",
            });
            setStep("cart");
            toast.success("Payment link sent successfully to purchaser’s email!");

        } catch (error: any) {
            console.log(error.message);
            console.error("Checkout failed:", error);
            toast.error("Failed to create order. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const isFormValid = () => {
        if (step === "purchaser") {
            return purchaser.purchaserName && purchaser.purchaseEmail && purchaser.purchaseMobile;
        }
        return cart.length > 0;
    };


    const ProgressIndicator = () => {
        const steps: Step[] = ["cart", "purchaser", "review"];
        const stepIndex = steps.indexOf(step);

        return (
            <div className="mb-10">
                {/* Event Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl p-2 md:p-4 shadow-xl flex gap-4 items-center ">
                    {
                        allTickets[0]?.event?.logo ?
                            (<img src={`${process.env.NEXT_PUBLIC_BASE_API}${allTickets[0]?.event?.logo}`} alt={allTickets[0]?.event?.name} className=" w-12 h-12 md:w-24 md:h-24" />) :
                            (<Calendar size={32} className="text-white mr-4 " />)
                    }
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold mb-3 tracking-tight">
                            {allTickets[0]?.event.name || "Event"}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 text-indigo-100 text-xs md:text-sm">
                            <span className="truncate">{allTickets[0]?.event.location}</span>
                            <span>•</span>
                            <span>
                                {formatDateRange(
                                    allTickets[0]?.event?.start_date,
                                    allTickets[0]?.event?.end_date
                                )}
                            </span>
                        </div>
                    </div>
                </div>

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
                                            ? "bg-indigo-600 scale-125"
                                            : "bg-gray-300"
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
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={handleSearchChange}
                                    placeholder="Search tickets..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                                />
                            </div>

                            {/* Ticket List */}
                            <div className="space-y-5">
                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader className="w-8 h-8 animate-spin text-indigo-500" />
                                    </div>
                                ) : tickets.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p className="text-base">No tickets available</p>
                                    </div>
                                ) : (
                                    tickets.map((ticket) => {
                                        const cartItem = cart.find((c) => c.ticketId === ticket.id);
                                        const qty = cartItem?.quantity || 0;
                                        const now = new Date();
                                        const earlyBirdActive =
                                            ticket.early_bird_enabled &&
                                            ticket.early_bird_start &&
                                            ticket.early_bird_end &&
                                            new Date(ticket.early_bird_start) <= now &&
                                            now <= new Date(ticket.early_bird_end);

                                        const displayPrice =
                                            earlyBirdActive && ticket.early_bird_discount_value
                                                ? parseFloat(ticket.early_bird_discount_value)
                                                : parseFloat(ticket.price);

                                        return (
                                            <div
                                                key={ticket.id}
                                                className="rounded-2xl bg-white border border-gray-200 shadow-md hover:shadow-lg transition p-6"
                                            >
                                                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                                    {/* Ticket Info */}
                                                    <div className="flex-1 space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <h3 className="font-semibold text-base md:text-lg text-gray-800">
                                                                {ticket.ticket_name}
                                                            </h3>
                                                            {earlyBirdActive && (
                                                                <span className="px-2 md:px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full shadow-sm">
                                                                    Early Bird
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="text-lg md:text-2xl font-bold text-indigo-600">
                                                            {ticket.event.currency_symbol} {displayPrice.toFixed(2)}
                                                        </div>

                                                        {ticket.addons.length > 0 && (
                                                            <div className="space-y-2">
                                                                <h4 className=" text-sm font-medium text-gray-700">Add-ons:</h4>
                                                                {ticket.addons.map((addon) => {
                                                                    const addonQty =
                                                                        cartItem?.selectedAddons.find((a) => a.addonId === addon.id)
                                                                            ?.quantity || 0;

                                                                    return (
                                                                        <div
                                                                            key={addon.id}
                                                                            className="flex items-center justify-between max-w-md bg-gray-50 border border-gray-200 rounded-lg px-4 py-2"
                                                                        >
                                                                            <div>
                                                                                <span className="text-xs md:text-sm text-gray-800 font-semibold">{addon.addon_name} - {addon.addon_type === "fixed" ? ticket.event.currency_symbol : "%"} {addon.addon_value}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <button
                                                                                    className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded transition"
                                                                                    onClick={() => updateAddonQuantity(ticket.id, addon.id, -1)}
                                                                                >
                                                                                    <Minus className="w-3 h-3 text-gray-600" />
                                                                                </button>
                                                                                <span className="w-6 text-center text-sm font-medium text-gray-800">
                                                                                    {addonQty}
                                                                                </span>
                                                                                <button
                                                                                    className="w-6 h-6 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
                                                                                    onClick={() => updateAddonQuantity(ticket.id, addon.id, 1)}
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

                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            className=" w-6 h-6 md:w-10 md:h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                                                            onClick={() => updateCart(ticket.id, -1)}
                                                        >
                                                            <Minus className="w-3 h-3 md:w-5 md:h-5 text-gray-600" />
                                                        </button>
                                                        <span className="text-lg md:text-xl font-semibold w-6 text-center text-gray-800">{qty}</span>
                                                        <button
                                                            className="w-6 h-6 md:w-10 md:h-10 flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700  text-white rounded-xl hover:scale-105 transition shadow"
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
                            </div>
                        </div>


                        {/* Cart Section */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 h-fit sticky top-20">
                            <div className="flex items-center gap-2 mb-6">
                                <ShoppingCart className="w-6 h-6 text-blue-600" />
                                <h2 className="text-lg md:text-xl font-semibold">Your Cart</h2>
                            </div>

                            {cartDetails.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                    <p>No tickets added yet</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {cartDetails.map(item => (
                                        <div key={item.ticketId} className="bg-gray-50 rounded-lg p-4">

                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-medium">{item.name} x {item.quantity}</h4>
                                                </div>
                                                <span className="font-semibold text-blue-600">
                                                    {item.currency} {item.basePrice.toFixed(2)}
                                                </span>
                                            </div>
                                            {
                                                item.taxDetails.length > 0 && (
                                                    item.taxDetails.map((tax: any) => (
                                                        <div className="flex justify-between mb-2" key={tax.id}>
                                                            <p className="font-medium text-sm">{tax.name}</p>
                                                            <p className="font-medium text-sm text-blue-600">{item.currency} {tax.totalAmount.toFixed(2)}</p>
                                                        </div>
                                                    ))
                                                )
                                            }
                                            {
                                                item.addonsDetails.length > 0 && (
                                                    item.addonsDetails.map((addon: any) => (
                                                        <div key={addon.id} className="flex justify-between items-start mb-2">
                                                            <p className="font-medium text-sm">{addon.name} x {addon.quantity}</p>
                                                            <span className="font-semibold text-blue-600 text-sm">
                                                                {item.currency} {addon.totalAmount.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ))
                                                )
                                            }
                                        </div>
                                    ))}

                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter promo code"
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg "
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value)}
                                            />
                                            <button
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                                onClick={applyPromoCode}
                                            >
                                                <Tag className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {promoError && <p className="text-red-600 text-sm">{promoError}</p>}
                                    </div>

                                    <div className="border-t pt-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>{cartDetails[0]?.currency} {totalBase.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Addons</span>
                                            <span>{cartDetails[0]?.currency} {totalAddons.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Taxes</span>
                                            <span>{cartDetails[0]?.currency} {totalTaxes.toFixed(2)}</span>
                                        </div>
                                        {discountAmount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount</span>
                                                <span>-{cartDetails[0]?.currency} {Number(discountAmount).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                                            <span>Total</span>
                                            <span className="text-purple-600">
                                                {cartDetails[0]?.currency} {(totalAmount - Number(discountAmount)).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        className="w-full bg-blue-600  hover:bg-blue-700 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition"
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
                    <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-3xl p-4 md:p-10">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-10">
                            <Users size={24} />
                            <h2 className="text-lg md:text-xl font-bold text-gray-800">
                                Purchaser Details
                            </h2>
                        </div>

                        {/* Form */}
                        <div className="space-y-6">
                            {[
                                {
                                    label: "Full Name",
                                    value: purchaser.purchaserName,
                                    placeholder: "John Doe",
                                    type: "text",
                                    required: true,
                                    key: "purchaserName",
                                },
                                {
                                    label: "Email",
                                    value: purchaser.purchaseEmail,
                                    placeholder: "you@example.com",
                                    type: "email",
                                    required: true,
                                    key: "purchaseEmail",
                                },
                                {
                                    label: "Mobile",
                                    value: purchaser.purchaseMobile,
                                    placeholder: "+91 98765 43210",
                                    type: "tel",
                                    required: true,
                                    key: "purchaseMobile",
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
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none transition shadow-sm"
                                    />
                                </div>
                            ))}

                            {/* Billing Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Billing Address <span className="text-gray-400 text-sm">(optional)</span>
                                </label>
                                <textarea
                                    placeholder="Enter your billing address"
                                    value={purchaser.purchaseBillingAddress}
                                    onChange={(e) =>
                                        setPurchaser({ ...purchaser, purchaseBillingAddress: e.target.value })
                                    }
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition shadow-sm"
                                    rows={4}
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col md:flex-row gap-4 mt-12">
                            <button
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition shadow-sm"
                                onClick={() => setStep("cart")}
                            >
                                Back to Cart
                            </button>
                            <button
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setStep("review")}
                                disabled={!purchaser.purchaserName || !purchaser.purchaseEmail || !purchaser.purchaseMobile}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                );


            case "review":
                return (
                    <div className="max-w-6xl mx-auto  space-y-6">
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
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-4 md:p-6 border-b border-gray-100">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <Ticket className="w-5 h-5" />
                                            Tickets Summary
                                        </h3>
                                    </div>

                                    {/* Desktop Table Header */}
                                    <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50 px-6 py-3 text-sm font-medium text-gray-600">
                                        <span className="col-span-4">Ticket Type</span>
                                        <span className="col-span-3 text-center">Quantity</span>
                                        <span className="col-span-2 text-right">Price</span>
                                        <span className="col-span-3 text-right">Total</span>
                                    </div>

                                    {/* Tickets List */}
                                    <div className="divide-y divide-gray-100">
                                        {cartDetails.map((ticket, index) => (
                                            <div key={ticket.ticketId} className="p-4 md:p-6">
                                                {/* Desktop View */}
                                                <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                                                    <div className="col-span-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                <span className="text-blue-600 font-semibold">{index + 1}</span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-900 block">{ticket.name}</span>
                                                                {ticket.earlyBirdActive && (
                                                                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
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
                                                        {ticket.currency} {ticket.grandTotal.toFixed(2)}
                                                    </div>
                                                </div>

                                                {/* Mobile View */}
                                                <div className="md:hidden space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <span className="font-medium text-gray-900 block">{ticket.name}</span>
                                                            {ticket.earlyBirdActive && (
                                                                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                                                    Early Bird
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="font-semibold text-gray-900">
                                                            {ticket.currency} {ticket.grandTotal.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm text-gray-600">
                                                        <span>Qty: {ticket.quantity}</span>
                                                        <span>Unit: {ticket.currency} {ticket.basePrice.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                {ticket.taxDetails.length > 0 && (
                                                    <div className="mt-3 pl-2 border-l-2 border-blue-200">
                                                        {ticket.taxDetails.map((tax: addon) => (
                                                            <div key={tax.id} className="flex justify-between text-sm text-gray-700 mb-1">
                                                                <span>• {tax.name} </span>
                                                                <span>{ticket.currency} {tax.totalAmount.toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Add-ons Section */}
                                                {ticket.addonsDetails.length > 0 && (
                                                    <div className="mt-3 pl-2 border-l-2 border-blue-200">
                                                        {ticket.addonsDetails.map((addon) => (
                                                            <div key={addon.id} className="flex justify-between text-sm text-gray-700 mb-1">
                                                                <span>• {addon.name} × {addon.quantity}</span>
                                                                <span>{ticket.currency} {addon.totalAmount.toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Grand Total */}
                                    <div className="border-t border-gray-100 bg-gray-50 p-4 md:p-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                                            <span className="text-xl font-bold text-blue-600">
                                                {cartDetails[0]?.currency} {cartDetails.reduce((acc, t) => acc + t.grandTotal, 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Purchaser Details Card */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                                    <div className="p-4 md:p-6 border-b border-gray-100">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <User className="w-5 h-5" />
                                            Purchaser Information
                                        </h3>
                                    </div>
                                    <div className="p-4 md:p-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-sm text-gray-500">Full Name</label>
                                                <p className="font-medium text-gray-900">{purchaser.purchaserName}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm text-gray-500">Email Address</label>
                                                <p className="font-medium text-gray-900">{purchaser.purchaseEmail}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm text-gray-500">Mobile Number</label>
                                                <p className="font-medium text-gray-900">{purchaser.purchaseMobile}</p>
                                            </div>
                                            {purchaser.purchaseBillingAddress && (
                                                <div className="md:col-span-2 space-y-1">
                                                    <label className="text-sm text-gray-500">Billing Address</label>
                                                    <p className="font-medium text-gray-900">{purchaser.purchaseBillingAddress}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary Sidebar - Right Column */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-12">
                                    <div className="p-4 md:p-6 border-b border-gray-100">
                                        <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                                    </div>

                                    <div className="p-4 md:p-6 space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Tickets ({cartDetails.reduce((acc, t) => acc + t.quantity, 0)})</span>
                                            <span>{cartDetails[0]?.currency} {(totalBase).toFixed(2)}</span>
                                        </div>

                                        {totalAddons > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Add-ons</span>
                                                <span>{cartDetails[0]?.currency} {totalAddons.toFixed(2)}</span>
                                            </div>
                                        )}

                                        {totalTaxes > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Taxes</span>
                                                <span>{cartDetails[0]?.currency} {totalTaxes.toFixed(2)}</span>
                                            </div>
                                        )}

                                        {discountAmount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount</span>
                                                <span>- {cartDetails[0]?.currency} {Number(discountAmount).toFixed(2)}</span>
                                            </div>
                                        )}

                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex justify-between font-semibold text-gray-900">
                                                <span>Total</span>
                                                <span className="text-lg">{cartDetails[0]?.currency} {(totalAmount - discountAmount).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="p-4 md:p-6 space-y-3">
                                        <button
                                            onClick={handleCheckout}
                                            disabled={isProcessing}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader className="w-5 h-5 animate-spin" />
                                                    Processing Payment...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="w-5 h-5" />
                                                    Proceed to Payment
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
            <ProgressIndicator />
            {renderStep()}
        </div>
    );
}