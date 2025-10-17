"use client";

import React, { useEffect, useState, useMemo } from "react";
import TicketModal from "./TicketModel";
import { fetchTicketsByEvent, deleteTicket, fetchTaxes, deleteTax, fetchAddons, deleteAddon } from "@/lib/ticketing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import debounce from "lodash.debounce";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Calendar,
    Ticket,
    ChevronDown,
    RefreshCw,
    Users,
    ShoppingCart,
    MapPin,
    Star,
    PlusCircle,
    TicketCheckIcon,
    Tags,
    Percent,
    LandmarkIcon,
    DollarSignIcon,
    GitForkIcon
} from "lucide-react";
import { toast } from "react-toastify";
import { useTicketing } from "@/contexts/TicketingContextT";
import ConfirmDialog from "../common/confirmDialog";
import TaxModal from "./TaxModal";
import { EventBanner } from "./EventBanner";
import AddonModal from "./AddonModal";

export default function TicketManagementPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [taxes, setTaxes] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [selectedPortion, setSelectedPortion] = useState<"ticket" | "taxes" | "addons">("ticket");
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteTaxId, setDeleteTaxId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [selectedTax, setSelectedTax] = useState<any | null>(null);
    const [taxModalOpen, setTaxModalOpen] = useState<boolean>(false);
    const [addons, setAddons] = useState<any[]>([]);
    const [selectedAddon, setSelectedAddon] = useState<any | null>(null);
    const [addonModalOpen, setAddonModalOpen] = useState<boolean>(false);
    const [deleteAddonId, setDeleteAddonId] = useState<string | null>(null);

    const { selectedEvent } = useTicketing();

    async function loadTickets() {
        try {
            setLoading(true);
            const data = await fetchTicketsByEvent(selectedEvent.id);
            setTickets(data);
        } catch (error) {
            toast.error("Failed to fetch tickets");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function loadTaxes() {
        try {
            setLoading(true);
            const data = await fetchTaxes(selectedEvent.id);
            setTaxes(data);
        } catch (error) {
            toast.error("Failed to fetch taxes");
        } finally {
            setLoading(false);
        }
    }

    async function loadAddons() {
        try {
            setLoading(true);
            const data = await fetchAddons(selectedEvent.id);
            setAddons(data);
        } catch (error) {
            toast.error("Failed to fetch addons");
        } finally {
            setLoading(false);
        }
    }

    const debouncedSearch = useMemo(
        () =>
            debounce((query: string) => {
                if (!query) {
                    loadTickets();
                    return;
                }

                const filtered = tickets.filter(
                    (ticket) =>
                        ticket.ticket_name.toLowerCase().includes(query.toLowerCase()) ||
                        ticket.price.toString().includes(query) ||
                        ticket.quantity.toString().includes(query)
                );
                setTickets(filtered);
            }, 300),
        [tickets]
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value);
    };

    async function handleDelete(id: string) {
        setDeleteId(id);
    }

    async function handleTaxDelete(id: string) {
        setDeleteTaxId(id);
    }

    async function handlAddonDelete(id: string) {
        setDeleteAddonId(id);
    }

    async function ConfirmTaxDelete() {
        if (!deleteTaxId) return;

        try {
            await deleteTax(deleteTaxId);
            toast.success("Tax deleted successfully");
            loadTaxes();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete Tax");
        } finally {
            setDeleteTaxId(null);
        }
    }

    async function confirmDelete() {
        if (!deleteId) return;

        try {
            await deleteTicket(deleteId);
            toast.success("Ticket deleted successfully");
            loadTickets();
        } catch (error) {
            toast.error("Failed to delete ticket");
            console.error(error);
        } finally {
            setDeleteId(null);
        }
    }

    async function confirmAddonDelete() {
        if (!deleteAddonId) return;

        try {
            await deleteAddon(deleteAddonId);
            toast.success("Addon Deleted successfully");
            loadAddons();
        } catch (error) {
            toast.error("Failed to delete Addon");
            console.error(error);
        } finally {
            setDeleteAddonId(null);
        }
    }

    function openCreateModal() {
        if (selectedPortion === "ticket") {
            setSelectedTicket(null);
            setModalOpen(true);
        } else if (selectedPortion === "taxes") {
            setSelectedTax(null);
            setTaxModalOpen(true);
        } else {
            setSelectedAddon(null);
            setAddonModalOpen(true);
        }
    }

    function openTaxEditModa(tax: any) {
        setSelectedTax(tax);
        setTaxModalOpen(true);
    }

    function openEditModal(ticket: any) {
        setSelectedTicket(ticket);
        setModalOpen(true);
    }

    function openAddonEdit(addon: any) {
        setSelectedAddon(addon);
        setAddonModalOpen(true);
    }

    const formatDateRange = (startDate: string, endDate?: string) => {
        const start = new Date(startDate).toLocaleDateString("en-EN", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

        if (endDate && endDate !== startDate) {
            const end = new Date(endDate).toLocaleDateString("en-EN", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
            return `${start} - ${end}`;
        }
        return start;
    };

    function formatDateTime(dateStr: string, timeStr?: string) {
        if (!dateStr) return "-";

        // Combine date and time
        const dateTime = timeStr ? new Date(`${dateStr}T${timeStr}`) : new Date(dateStr);

        return dateTime.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    }

    useEffect(() => {
        if (selectedEvent?.id) {
            selectedPortion === "ticket" ?
                loadTickets() :
                selectedPortion === "taxes" ?
                    loadTaxes() :
                    loadAddons();
        }
    }, [selectedEvent, selectedPortion]);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, []);

    return (
        <>
            <EventBanner selectedEvent={selectedEvent} />
            <div className="min-h-screen  lg:p-8">
                <div className="space-y-6">

                    {/* Header */}
                    <div className="flex justify-between items-center   gap-3">
                        <div>
                            <h1 className="text-xl md:text-2xl  font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                                {selectedPortion === "ticket" ? "Tickets" : selectedPortion === "taxes" ? "Taxes" : "Addons"}  Management
                            </h1>
                        </div>
                        <Button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                            <Plus size={20} />
                            Create {selectedPortion === "ticket" ? "Tickets" : selectedPortion === "taxes" ? "Taxes" : "Addons"}
                        </Button>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                        <div className="flex flex-row gap-4 items-center justify-between">
                            <div className="flex-1 max-w-md">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <Input
                                        placeholder="Search events by name, location, or status..."
                                        className="pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                        value={search}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>
                            <div className="">
                                <div className="flex items-center space-x-2">
                                    <Button onClick={() => setSelectedPortion("ticket")} className={`${selectedPortion === "ticket" ? "bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white" : "bg-white text-black"} hover:bg-gradient-to-br hover:from-blue-400 hover:to-blue-500 hover:text-white `}>
                                        <TicketCheckIcon size={20} />
                                        <span className="hidden md:block">Tickets</span>
                                    </Button>
                                    <Button onClick={() => setSelectedPortion("taxes")} className={`${selectedPortion === "taxes" ? "bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white" : "bg-white text-black"} hover:bg-gradient-to-br hover:from-blue-400 hover:to-blue-500 hover:text-white `} >
                                        <Tags size={20} />
                                        <span className="hidden md:block">Taxes</span>
                                    </Button>
                                    <Button onClick={() => setSelectedPortion("addons")} className={`${selectedPortion === "addons" ? "bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white" : "bg-white text-black"} hover:bg-gradient-to-br hover:from-blue-400 hover:to-blue-500 hover:text-white `}>
                                        <GitForkIcon />
                                        <span className=" hidden md:block">Addons</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedPortion === "ticket" && (
                        <>
                            {tickets.length === 0 && (
                                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-16">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                                            <Ticket className="h-10 w-10 text-slate-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-slate-800 mb-2">No Tickets found</h3>
                                        <p className="text-slate-500 mb-6">
                                            {search ? "Try adjusting your search terms" : "Get started by creating your first event Ticket"}
                                        </p>
                                        <Button
                                            onClick={openCreateModal}
                                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl"
                                        >
                                            <Plus size={16} className="mr-2" />
                                            Create Your First Event Ticket
                                        </Button>
                                    </div>
                                </div>)}

                            {tickets.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                                    <div className="overflow-x-auto w-full">
                                        <table className="min-w-full">
                                            <thead className="bg-gray-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="pl-6 pr-4 py-4 text-left text-sm font-semibold text-slate-700 uppercase">
                                                        <div className="flex items-center gap-2">
                                                            <span>Ticket Details</span>
                                                            <ChevronDown size={14} className="text-slate-400" />
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 hidden uppercase sm:table-cell">
                                                        Price
                                                    </th>
                                                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 hidden uppercase lg:table-cell">
                                                        Quantity
                                                    </th>
                                                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 hidden  uppercase xl:table-cell">
                                                        Sales Period
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase text-slate-700">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-slate-100">
                                                {tickets.map((ticket) => {
                                                    const expanded = expandedId === ticket.id;
                                                    const hasDiscount = ticket.discount_type && ticket.discount_value > 0;
                                                    const hasEarlyBird = ticket.early_bird_enabled;
                                                    const hasAddons = ticket.addons?.length > 0;
                                                    const hasTaxes = ticket.taxes.length > 0;
                                                    return (
                                                        <React.Fragment key={ticket.id}>
                                                            {/* Main Row */}
                                                            <tr
                                                                className={`hover:bg-gray-50 cursor-pointer transition-all duration-200 group ${expanded ? 'bg-gray-50' : 'bg-white'}`}
                                                                onClick={() => setExpandedId(expanded ? null : ticket.id)}
                                                            >
                                                                <td className="pl-6 pr-4 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`transition-transform duration-300 ${expanded ? 'rotate-180' : 'rotate-0'}`}>
                                                                            <ChevronDown size={16} className="text-slate-400 group-hover:text-blue-600" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-2">
                                                                                <h4 className="font-semibold text-blue-800 text-sm md:text-lg truncate">
                                                                                    {ticket.ticket_name}
                                                                                </h4>

                                                                                {hasEarlyBird && (
                                                                                    <span className=" hidden md:flex px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full whitespace-nowrap">
                                                                                        Early Bird
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {ticket.description && (
                                                                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                                                                    {ticket.description}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="px-4 py-4 hidden sm:table-cell">
                                                                    {(() => {
                                                                        const originalPrice = parseFloat(ticket.price);
                                                                        const earlyBirdPrice = ticket.early_bird_discount_value
                                                                            ? parseFloat(ticket.early_bird_discount_value)
                                                                            : null;

                                                                        const now = new Date();

                                                                        // Check if early bird is active
                                                                        let earlyBirdActive = false;

                                                                        if (ticket.early_bird_enabled && ticket.early_bird_start && ticket.early_bird_end) {
                                                                            const earlyBirdStart = new Date(ticket.early_bird_start);
                                                                            earlyBirdStart.setHours(0, 0, 0, 0);

                                                                            const earlyBirdEnd = new Date(ticket.early_bird_end);
                                                                            earlyBirdEnd.setHours(23, 59, 59, 999);

                                                                            earlyBirdActive = earlyBirdStart <= now && now <= earlyBirdEnd;
                                                                        }


                                                                        let displayPrice = originalPrice;
                                                                        let strikePrice: number | null = null;

                                                                        if (earlyBirdActive) {
                                                                            displayPrice = earlyBirdPrice!;
                                                                            strikePrice = originalPrice;
                                                                        }
                                                                        return (
                                                                            <div className="flex items-center gap-2 whitespace-nowrap">
                                                                                {/* Main Price */}
                                                                                <span className="text-lg font-bold text-slate-800">
                                                                                    {ticket.event.currency_symbol} {displayPrice.toFixed(2)}
                                                                                </span>

                                                                                {/* Show strike only if early bird is active */}
                                                                                {earlyBirdActive && strikePrice !== null && (
                                                                                    <span className="text-xs text-red-500 line-through">
                                                                                        {ticket.event.currency_symbol}{strikePrice.toFixed(2)}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </td>



                                                                <td className="px-4 py-4 hidden lg:table-cell">
                                                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                                                        <div className="w-16 bg-slate-200 rounded-full h-2 whitespace-nowrap">
                                                                            <div
                                                                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                                                                style={{
                                                                                    width: `${Math.min((ticket.sold_count / ticket.quantity) * 100, 100)}%`
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-sm font-medium text-slate-700">
                                                                            {ticket.quantity - ticket.sold_count} / {ticket.quantity}
                                                                        </span>
                                                                    </div>
                                                                </td>

                                                                <td className="px-4 py-4 hidden xl:table-cell">
                                                                    <div className="flex items-center gap-2 text-sm text-slate-600 whitespace-nowrap">
                                                                        <Calendar size={14} className="text-slate-400" />
                                                                        <span>{formatDateRange(ticket.sales_start_date, ticket.sales_end_date)}</span>
                                                                    </div>
                                                                </td>

                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                openEditModal(ticket);
                                                                            }}
                                                                            className="w-7 h-7 p-0 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all duration-200 hover:scale-105"
                                                                        >
                                                                            <Edit size={14} />
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDelete(ticket.id);
                                                                            }}
                                                                            className="w-7 h-7 p-0 rounded-md bg-red-100 hover:bg-red-200 hover:text-red-700 text-red-600 transition-all duration-200 hover:scale-105"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>

                                                            {/* Expanded Details */}
                                                            {expanded && (
                                                                <tr className="bg-gradient-to-r from-blue-50/50 to-pink-100 border-y border-dashed border-black">
                                                                    <td colSpan={5} className="px-6 py-6 border-t border-dashed border-gray-500">
                                                                        <div className="space-y-6 animate-in fade-in-50 duration-300">
                                                                            {/* Header Section */}
                                                                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                                                                <div className="flex items-start gap-4">
                                                                                    <div className="p-3 rounded-xl bg-blue-100 shadow-inner">
                                                                                        <Ticket className="h-6 w-6 text-blue-600" />
                                                                                    </div>
                                                                                    <div className="flex-1">
                                                                                        <h3 className="text-xl font-bold text-slate-800 mb-2">{ticket.ticket_name}</h3>
                                                                                        {ticket.description && (
                                                                                            <p className="text-sm text-slate-600 mb-3">{ticket.description}</p>
                                                                                        )}
                                                                                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                                                                            <span className="flex items-center gap-1">
                                                                                                <Calendar size={12} />
                                                                                                Created: {new Date(ticket.createdAt).toLocaleDateString()}
                                                                                            </span>
                                                                                            <span className="flex items-center gap-1">
                                                                                                <RefreshCw size={12} />
                                                                                                Updated: {new Date(ticket.updatedAt).toLocaleDateString()}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                                                                                    <div className="text-center p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                                                                        <div className="text-2xl font-bold text-blue-600">
                                                                                            {ticket.event.currency_symbol} {ticket.price}
                                                                                        </div>
                                                                                        <div className="text-xs text-slate-500">Current Price</div>
                                                                                    </div>
                                                                                    {hasDiscount && (
                                                                                        <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200 shadow-sm">
                                                                                            <div className="text-lg font-bold text-green-700">
                                                                                                {ticket.discount_type === 'percentage'
                                                                                                    ? `${ticket.discount_value}% OFF`
                                                                                                    : `${ticket.event.currency_symbol} ${ticket.discount_value} OFF`
                                                                                                }
                                                                                            </div>
                                                                                            <div className="text-xs text-green-600">Discount</div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Stats Grid */}
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                                                {/* Quantity Stats */}
                                                                                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                                                                                    <div className="flex items-center justify-between mb-2">
                                                                                        <span className="text-sm font-medium text-slate-700">Availability</span>
                                                                                        <Users size={16} className="text-slate-400" />
                                                                                    </div>
                                                                                    <div className="space-y-2">
                                                                                        <div className="flex justify-between items-center">
                                                                                            <span className="text-xs text-slate-500">Total</span>
                                                                                            <span className="font-semibold">{ticket.quantity}</span>
                                                                                        </div>
                                                                                        <div className="flex justify-between items-center">
                                                                                            <span className="text-xs text-slate-500">Sold</span>
                                                                                            <span className="font-semibold text-blue-600">{ticket.sold_count || 0}</span>
                                                                                        </div>
                                                                                        <div className="flex justify-between items-center">
                                                                                            <span className="text-xs text-slate-500">Remaining</span>
                                                                                            <span className="font-semibold text-green-600">{ticket.quantity - (ticket.sold_count || 0)}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Purchase Limits */}
                                                                                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                                                                                    <div className="flex items-center justify-between mb-2">
                                                                                        <span className="text-sm font-medium text-slate-700">Purchase Limits</span>
                                                                                        <ShoppingCart size={16} className="text-slate-400" />
                                                                                    </div>
                                                                                    <div className="space-y-2">
                                                                                        <div className="flex justify-between items-center">
                                                                                            <span className="text-xs text-slate-500">Min per order</span>
                                                                                            <span className="font-semibold">{ticket.min_buy}</span>
                                                                                        </div>
                                                                                        <div className="flex justify-between items-center">
                                                                                            <span className="text-xs text-slate-500">Max per order</span>
                                                                                            <span className="font-semibold">{ticket.max_buy}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Sales Period */}
                                                                                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                                                                                    <div className="flex items-center justify-between mb-2">
                                                                                        <span className="text-sm font-medium text-slate-700">Sales Period</span>
                                                                                        <Calendar size={16} className="text-slate-400" />
                                                                                    </div>
                                                                                    <div className="space-y-2 text-xs">
                                                                                        <div>
                                                                                            <div className="text-slate-500 mb-1">Starts</div>
                                                                                            <div className="font-medium">
                                                                                                {formatDateTime(ticket.sales_start_date, ticket.sales_start_time)}
                                                                                            </div>
                                                                                        </div>
                                                                                        <div>
                                                                                            <div className="text-slate-500 mb-1">Ends</div>
                                                                                            <div className="font-medium">
                                                                                                {formatDateTime(ticket.sales_end_date, ticket.sales_end_time)}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Event Info */}
                                                                                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                                                                                    <div className="flex items-center justify-between mb-2">
                                                                                        <span className="text-sm font-medium text-slate-700">Event Info</span>
                                                                                        <MapPin size={16} className="text-slate-400" />
                                                                                    </div>
                                                                                    <div className="space-y-2 text-xs">
                                                                                        <div className="truncate">{ticket.event.name}</div>
                                                                                        <div className="text-slate-500">{ticket.event.location}</div>
                                                                                        <div className="text-slate-400">Currency: {ticket.event.currency}</div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Special Features */}
                                                                            {(hasEarlyBird || hasAddons || hasTaxes) && (
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                                    {/* Early Bird */}
                                                                                    {hasEarlyBird && (
                                                                                        <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 shadow-sm">
                                                                                            <div className="flex items-center gap-2 mb-3">
                                                                                                <div className="p-2 bg-yellow-100 rounded-lg">
                                                                                                    <Star className="h-4 w-4 text-yellow-600" />
                                                                                                </div>
                                                                                                <h4 className="font-semibold text-yellow-800">Early Bird Offer</h4>
                                                                                            </div>
                                                                                            <div className="space-y-2 text-sm">
                                                                                                <div className="flex justify-between">
                                                                                                    <span className="text-yellow-700">Early Bird Price:</span>
                                                                                                    <span className="font-medium">{ticket.event.currency_symbol} {ticket.early_bird_discount_value}</span>
                                                                                                </div>
                                                                                                <div className="flex justify-between">
                                                                                                    <span className="text-yellow-700">Starts:</span>
                                                                                                    <span className="font-medium">{formatDateRange(ticket.early_bird_start)}</span>
                                                                                                </div>
                                                                                                <div className="flex justify-between">
                                                                                                    <span className="text-yellow-700">Ends:</span>
                                                                                                    <span className="font-medium">{formatDateRange(ticket.early_bird_end)}</span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Add-ons */}
                                                                                    {hasAddons && (
                                                                                        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50 shadow-sm">
                                                                                            <div className="flex items-center gap-2 mb-3">
                                                                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                                                                    <PlusCircle className="h-4 w-4 text-purple-600" />
                                                                                                </div>
                                                                                                <h4 className="font-semibold text-purple-800">Available Add-ons</h4>
                                                                                            </div>
                                                                                            <div className="space-y-2">
                                                                                                {ticket.addons.map((addon) => (
                                                                                                    <div key={addon.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-purple-100">
                                                                                                        <span className="text-sm font-medium text-slate-800">{addon.addon_name}</span>
                                                                                                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                                                                                                            {addon.addon_type === 'percentage'
                                                                                                                ? `${addon.addon_value}%`
                                                                                                                : `${ticket.event.currency_symbol} ${addon.addon_value}`
                                                                                                            }
                                                                                                        </span>
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}

                                                                                    {hasTaxes && (
                                                                                        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 shadow-sm">
                                                                                            <div className="flex items-center gap-2 mb-3">
                                                                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                                                                    <DollarSignIcon className="h-4 w-4 text-blue-600" />
                                                                                                </div>
                                                                                                <h4 className="font-semibold text-blue-800">Available Taxes</h4>
                                                                                            </div>
                                                                                            <div className="space-y-2">
                                                                                                {
                                                                                                    ticket.taxes.map((tax) => (
                                                                                                        <div key={tax.id} className="flex items-center p-2 ">
                                                                                                            <span className="text-sm font-medium text-blue-800">{tax.name} ( {tax.type === "percentage" ? `${tax.value}%` : `${ticket.event.currency_symbol} ${tax.value}`} {tax.mode} )</span>
                                                                                                        </div>
                                                                                                    ))
                                                                                                }
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {selectedPortion === "taxes" && (
                        <>
                            {taxes.length === 0 && (
                                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-16">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                                            <LandmarkIcon className="h-10 w-10 text-slate-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-slate-800 mb-2">
                                            No Taxes Found
                                        </h3>
                                        <p className="text-slate-500 mb-6">
                                            {search ? "Try adjusting your search terms" : "Get started by creating your first event Tax"}
                                        </p>
                                        <Button
                                            onClick={openCreateModal}
                                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl"
                                        >
                                            <Plus size={16} className="mr-2" />
                                            Create Your First Event Tax
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {taxes.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                                    <div className="overflow-x-auto w-full">
                                        <table className="min-w-full">
                                            <thead className="bg-gray-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">
                                                        Tax Name
                                                    </th>
                                                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">
                                                        Value
                                                    </th>
                                                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">
                                                        Mode
                                                    </th>
                                                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-4 text-center text-sm font-semibold text-slate-700">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {taxes.map((tax, idx) => (
                                                    <tr
                                                        key={tax.id}
                                                        className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                                            } hover:bg-gray-50`}
                                                    >
                                                        {/* Tax Name */}
                                                        <td className="px-4 py-3 text-sm font-semibold text-slate-900 whitespace-nowrap">
                                                            {tax.name}
                                                        </td>

                                                        {/* Tax Value */}
                                                        <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                                                            {tax.type === "percentage"
                                                                ? `${tax.value}%`
                                                                : `${selectedEvent.currency_symbol} ${tax.value}`}
                                                        </td>

                                                        {/* Tax Mode */}
                                                        <td className="px-4 py-3 text-sm text-slate-600 capitalize">
                                                            <span
                                                                className={`px-2 py-1 rounded-md text-xs font-medium ${tax.mode === "inclusive"
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : "bg-orange-100 text-orange-700"
                                                                    }`}
                                                            >
                                                                {tax.mode}
                                                            </span>
                                                        </td>

                                                        {/* Tax Status */}
                                                        <td className="px-4 py-3 text-sm">
                                                            {tax.status ? (
                                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                    Active
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                                    Inactive
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Actions (unchanged) */}
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openTaxEditModa(tax);
                                                                    }}
                                                                    className="w-7 h-7 p-0 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all duration-200 hover:scale-105"
                                                                >
                                                                    <Edit size={14} />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleTaxDelete(tax.id);
                                                                    }}
                                                                    className="w-7 h-7 p-0 rounded-md bg-red-100 hover:bg-red-200 hover:text-red-700 text-red-600 transition-all duration-200 hover:scale-105"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}

                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    {selectedPortion === "addons" && (
                        <>
                            {addons.length === 0 && (
                                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-16">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                                            <GitForkIcon className="h-10 w-10 text-slate-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-slate-800 mb-2">
                                            No Addons Found
                                        </h3>

                                        <p className="text-slate-500 mb-6">
                                            {search ? "Try adjusting your search terms" : "Get started by creating your first event Addon"}
                                        </p>
                                        <Button
                                            onClick={openCreateModal}
                                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl">
                                            <Plus size={16} className="mf-2" />
                                            Create your First Addon
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {addons.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                                    <div className="overflow-x-auto w-full">
                                        <table className="min-w-full">
                                            <thead className="bg-gray-50 border- border-slate-200">
                                                <tr>
                                                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">Addon Name</th>
                                                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">Type</th>
                                                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">Value</th>
                                                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {addons.map((addon, idx) => (
                                                    <tr
                                                        key={addon.id}
                                                        className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-50`}
                                                    >
                                                        <td className="px-4 py-3 text-sm font-semibold text-slate-900 whitespace-nowrap">{addon.addon_name}</td>
                                                        <td className="px-4 py-3 capitalize">
                                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${addon.addon_type === "percentage"
                                                                ? "bg-blue-100 text-blue-700"
                                                                : "bg-green-100 text-green-800"
                                                                }`}>
                                                                {addon.addon_type}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                                                            {addon.addon_type === "percentage"
                                                                ? `${addon.addon_value} %`
                                                                : `${selectedEvent.currency_symbol} ${addon.addon_value}`}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openAddonEdit(addon);
                                                                    }}
                                                                    className="w-7 h-7 p-0 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all duration-200 hover:scale-105"
                                                                >
                                                                    <Edit size={14} />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handlAddonDelete(addon.id);
                                                                    }}
                                                                    className="w-7 h-7 p-0 rounded-md bg-red-100 hover:bg-red-200 hover:text-red-700 text-red-600 transition-all duration-200 hover:scale-105"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Ticket Modal */}
                <TicketModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    ticket={selectedTicket}
                    eventId={selectedEvent.id}
                    onSaved={loadTickets}
                />

                <TaxModal
                    open={taxModalOpen}
                    onClose={() => setTaxModalOpen(false)}
                    tax={selectedTax}
                    eventId={selectedEvent.id}
                    onSaved={loadTaxes}
                />

                <AddonModal
                    open={addonModalOpen}
                    onClose={() => setAddonModalOpen(false)}
                    addon={selectedAddon}
                    eventId={selectedEvent.id}
                    onSaved={loadAddons}
                />


                {/* Delete Confirmation */}
                <ConfirmDialog
                    open={!!deleteId}
                    onClose={() => setDeleteId(null)}
                    onConfirm={confirmDelete}
                    title="Delete Ticket"
                    message="Are you sure you want to delete this ticket? This action cannot be undone."
                />

                <ConfirmDialog
                    open={!!deleteTaxId}
                    onClose={() => setDeleteTaxId(null)}
                    onConfirm={ConfirmTaxDelete}
                    title="Delete Tax"
                    message="Are you sure you want to delete this Tax? This action cannot be undone."
                />

                <ConfirmDialog
                    open={!!deleteAddonId}
                    onClose={() => setDeleteAddonId(null)}
                    onConfirm={confirmAddonDelete}
                    title="Delete Addon"
                    message="Are you sure you want to delete this Addon? This action cannot be undone."
                />
            </div>
        </>
    );
}
