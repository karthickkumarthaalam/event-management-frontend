"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, Ticket, TrendingUp, Package, Calendar } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { useTicketing } from "@/contexts/TicketingContextT";
import { fetchOrdersSummary } from "@/lib/order";
import EventSelectionModal from "./EventSelectionModal";

const OrdersDashboard = () => {
    const [orderData, setOrderData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { selectedEvent, setSelectedEvent } = useTicketing();

    useEffect(() => {
        if (!selectedEvent?.id) return;

        setLoading(true);
        fetchOrdersSummary(selectedEvent.id)
            .then((data) => {
                setOrderData(data);
            })
            .catch((err) => {
                console.error("Error fetching orders summary:", err);
            })
            .finally(() => setLoading(false));
    }, [selectedEvent?.id]);


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

    if (!orderData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-500">No order data available.</p>
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        if (!selectedEvent?.currency_symbol) return `${Number(amount || 0).toFixed(2)}`;
        return `${selectedEvent.currency_symbol} ${Number(amount || 0).toFixed(2)}`;
    };

    const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444"];
    const LIGHT_COLORS = ["#dbeafe", "#f3e8ff", "#fce7f3", "#fef3c7", "#d1fae5", "#fee2e2"];

    const GRADIENTS = [
        "from-blue-100 to-blue-300",
        "from-purple-100 to-purple-300",
        "from-pink-100 to-pink-300",
        "from-amber-100 to-amber-300",
        "from-emerald-100 to-emerald-300",
        "from-red-100 to-red-300",
    ];

    const StatCard = ({ title, value, icon: Icon, subtitle, color, index }) => {
        return (
            <div className="group bg-white rounded-2xl shadow-xs border border-slate-100 p-6 shadow-md hover:shadow-xl hover:scale-105 hover:border-slate-200 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
                        <p className={`text-xl xl:text-2xl font-bold ${color} mb-2 whitespace-nowrap`}>{value}</p>
                        {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
                    </div>
                    <div
                        className={`p-3 rounded-xl bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} group-hover:scale-110 transition-transform duration-300`}
                    >
                        <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                </div>
            </div>
        );
    };
    return (
        <div className="min-h-screen md:p-6">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex  justify-between items-center gap-2">
                    <div className="flex-1">
                        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent [-webkit-text-fill-color:transparent] mb-2">
                            {selectedEvent?.name}
                        </h1>
                        <p className="text-slate-500 max-w-2xl text-sm hidden md:block">
                            Comprehensive overview of ticket sales, revenue, and performance metrics
                        </p>
                    </div>

                    <button
                        className="px-3 py-2 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg shadow-lg text-sm whitespace-nowrap flex gap-2 items-center"
                        onClick={() => setSelectedEvent(null)}
                    >
                        <Calendar size={16} />
                        change Event
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(orderData.totalRevenue)}
                        icon={DollarSign}
                        subtitle={`Including ${formatCurrency(orderData.totalAddons)} in addons`}
                        color="text-blue-600"
                        index={0}
                    />
                    <StatCard
                        title="Tickets Sold"
                        value={orderData.totalTicketsSold.toLocaleString()}
                        icon={Ticket}
                        subtitle="Paid orders only"
                        color="text-purple-600"
                        index={1}
                    />
                    <StatCard
                        title="Tax Collected"
                        value={formatCurrency(orderData.totalTaxCollected)}
                        icon={TrendingUp}
                        subtitle={`${(
                            (orderData.totalTaxCollected / (orderData.totalRevenue || 1)) *
                            100
                        ).toFixed(1)}% of revenue`}
                        color="text-pink-600"
                        index={2}
                    />
                    <StatCard
                        title="Add-ons Revenue"
                        value={formatCurrency(orderData.totalAddons)}
                        icon={Package}
                        subtitle={`${(
                            (orderData.totalAddons / (orderData.totalRevenue || 1)) *
                            100
                        ).toFixed(1)}% of total`}
                        color="text-amber-600"
                        index={3}
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart */}
                    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Revenue by Ticket Class
                                </h2>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-medium text-blue-700">Total Revenue</span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={orderData.ticketClassBreakdown}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.9} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                                <XAxis
                                    dataKey="ticketClass"
                                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis
                                    tick={{ fill: "#64748b", fontSize: 12 }}
                                    tickFormatter={(value) => formatCurrency(value)}
                                />
                                <Tooltip
                                    formatter={(value) => [formatCurrency(value as number), "Revenue"]}
                                    labelFormatter={(label) => `Ticket Class: ${label}`}
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "1px solid #e2e8f0",
                                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                                        background: "white",
                                        fontSize: "14px",
                                    }}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="url(#revenueGradient)"
                                    radius={[6, 6, 0, 0]}
                                    className="hover:opacity-90 transition-all duration-200"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                            <h2 className="text-xl font-semibold text-slate-900">
                                Tickets Sold Distribution
                            </h2>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={orderData.ticketClassBreakdown}
                                    dataKey="sold"
                                    nameKey="ticketClass"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    innerRadius={40}
                                    paddingAngle={2}
                                    label={({ ticketClass, sold, percent }) =>
                                        `${ticketClass}: ${sold} (${(percent * 100).toFixed(1)}%)`
                                    }
                                    labelLine={false}
                                >
                                    {orderData.ticketClassBreakdown.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            stroke="#fff"
                                            strokeWidth={2}
                                            className="hover:opacity-80 transition-opacity cursor-pointer"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name) => [value, `${name} Tickets`]}
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "1px solid #e2e8f0",
                                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                                        background: "white",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                            <h2 className="text-xl font-semibold text-slate-900">
                                Ticket Class Breakdown
                            </h2>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-25 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                                        Ticket Class
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                                        Tickets Sold
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap ">
                                        Revenue
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                                        Avg Price
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm hidden lg:block font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                                        % of Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orderData.ticketClassBreakdown.map((item, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-slate-25 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div
                                                    className="w-3 h-3 rounded-full mr-3 transition-transform group-hover:scale-125"
                                                    style={{
                                                        backgroundColor: COLORS[index % COLORS.length],
                                                    }}
                                                ></div>
                                                <span className="text-sm font-semibold text-slate-900 group-hover:text-slate-700">
                                                    {item.ticketClass}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-semibold text-slate-900">
                                                {item.sold.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-semibold text-slate-900">
                                                {formatCurrency(item.revenue)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm text-slate-600 font-medium">
                                                {formatCurrency(item.revenue / (item.sold || 1))}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap hidden lg:block text-right">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {(
                                                    (item.revenue / (orderData.totalRevenue || 1)) *
                                                    100
                                                ).toFixed(1)}
                                                %
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <EventSelectionModal />
        </div>
    );
};

export default OrdersDashboard;