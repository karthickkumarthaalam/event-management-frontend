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
    CreditCard,
    Ticket,
    Package,
    Gift
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
                            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-800 bg-clip-text text-transparent mb-2">Order Reports</h1>
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
                                        <tr
                                            className="hover:bg-gradient-to-r hover:bg-gray-50 transition-all duration-300 group cursor-pointer"
                                            onClick={() => toggleOrderExpansion(order.orderId)}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex flex-row gap-3 items-center">
                                                    {expandedOrders.has(order.orderId) ? (
                                                        <>
                                                            <ChevronUp className="w-4 h-4 text-indigo-600" />
                                                            <span className="hidden xs:inline text-indigo-600 font-medium">Hide</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="w-4 h-4 text-indigo-600" />
                                                            <span className="hidden xs:inline text-indigo-600 font-medium">Details</span>
                                                        </>
                                                    )}
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                                                        <div className="flex-1">
                                                            <p className="font-bold text-gray-900 text-sm sm:text-base">#{order.orderId}</p>
                                                            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1">
                                                                <Package className="w-3 h-3 text-gray-500" /> {order.items.length} ticket(s)
                                                            </p>
                                                        </div>

                                                        {/* Mobile Customer Info */}
                                                        <div className="sm:hidden mt-2 pt-2 border-t border-indigo-100">
                                                            <p className="font-semibold text-gray-700 text-sm">{order.purchaser.name}</p>
                                                            <p className="text-xs text-gray-500 truncate">{order.purchaser.email}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Customer Column - Hidden on Mobile */}
                                            <td className="px-4 py-3 hidden sm:table-cell">
                                                <div>
                                                    <p className="font-semibold text-gray-700 text-sm">{order.purchaser.name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[150px]">{order.purchaser.email}</p>
                                                </div>
                                            </td>

                                            {/* Amount */}
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-blue-700 whitespace-nowrap text-base sm:text-lg">
                                                    {formatCurrency(order.orderDetails.totalAmount)}
                                                </p>
                                            </td>

                                            {/* Status - Hidden Mobile */}
                                            <td className="px-4 py-3 hidden md:table-cell">{getStatusBadge(order.orderDetails.paymentStatus, 'colorful')}</td>

                                            {/* Date - Hidden on Mobile/Tablet */}
                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Calendar className="w-4 h-4 text-indigo-400" />
                                                    <p className="text-sm font-medium">{formatDate(order.orderDetails.purchasedOn)}</p>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-between sm:justify-start gap-2">
                                                    {/* Mobile Status Badge */}
                                                    <div className="md:hidden">{getStatusBadge(order.orderDetails.paymentStatus, 'colorful')}</div>
                                                </div>
                                            </td>
                                        </tr>


                                        {/* Expanded Details */}
                                        {expandedOrders.has(order.orderId) && (
                                            <tr>
                                                <td colSpan={6} className="p-0">
                                                    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-t border-slate-200">
                                                        <div className="max-w-7xl mx-auto px-6 py-6">


                                                            {/* Grid Layout */}
                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                                                {/* Customer Info */}
                                                                <div className="bg-white  rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                                                                    <div className="border-b border-slate-100 px-4 py-3 flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-indigo-50">
                                                                        <Users className="w-5 h-5 text-indigo-600" />
                                                                        <h4 className="font-semibold text-slate-900">Customer Information</h4>
                                                                    </div>
                                                                    <div className="p-4 text-sm text-slate-700">
                                                                        <dl className="space-y-3">
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <div>
                                                                                    <dt className="text-xs font-medium text-slate-500 uppercase">Name</dt>
                                                                                    <dd className="font-semibold text-indigo-700">{order.purchaser.name}</dd>
                                                                                </div>
                                                                                <div>
                                                                                    <dt className="text-xs font-medium text-slate-500 uppercase">Email</dt>
                                                                                    <dd className="text-slate-800">{order.purchaser.email}</dd>
                                                                                </div>
                                                                            </div>
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <div>
                                                                                    <dt className="text-xs font-medium text-slate-500 uppercase">Mobile</dt>
                                                                                    <dd className="text-slate-800">{order.purchaser.mobile}</dd>
                                                                                </div>
                                                                                <div>
                                                                                    <dt className="text-xs font-medium text-slate-500 uppercase">Country</dt>
                                                                                    <dd className="text-slate-800">{order.purchaser.country}</dd>
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <dt className="text-xs font-medium text-slate-500 uppercase">Address</dt>
                                                                                <dd className="mt-1 leading-5 text-slate-800">
                                                                                    {order.purchaser.line1}<br />
                                                                                    {order.purchaser.line2 && <>{order.purchaser.line2}<br /></>}
                                                                                    {order.purchaser.city}, {order.purchaser.state} {order.purchaser.postal_code}
                                                                                </dd>
                                                                            </div>
                                                                        </dl>
                                                                    </div>
                                                                </div>

                                                                {/* Payment Info */}
                                                                <div className="bg-white  rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                                                                    <div className="border-b border-slate-100 px-4 py-3 flex items-center gap-2 bg-gradient-to-r from-purple-100 to-purple-50">
                                                                        <CreditCard className="w-5 h-5 text-purple-600" />
                                                                        <h4 className="font-semibold text-slate-900">Payment Details</h4>
                                                                    </div>
                                                                    <div className="p-4 text-sm text-slate-700 space-y-3">
                                                                        <p><span className="font-medium text-slate-600">Gateway:</span> <span className="text-purple-800">{order.orderDetails.paymentGateway || 'N/A'}</span></p>
                                                                        <p><span className="font-medium text-slate-600">Transaction ID:</span> <span className="font-mono text-purple-700">{order.orderDetails.gatewayTransactionId || 'N/A'}</span></p>
                                                                        <p><span className="font-medium text-slate-600">Payment Date:</span> <span className="text-slate-800">{formatDate(order.orderDetails.updatedAt)}</span></p>
                                                                    </div>
                                                                </div>

                                                                {/* Tickets */}
                                                                <div className="lg:col-span-2 bg-white  rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                                                                    <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-100 to-blue-50">
                                                                        <div className="flex items-center gap-2">
                                                                            <Ticket className="w-5 h-5 text-blue-600" />
                                                                            <h4 className="font-semibold text-slate-900">Tickets</h4>
                                                                        </div>
                                                                        <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                                                                            {order.items.length} ticket(s)
                                                                        </span>
                                                                    </div>
                                                                    <div className="p-4">
                                                                        <table className="w-full text-sm text-left border-collapse">
                                                                            <thead>
                                                                                <tr className="text-slate-500 border-b border-slate-100">
                                                                                    <th className="py-2">Ticket ID</th>
                                                                                    <th>Class</th>
                                                                                    <th>Status</th>
                                                                                    <th className="text-right">Amount</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {order.items.map((item) => (
                                                                                    <tr key={item.ticketId} className="border-b border-slate-100 hover:bg-blue-50 transition">
                                                                                        <td className="py-2 font-medium text-blue-900">#{item.ticketId}</td>
                                                                                        <td className="text-slate-800">{item.ticketClass}</td>
                                                                                        <td>
                                                                                            <span className="text-green-800 bg-green-100 px-2 py-0.5 rounded-full text-xs font-medium">Active</span>
                                                                                        </td>
                                                                                        <td className="text-right font-semibold text-blue-900">{formatCurrency(item.totalAmount)}</td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>

                                                                {/* Add-ons */}
                                                                {order.addons.length > 0 && (
                                                                    <div className="lg:col-span-2 bg-white  rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                                                                        <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between bg-gradient-to-r from-pink-100 to-pink-50">
                                                                            <div className="flex items-center gap-2">
                                                                                <Gift className="w-5 h-5 text-pink-600" />
                                                                                <h4 className="font-semibold text-slate-900">Add-ons</h4>
                                                                            </div>
                                                                            <span className="text-xs px-3 py-1 rounded-full bg-pink-100 text-pink-700 font-medium">
                                                                                {order.addons.length} add-on(s)
                                                                            </span>
                                                                        </div>
                                                                        <div className="p-4">
                                                                            <table className="w-full text-sm text-left border-collapse">
                                                                                <thead>
                                                                                    <tr className="text-slate-500 border-b border-slate-100">
                                                                                        <th className="py-2">Name</th>
                                                                                        <th>Qty</th>
                                                                                        <th>Ref ID</th>
                                                                                        <th className="text-right">Amount</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {order.addons.map((addon) => (
                                                                                        <tr key={addon.addonRefId} className="border-b border-slate-100 hover:bg-pink-50 transition">
                                                                                            <td className="py-2 font-medium text-pink-900">{addon.addonName}</td>
                                                                                            <td>{addon.quantity}</td>
                                                                                            <td className="font-mono text-slate-600">#{addon.addonRefId}</td>
                                                                                            <td className="text-right font-semibold text-pink-900">{formatCurrency(addon.totalAmount)}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                        </div>
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