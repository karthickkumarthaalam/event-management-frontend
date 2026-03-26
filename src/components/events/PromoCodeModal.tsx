"use client";

import { createPromoCode, fetchEventList, updatePromoCode } from "@/lib/events";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface PromoCodeModalProps {
    open: boolean;
    onClose: () => void;
    promoCode: any | null;
    onSaved: () => void;
}

export default function PromoCodeModal({
    open,
    onClose,
    promoCode,
    onSaved,
}: PromoCodeModalProps) {
    const [form, setForm] = useState({
        code: "",
        discountType: "fixed",
        discountValue: 0,
        validFrom: "",
        validTo: "",
        usageLimit: "",
        isActive: true,
        eventId: "",
    });

    const [events, setEvents] = useState<{ id: string; name: string; }[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Initialize modal when opened
    useEffect(() => {
        if (!open) return;

        // Reset form
        setError(null);
        setFieldErrors({});

        const initialForm = {
            code: promoCode?.code || "",
            discountType: promoCode?.discountType || "fixed",
            discountValue: promoCode?.discountValue || 0,
            validFrom: promoCode?.validFrom?.split("T")[0] || "",
            validTo: promoCode?.validTo?.split("T")[0] || "",
            usageLimit: promoCode?.usageLimit?.toString() || "",
            isActive: promoCode?.isActive ?? true,
            eventId: promoCode?.event?.id || "",
        };
        setForm(initialForm);

        // Fetch events
        fetchEvents(initialForm.eventId);
    }, [open, promoCode]);

    async function fetchEvents(currentEventId?: string) {
        setLoadingEvents(true);
        try {
            const res = await fetchEventList();
            let eventsData: { id: string; name: string; }[] = res.data || [];

            // Include current event if it's not in the list
            if (currentEventId && !eventsData.find(e => e.id === currentEventId) && promoCode?.event) {
                eventsData = [promoCode.event, ...eventsData];
            }

            setEvents(eventsData);
        } catch (err: any) {
            console.error("Error fetching events:", err.message);
        } finally {
            setLoadingEvents(false);
        }
    }

    async function handleSave() {
        setError(null);
        setFieldErrors({});

        const errors: Record<string, string> = {};
        if (!form.code.trim()) errors.code = "Promo Code is required";
        if (!form.discountValue || Number(form.discountValue) <= 0)
            errors.discountValue = "Discount value must be positive";
        if (!form.eventId) errors.eventId = "Event is required";

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...form,
                discountValue: Number(form.discountValue),
                usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
                validFrom: form.validFrom || null,
                validTo: form.validTo || null,
            };

            if (promoCode) {
                await updatePromoCode(promoCode.id, payload);
            } else {
                await createPromoCode(payload);
            }

            onSaved();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div
                className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[480px] md:w-[600px] z-50 transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"} flex flex-col bg-gradient-to-br from-gray-100 to-gray-200`}
            >
                <div className="p-4 flex justify-between items-center sticky top-0 border-b border-gray-200 bg-gray-800 z-10">
                    <h2 className="text-xl text-white font-semibold">
                        {promoCode ? "Edit Promo Code" : "Create Promo Code"}
                    </h2>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700" onClick={onClose}>✕</Button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

                    <div className="space-y-4 bg-white p-4 rounded-xl border border-gray-200">
                        <div>
                            <Label >Promo Code</Label>
                            <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className={fieldErrors.code ? "border-red-500" : ""} />
                            {fieldErrors.code && <p className="text-red-500 text-xs mt-1">{fieldErrors.code}</p>}
                        </div>

                        <div>
                            <Label>Event</Label>
                            <Select value={form.eventId} onValueChange={val => setForm({ ...form, eventId: val })} disabled={loadingEvents}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingEvents ? "Loading..." : "Select Event"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {events.map(event => <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {fieldErrors.eventId && <p className="text-red-500 text-xs mt-1">{fieldErrors.eventId}</p>}
                        </div>

                        <div>
                            <Label>Discount Type</Label>
                            <Select value={form.discountType} onValueChange={val => setForm({ ...form, discountType: val })}>
                                <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>


                        <div>
                            <Label>Discount Value</Label>
                            <Input type="number" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: Number(e.target.value) })} className={fieldErrors.discountValue ? "border-red-500" : ""} />
                            {fieldErrors.discountValue && <p className="text-red-500 text-xs mt-1">{fieldErrors.discountValue}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Valid From</Label>
                                <Input type="date" value={form.validFrom} onChange={e => setForm({ ...form, validFrom: e.target.value })} />
                            </div>
                            <div>
                                <Label>Valid To</Label>
                                <Input type="date" value={form.validTo} onChange={e => setForm({ ...form, validTo: e.target.value })} />
                            </div>
                        </div>

                        <div>
                            <Label>Usage Limit</Label>
                            <Input type="number" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} />
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                            <Label>Active</Label>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-[hsl(var(--primary))] to-blue-500 text-white">
                        {loading ? "Saving..." : promoCode ? "Update Promo Code" : "Create Promo Code"}
                    </Button>
                </div>
            </div>
        </>
    );
}
