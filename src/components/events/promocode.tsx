"use client";

import { useEffect, useState } from "react";
import { Gift, Calendar, Percent, BadgeCheck, Trash2, Edit, Plus, Banknote } from "lucide-react";
import { deletePromoCode, getAllPromoCode } from "@/lib/events";
import { Button } from "../ui/button";
import PromoCodeModal from "./PromoCodeModal";
import ConfirmDialog from "../common/confirmDialog";

export default function PromoCode() {
    const [promoCodes, setPromoCodes] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedPromo, setSelectedPromo] = useState<any | null>(null);

    const ticketColors = [
        "from-pink-500 to-blue-500",
        "from-indigo-600 to-purple-600",
        "from-blue-500 to-green-500",
        "from-yellow-500 to-orange-500",
        "from-green-500 to-purple-500",
    ];

    const loadPromoCodes = async () => {
        setLoading(true);
        try {
            const res = await getAllPromoCode();
            setPromoCodes(res || []);
        } catch (err) {
            console.error("Error fetching promo codes:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPromoCodes();
    }, []);

    const formatDate = (date?: string) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const handleEdit = (promo: any) => {
        setSelectedPromo(promo);
        setModalOpen(true);
    };

    return (
        <div className="min-h-screen md:p-6 lg:p-8">
            <div className="flex flex-row justify-between items-start md:items-center gap-6 mb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                    Promo Code
                </h1>
                <Button
                    onClick={() => {
                        setSelectedPromo(null);
                        setModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                    <Plus size={20} />
                    Create Promo Code
                </Button>
            </div>

            {loading ? (
                <div className="text-center text-slate-500 py-10">Loading promo codes...</div>
            ) : promoCodes.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-16 mt-10 text-center">
                    <Gift className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700">No Promo Codes Found</h3>
                    <p className="text-slate-500 mt-2 mb-6">Get started by creating your first promo code</p>
                    <Button
                        onClick={() => {
                            setSelectedPromo(null);
                            setModalOpen(true);
                        }}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    >
                        <Plus size={16} className="mr-2" /> Create Promo Code
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {promoCodes.map((promo, index) => (
                        <div
                            key={promo.id}
                            className={`  bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-2xl`}
                        >
                            {/* Ticket Header */}
                            <div className={`bg-gradient-to-r ${ticketColors[index % ticketColors.length]} p-5 flex justify-between items-start rounded-t-2xl relative `}>
                                <div>
                                    <span className="text-white font-bold text-lg">{promo.code}</span>
                                    <span className="block text-indigo-100 text-sm mt-1">{promo.event?.name || "No Event"}</span>
                                </div>
                                <BadgeCheck
                                    className={`h-6 w-6 mt-1 ${promo.isActive ? "text-green-300" : "text-red-300"}`}
                                />
                                {/* Perforation circles */}
                                <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-gray-300"></div>
                                <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-gray-300"></div>
                            </div>

                            {/* Ticket Body */}
                            <div className="p-5 space-y-3 border-b border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <Banknote className="h-5 w-5 text-indigo-500" />
                                    <span className="font-medium">
                                        {promo.discountType === "percentage"
                                            ? `${promo.discountValue}%`
                                            : `${promo.event.currency_symbol} ${promo.discountValue}`}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="h-5 w-5 text-indigo-500" />
                                    <span>
                                        {formatDate(promo.validFrom)} - {formatDate(promo.validTo)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm text-gray-600">
                                    <span className="font-medium">
                                        Usage: {promo.usedCount}/{promo.usageLimit || "∞"}
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${promo.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {promo.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>

                            {/* Ticket Footer / Actions */}
                            <div className="p-4 flex justify-end gap-3 bg-gray-50 border-t border-dashed border-slate-600">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-lg flex items-center gap-1"
                                    onClick={() => handleEdit(promo)}
                                >
                                    <Edit size={16} /> Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="rounded-lg flex items-center gap-1"
                                    onClick={() => setDeleteId(promo.id)}
                                >
                                    <Trash2 size={16} /> Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

            )}

            {/* Modal */}
            <PromoCodeModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                promoCode={selectedPromo}
                onSaved={() => loadPromoCodes()}
            />

            <ConfirmDialog
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={async () => {
                    if (deleteId) {
                        await deletePromoCode(deleteId);
                        setDeleteId(null);
                        loadPromoCodes();
                    }
                }}
                title="Delete Promo Code"
                message="Are you sure you want to delete this Promo Code? This action cannot be undone."
            />

        </div>
    );
}
