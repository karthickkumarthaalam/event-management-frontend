"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { DollarSign, Ticket, Layers } from "lucide-react";
import { createTax, updateTax } from "@/lib/ticketing";// <-- implement API calls similar to ticketing

interface TaxModalProps {
    open: boolean;
    onClose: () => void;
    tax: any | null;
    eventId: string;
    onSaved: () => void;
}

export default function TaxModal({ open, onClose, tax, eventId, onSaved }: TaxModalProps) {
    const [form, setForm] = useState({
        name: "",
        mode: undefined as "inclusive" | "exclusive" | undefined,
        type: undefined as "percentage" | "fixed" | undefined,
        value: undefined as number | undefined,
        applicable_on: "ticket" as "ticket" | "addon" | "both",
        status: true,
    });

    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (tax) {
            setForm({
                name: tax.name,
                mode: tax.mode,
                type: tax.type,
                value: tax.value,
                applicable_on: tax.applicable_on || "ticket",
                status: tax.status ?? true,
            });
        } else {
            setForm({
                name: "",
                mode: undefined,
                type: undefined,
                value: undefined,
                applicable_on: "ticket",
                status: true,
            });
        }
        setError(null);
        setFieldErrors({});
    }, [tax, open]);

    async function handleSave() {
        setError(null);
        setFieldErrors({});

        const errors: Record<string, string> = {};
        if (!form.name.trim()) errors.name = "Name is required";
        if (!form.mode) errors.mode = "Mode is required";
        if (!form.type) errors.type = "Type is required";
        if (form.value === undefined || form.value < 0) errors.value = "Value must be greater than or equal to 0";

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...form,
                event_id: eventId,
            };
            if (tax) {
                await updateTax(tax.id, payload);
            } else {
                await createTax(payload);
            }

            onSaved();
            onClose();
        } catch (err: any) {
            console.error("Error saving tax:", err);
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
                className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[480px] md:w-[630px] z-50 transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"
                    } flex flex-col bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl rounded-l-2xl`}
            >
                {/* Header */}
                <div className="p-4 flex justify-between items-center sticky top-0 border-b border-gray-200 bg-gray-800 text-white z-10">
                    <h2 className="text-xl font-semibold">{tax ? "Edit Tax" : "Create Tax"}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        ✕
                    </Button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Tax Details */}
                    <Section title="Tax Details" icon={<DollarSign className="w-4 h-4 text-green-600" />}>
                        <InputField
                            label="Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            error={fieldErrors.name}
                        />

                        <div className="flex flex-col gap-2 ">
                            <Label className="">Tax Mode</Label>
                            <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v as "inclusive" | "exclusive" })} >
                                <SelectTrigger>
                                    <SelectValue placeholder="select Tax Mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="inclusive">Inclusive</SelectItem>
                                    <SelectItem value="exclusive">Exclusive</SelectItem>
                                </SelectContent>
                            </Select>
                            {fieldErrors.mode && <p className="text-red-500 text-xs">{fieldErrors.mode}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Tax Type</Label>
                            <Select
                                value={form.type}
                                onValueChange={(v) => setForm({ ...form, type: v as "percentage" | "fixed" })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Tax Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fixed">Fixed</SelectItem>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                </SelectContent>
                            </Select>
                            {fieldErrors.type && <p className="text-red-500 text-xs">{fieldErrors.type}</p>}
                        </div>

                        <InputField
                            label="Value"
                            type="number"
                            value={form.value ?? ""}
                            onChange={(e) => setForm({ ...form, value: +e.target.value })}
                            error={fieldErrors.value}
                        />
                    </Section>

                    {/* Applicable On */}
                    <Section title="Applicable On" icon={<Ticket className="w-4 h-4 text-blue-500" />}>
                        <Select
                            value={form.applicable_on}
                            onValueChange={(v) => setForm({ ...form, applicable_on: v as any })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Applicable On" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ticket">Ticket</SelectItem>
                                <SelectItem value="addon">Addon</SelectItem>
                                <SelectItem value="both">Both</SelectItem>
                            </SelectContent>
                        </Select>
                    </Section>

                    {/* Status */}
                    <Section title="Status" icon={<Layers className="w-4 h-4 text-purple-500" />}>
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={form.status}
                                onCheckedChange={(val) => setForm({ ...form, status: val })}
                            />
                            <span className="text-sm font-medium">
                                {form.status ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </Section>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-gradient-to-r from-[hsl(var(--primary))] to-blue-500 text-white"
                    >
                        {loading ? "Saving..." : tax ? "Update" : "Create"}
                    </Button>
                </div>
            </div>
        </>
    );
}

function Section({
    title,
    icon,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="flex items-center gap-2 font-medium text-gray-700">
                {icon}
                {title}
            </h3>
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
