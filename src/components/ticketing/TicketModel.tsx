"use client";

import { useState, useEffect } from "react";
import { createTicket, updateTicket, fetchTaxes } from "@/lib/ticketing"; // <-- add fetchTaxes
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Tag, Calendar, Gift, DollarSign } from "lucide-react";

interface TicketModalProps {
    open: boolean;
    onClose: () => void;
    ticket: any | null;
    eventId: string;
    onSaved: () => void;
}

interface Tax {
    id: string;
    name: string;
    type: "fixed" | "percentage";
    value: number;
    mode: "inclusive" | "exclusive";
}

export default function TicketModal({ open, onClose, ticket, eventId, onSaved }: TicketModalProps) {
    const [form, setForm] = useState({
        ticket_name: "",
        quantity: 1,
        price: 0,
        min_buy: undefined as number | undefined,
        max_buy: undefined as number | undefined,
        description: "",
        sales_start_date: "",
        sales_start_time: "",
        sales_end_date: "",
        sales_end_time: "",
        discount_type: undefined as "fixed" | "percentage" | undefined,
        discount_value: undefined as number | undefined,
        early_bird_enabled: false,
        early_bird_discount_value: undefined as number | undefined,
        early_bird_start: "",
        early_bird_end: "",
    });

    const [taxes, setTaxes] = useState<Tax[]>([]);
    const [selectedTaxIds, setSelectedTaxIds] = useState<string[]>([]);

    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadTaxes() {
            try {
                const res = await fetchTaxes(eventId);
                setTaxes(res || []);
            } catch (err) {
                console.error("Failed to load taxes", err);
            }
        }
        if (open) loadTaxes();
    }, [open, eventId]);

    useEffect(() => {
        if (ticket) {
            setForm({
                ticket_name: ticket.ticket_name,
                quantity: ticket.quantity,
                price: ticket.price,
                min_buy: ticket.min_buy,
                max_buy: ticket.max_buy,
                description: ticket.description || "",
                sales_start_date: ticket.sales_start_date?.split("T")[0] || "",
                sales_start_time: ticket.sales_start_time || "",
                sales_end_date: ticket.sales_end_date?.split("T")[0] || "",
                sales_end_time: ticket.sales_end_time || "",
                discount_type: ticket.discount_type,
                discount_value: ticket.discount_value,
                early_bird_enabled: ticket.early_bird_enabled || false,
                early_bird_discount_value: ticket.early_bird_discount_value || undefined,
                early_bird_start: ticket.early_bird_start?.split("T")[0] || "",
                early_bird_end: ticket.early_bird_end?.split("T")[0] || "",
            });
            setSelectedTaxIds(ticket.taxes?.map((t: Tax) => t.id) || []);
        } else {
            setForm({
                ticket_name: "",
                quantity: 1,
                price: 0,
                min_buy: undefined,
                max_buy: undefined,
                description: "",
                sales_start_date: "",
                sales_start_time: "",
                sales_end_date: "",
                sales_end_time: "",
                discount_type: undefined,
                discount_value: undefined,
                early_bird_enabled: false,
                early_bird_discount_value: undefined,
                early_bird_start: "",
                early_bird_end: "",
            });
            setSelectedTaxIds([]);
        }
        setError(null);
        setFieldErrors({});
    }, [ticket, open]);


    function toggleTax(id: string) {
        if (selectedTaxIds.includes(id)) {
            setSelectedTaxIds(selectedTaxIds.filter((tid) => tid !== id));
        } else {
            setSelectedTaxIds([...selectedTaxIds, id]);
        }
    }

    async function handleSave() {
        setError(null);
        setFieldErrors({});

        const errors: Record<string, string> = {};
        if (!form.ticket_name.trim()) errors.ticket_name = "Ticket name is required";
        if (!form.sales_start_date) errors.sales_start_date = "Start date is required";
        if (!form.sales_end_date) errors.sales_end_date = "End date is required";
        if (form.early_bird_enabled) {
            if (!form.early_bird_discount_value) errors.early_bird_discount_value = "Early bird discount value is required";
            if (!form.early_bird_start) errors.early_bird_start = "Early bird start date is required";
            if (!form.early_bird_end) errors.early_bird_end = "Early bird end date is required";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...form,
                early_bird_start: form.early_bird_start ? `${form.early_bird_start} 00:00:00` : null,
                early_bird_end: form.early_bird_end ? `${form.early_bird_end} 23:59:59` : null,
                taxIds: selectedTaxIds,
            };

            if (ticket) {
                await updateTicket(ticket.id, payload);
            } else {
                await createTicket(eventId, payload);
            }
            onSaved();
            onClose();
        } catch (err: any) {
            console.error("Error saving ticket:", err);
            if (err.response?.data?.errors) {
                const apiErrors: Record<string, string> = {};
                Object.entries(err.response.data.errors).forEach(([field, messages]) => {
                    apiErrors[field] = (messages as string[]).join(", ");
                });
                setFieldErrors(apiErrors);
            } else {
                setError(err.response?.data?.message || "An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[480px] md:w-[650px] z-50 transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"
                    } flex flex-col bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl rounded-l-2xl`}
            >
                {/* Header */}
                <div className="p-4 flex justify-between items-center sticky top-0 border-b border-gray-200 bg-gray-800 text-white z-10">
                    <h2 className="text-xl font-semibold">{ticket ? "Edit Ticket" : "Create Ticket"}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Ticket Info */}
                    <Section title="Ticket Info" icon={<Tag className="w-4 h-4 text-blue-500" />}>
                        <InputField label="Ticket Name" value={form.ticket_name} onChange={(e) => setForm({ ...form, ticket_name: e.target.value })} error={fieldErrors.ticket_name} />
                        <div className="grid grid-cols-2 gap-3">
                            <InputField label="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
                            <InputField label="Quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} />
                        </div>
                        <textarea
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            placeholder="Description..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </Section>

                    {/* Discount Section */}
                    <Section title="Discount" icon={<Gift className="w-4 h-4 text-pink-500" />}>
                        <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v as any })}>
                            <SelectTrigger><SelectValue placeholder="Select Discount Type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fixed">Fixed</SelectItem>
                                <SelectItem value="percentage">Percentage</SelectItem>
                            </SelectContent>
                        </Select>
                        {form.discount_type && (
                            <InputField label="Discount Value" type="number" value={form.discount_value || ""} onChange={(e) => setForm({ ...form, discount_value: +e.target.value })} />
                        )}
                    </Section>

                    {/* Sales Period */}
                    <Section title="Sales Period" icon={<Calendar className="w-4 h-4 text-green-600" />}>
                        <div className="grid grid-cols-2 gap-3">
                            <InputField label="Start Date" type="date" value={form.sales_start_date} onChange={(e) => setForm({ ...form, sales_start_date: e.target.value })} />
                            <InputField label="Start Time" type="time" value={form.sales_start_time} onChange={(e) => setForm({ ...form, sales_start_time: e.target.value })} />
                            <InputField label="End Date" type="date" value={form.sales_end_date} onChange={(e) => setForm({ ...form, sales_end_date: e.target.value })} />
                            <InputField label="End Time" type="time" value={form.sales_end_time} onChange={(e) => setForm({ ...form, sales_end_time: e.target.value })} />
                        </div>
                    </Section>

                    {/* Early Bird */}
                    <Section title="Early Bird">
                        <div className="flex items-center gap-3">
                            <Switch checked={form.early_bird_enabled} onCheckedChange={(val) => setForm({ ...form, early_bird_enabled: val })} />
                            <span className="text-sm font-medium">Enable Early Bird</span>
                        </div>
                        {form.early_bird_enabled && (
                            <div className="grid grid-cols-2 gap-3">
                                <InputField label="Early Bird Value" type="number" value={form.early_bird_discount_value} onChange={(e) => setForm({ ...form, early_bird_discount_value: e.target.value })} error={fieldErrors.early_bird_discount_value} />
                                <InputField
                                    label="Early Bird Start"
                                    type="date"
                                    value={form.early_bird_start}
                                    onChange={(e) => setForm({ ...form, early_bird_start: e.target.value })}
                                    error={fieldErrors.early_bird_start}
                                />

                                <InputField
                                    label="Early Bird End"
                                    type="date"
                                    value={form.early_bird_end}
                                    onChange={(e) => setForm({ ...form, early_bird_end: e.target.value })}
                                    error={fieldErrors.early_bird_end}
                                />
                            </div>
                        )}
                    </Section>

                    {/* Taxes */}
                    <Section title="Taxes" icon={<DollarSign className="w-4 h-4 text-green-600" />}>
                        {taxes.length === 0 && <p className="text-sm text-gray-500">No taxes available</p>}
                        {taxes.map((tax) => (
                            <div key={tax.id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedTaxIds.includes(tax.id)}
                                    onChange={() => toggleTax(tax.id)}
                                />
                                <span className="text-sm">{tax.name} ( {tax.type === "percentage" ? `${tax.value}%` : `${ticket.event.currency_symbol} ${tax.value}`} {tax.mode} )</span>
                            </div>
                        ))}
                    </Section>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                        {loading ? "Saving..." : ticket ? "Update" : "Create"}
                    </Button>
                </div>
            </div>
        </>
    );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode; }) {
    return (
        <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="flex items-center gap-2 font-medium text-gray-700">{icon}{title}</h3>
            {children}
        </div>
    );
}

function InputField({ label, error, ...props }: any) {
    return (
        <div className="flex flex-col gap-1">
            <Label className="text-sm font-medium">{label}</Label>
            <Input {...props} />
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}
