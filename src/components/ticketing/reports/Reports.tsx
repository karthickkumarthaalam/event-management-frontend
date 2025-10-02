'use client';

import { useTicketing } from "@/contexts/TicketingContextT";
import { fetchOrderReport } from "@/lib/order";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import {
    Download,
    FileText,
    Users,
    Calendar,
    Mail,
    Phone,
    MapPin,
    CheckCircle,
    Clock,
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    XCircle,
    TrendingUp,
    Package
} from "lucide-react";
import { Select, SelectItem, SelectTrigger } from "@/components/ui/select";
import { SelectContent, SelectValue } from "@radix-ui/react-select";

interface Order {
    orderId: string;
    purchaser: {
        name: string;
        email: string;
        mobile: string;
        line1: string;
        line2: string;
        city: string;
        state: string;
        country: string;
        postal_code: string;
    };
    orderDetails: {
        totalAmount: string;
        discountedAmount: string;
        paymentStatus: string;
        paymentMode: string | null;
        paymentGateway: string | null;
        gatewayTransactionId: string | null;
        purchasedOn: string;
        updatedAt: string;
    };
    items: Array<{
        ticketId: string;
        ticketRefId: string;
        ticketClass: string;
        quantity: number;
        price: string;
        totalAmount: string;
        status: string;
        taxes: Array<{
            taxRefId: string;
            taxName: string;
            taxRate: string;
            taxAmount: string;
        }>;
        addons: any[];
    }>;
    addons: Array<{
        addonRefId: string;
        addonName: string;
        price: string;
        quantity: number;
        totalAmount: string;
    }>;
}

interface ReportData {
    data: Order[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export default function Reports() {
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

    const { selectedEvent } = useTicketing();

    const fetchReport = async (page: number) => {
        if (!selectedEvent?.id) return;

        setLoading(true);
        try {
            const data = await fetchOrderReport(selectedEvent.id, page, 20);
            setReport(data);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to fetch Order Report");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport(page);
    }, [selectedEvent, page]);

    const toggleOrderExpansion = (orderId: string) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedOrders(newExpanded);
    };


    const formatCurrency = (amount: string) => {
        return `${selectedEvent.currency_symbol} ${parseFloat(amount).toFixed(2)}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            paid: { color: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: CheckCircle },
            pending: { color: "bg-amber-50 text-amber-700 border border-amber-200", icon: Clock },
            failed: { color: "bg-rose-50 text-rose-700 border border-rose-200", icon: XCircle }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const IconComponent = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${config.color}`}>
                <IconComponent className="w-3.5 h-3.5" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const filteredOrders = report?.data?.filter(order => {
        const matchesSearch =
            order.purchaser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.purchaser.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.orderId.includes(searchTerm);

        const matchesStatus = statusFilter === "all" || order.orderDetails.paymentStatus === statusFilter;

        return matchesSearch && matchesStatus;
    }) || [];

    const exportToCSV = () => {
        if (!filteredOrders.length) return;

        const headers = [
            'Order ID',
            'Customer Name',
            'Email',
            'Mobile',
            'Total Amount',
            'Payment Status',
            'Purchase Date',
            'Ticket Count',
            'Addons Count'
        ];

        const csvData = filteredOrders.map(order => [
            order.orderId,
            order.purchaser.name,
            order.purchaser.email,
            order.purchaser.mobile,
            order.orderDetails.totalAmount,
            order.orderDetails.paymentStatus,
            order.orderDetails.purchasedOn,
            order.items.length,
            order.addons.length
        ]);

        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `orders-report-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="md:p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-row items-center justify-between gap-4">
                        <div className="text-left">
                            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-900 bg-clip-text text-transparent mb-2">Order Reports</h1>
                            <p className="text-slate-600 hidden md:block">
                                Manage and analyze all orders for <span className="font-semibold text-indigo-600">{selectedEvent?.name}</span>
                            </p>
                        </div>
                        {/* <button
                            onClick={exportToCSV}
                            disabled={!filteredOrders.length}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 font-semibold text-sm"
                        >
                            <Download className="w-5 h-5" />
                            Export CSV
                        </button> */}
                    </div>
                </div>


                {/* Filters and Search */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <Input
                                    placeholder="Search events by name, location, or status..."
                                    className="pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative w-48">
                                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
                                    <SelectTrigger className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all">
                                        <SelectValue
                                            placeholder="Status"
                                            className="text-gray-400 italic text-sm"
                                        />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white rounded-lg shadow-lg">
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Order Details
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider hidden sm:table-cell">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider hidden lg:table-cell">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider hidden md:table-cell">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredOrders.map((order) => (
                                    <React.Fragment key={order.orderId}>
                                        {/* Main Row */}
                                        <tr className="hover:bg-indigo-50/30 transition-colors group" onClick={() => toggleOrderExpansion(order.orderId)}>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-row gap-2 items-center">
                                                    {expandedOrders.has(order.orderId) ? (
                                                        <>
                                                            <ChevronUp className="w-4 h-4" /> <span className="hidden xs:inline">Hide</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="w-4 h-4" /> <span className="hidden xs:inline">Details</span>
                                                        </>
                                                    )}
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                                                        <div className="flex-1">
                                                            <p className="font-bold text-slate-900 text-sm">#{order.orderId}</p>
                                                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                                <Package className="w-3 h-3" /> {order.items.length} ticket(s)
                                                            </p>
                                                        </div>
                                                        {/* Mobile Customer Info */}
                                                        <div className="sm:hidden mt-2 pt-2 border-t border-slate-100">
                                                            <p className="font-semibold text-slate-900 text-sm">{order.purchaser.name}</p>
                                                            <p className="text-xs text-slate-500 truncate">{order.purchaser.email}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                            </td>

                                            {/* Customer Column - Hidden on Mobile */}
                                            <td className="px-4 py-3 hidden sm:table-cell">
                                                <div>
                                                    <p className="font-semibold text-slate-900 text-sm">{order.purchaser.name}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[150px]">{order.purchaser.email}</p>
                                                </div>
                                            </td>

                                            {/* Amount */}
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-slate-900 whitespace-nowrap text-base sm:text-lg">{formatCurrency(order.orderDetails.totalAmount)}</p>
                                            </td>

                                            {/* Status - Hidden Mobile */}
                                            <td className="px-4 py-3 hidden md:table-cell">{getStatusBadge(order.orderDetails.paymentStatus)}</td>

                                            {/* Date - Hidden on Mobile/Tablet */}
                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    <p className="text-sm font-medium">{formatDate(order.orderDetails.purchasedOn)}</p>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-between sm:justify-start gap-2">
                                                    {/* Mobile Status Badge */}
                                                    <div className="md:hidden">{getStatusBadge(order.orderDetails.paymentStatus)}</div>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expanded Details */}
                                        {expandedOrders.has(order.orderId) && (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-6 bg-gradient-to-r from-indigo-50 to-indigo-100 border-t border-indigo-100">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-7xl mx-auto">

                                                        {/* Customer Info Card */}
                                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300">
                                                            <div className="flex items-start gap-3">
                                                                <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex-shrink-0 shadow-sm">
                                                                    <Users className="w-5 h-5 text-white" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-bold text-indigo-600 text-lg mb-2">Customer Information</h3>
                                                                    <div className="space-y-1 text-sm text-gray-700 grid grid-cols-1 md:grid-cols-2">
                                                                        <p><span className="font-semibold">Name:</span> {order.purchaser.name}</p>
                                                                        <p><span className="font-semibold">Email:</span> {order.purchaser.email}</p>
                                                                        <p><span className="font-semibold">Mobile:</span> {order.purchaser.mobile}</p>
                                                                        <p><span className="font-semibold">line1:</span> {order.purchaser.line1}</p>
                                                                        <p><span className="font-semibold">line2:</span> {order.purchaser.line2}</p>
                                                                        <p><span className="font-semibold">city:</span> {order.purchaser.city}</p>
                                                                        <p><span className="font-semibold">State:</span> {order.purchaser.state}</p>
                                                                        <p><span className="font-semibold">Country:</span> {order.purchaser.country}</p>
                                                                        <p><span className="font-semibold">Postal Code:</span> {order.purchaser.postal_code}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Payment Info Card */}
                                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300">
                                                            <div className="flex items-start gap-3">
                                                                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex-shrink-0 shadow-sm">
                                                                    <FileText className="w-5 h-5 text-white" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-bold text-purple-600 text-lg mb-2">Payment Details</h3>
                                                                    <div className="space-y-1 text-sm text-gray-700">
                                                                        <p><span className="font-semibold">Gateway:</span> {order.orderDetails.paymentGateway || 'N/A'}</p>
                                                                        <p><span className="font-semibold">Txn ID:</span> {order.orderDetails.gatewayTransactionId || 'N/A'}</p>
                                                                        <p><span className="font-semibold">Paid On:</span> {formatDate(order.orderDetails.updatedAt)}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Tickets Section */}
                                                        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300">
                                                            <div className="flex items-center gap-3 mb-4">
                                                                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
                                                                    <Package className="w-5 h-5 text-white" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-blue-600 text-lg">Tickets</h3>
                                                                    <p className="text-sm text-slate-500">{order.items.length} ticket(s) purchased</p>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                {order.items.map((item) => (
                                                                    <div key={item.ticketId} className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                                                                        <div className="flex justify-between items-center mb-2">
                                                                            <p className="font-semibold text-blue-900">#{item.ticketId} {item.ticketClass}</p>
                                                                            <p className="font-bold text-blue-900">{formatCurrency(item.totalAmount)}</p>
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-2 text-xs">
                                                                            <span className="bg-blue-200 text-blue-900 px-2 py-1 rounded-full font-medium">Qty: {item.quantity}</span>
                                                                            <span className="bg-blue-200 text-blue-900 px-2 py-1 rounded-full font-medium">Each: {formatCurrency(item.price)}</span>
                                                                            {item.taxes.length > 0 && (
                                                                                <span className="bg-blue-200 text-blue-900 px-2 py-1 rounded-full font-medium">
                                                                                    Tax: {formatCurrency(item.taxes.reduce((sum, tax) => sum + parseFloat(tax.taxAmount), 0))}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Add-ons Section */}
                                                        {order.addons.length > 0 && (
                                                            <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300">
                                                                <div className="flex items-center gap-3 mb-4">
                                                                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-sm">
                                                                        <TrendingUp className="w-5 h-5 text-white" />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-bold text-emerald-600 text-lg">Add-ons</h3>
                                                                        <p className="text-sm text-slate-500">{order.addons.length} add-on(s) purchased</p>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                    {order.addons.map((addon) => (
                                                                        <div key={addon.addonRefId} className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                                                                            <div className="flex justify-between items-center mb-2">
                                                                                <p className="font-semibold text-emerald-900">{addon.addonName}</p>
                                                                                <p className="font-bold text-emerald-900">{formatCurrency(addon.totalAmount)}</p>
                                                                            </div>
                                                                            <div className="flex flex-wrap gap-2 text-xs">
                                                                                <span className="bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full font-medium">Qty: {addon.quantity}</span>
                                                                                <span className="bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full font-medium">Each: {formatCurrency(addon.price)}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {filteredOrders.length === 0 && (
                        <div className="text-center py-16 px-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-4 shadow-sm">
                                <FileText className="w-10 h-10 text-slate-400" />
                            </div>
                            <p className="text-slate-700 text-xl font-bold mb-2">No orders found</p>
                            <p className="text-slate-500 text-sm">
                                {searchTerm || statusFilter !== "all" ? "Try adjusting your search or filters" : "No orders have been placed yet"}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {report?.meta && report.meta.totalPages > 1 && (
                        <div className="px-4 py-5 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-sm font-semibold text-slate-600 text-center sm:text-left">
                                    Showing page <span className="text-indigo-600 font-bold">{report.meta.page}</span> of <span className="text-indigo-600 font-bold">{report.meta.totalPages}</span>
                                    <span className="text-slate-400 ml-2 hidden sm:inline">({report.meta.total} total orders)</span>
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2.5 border-2 border-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:border-indigo-500 hover:text-indigo-600 font-semibold transition-all text-sm sm:text-base min-w-[100px]"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(report.meta.totalPages, p + 1))}
                                        disabled={page === report.meta.totalPages}
                                        className="px-4 py-2.5 border-2 border-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:border-indigo-500 hover:text-indigo-600 font-semibold transition-all text-sm sm:text-base min-w-[100px]"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}