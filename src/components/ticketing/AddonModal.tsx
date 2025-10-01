"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createAddon, updateAddon } from "@/lib/ticketing"; // implement API calls

interface AddonModalProps {
    open: boolean;
    onClose: () => void;
    addon: any | null;
    eventId: string;
    onSaved: () => void;
}

export default function AddonModal({ open, onClose, addon, eventId, onSaved }: AddonModalProps) {
    const [form, setForm] = useState({
        addon_name: "",
        addon_type: undefined as "fixed" | "percentage" | undefined,
        addon_value: undefined as number | undefined,
    });

    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (addon) {
            setForm({
                addon_name: addon.addon_name,
                addon_type: addon.addon_type,
                addon_value: addon.addon_value,
            });
        } else {
            setForm({
                addon_name: "",
                addon_type: undefined,
                addon_value: undefined,
            });
        }
        setError(null);
        setFieldErrors({});
    }, [addon, open]);

    async function handleSave() {
        setError(null);
        setFieldErrors({});

        const errors: Record<string, string> = {};
        if (!form.addon_name.trim()) errors.addon_name = "Name is required";
        if (!form.addon_type) errors.addon_type = "Type is required";
        if (form.addon_value === undefined || form.addon_value < 0)
            errors.addon_value = "Value must be greater than or equal to 0";

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setLoading(true);
        try {
            if (addon) {
                await updateAddon(addon.id, form);
            } else {
                await createAddon(eventId, form);
            }
            onSaved();
            onClose();
        } catch (err: any) {
            console.error("Error saving addon:", err);
            setError(err.response?.data?.message || "An unexpected error occurred");
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
                className={`fixed top-0 right-0 h-full w-full sm:w-[480px] md:w-[650px] z-50 transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"
                    } flex flex-col bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl rounded-l-2xl`}
            >
                {/* Header */}
                <div className="p-4 flex justify-between items-center border-b sticky top-0  border-gray-200 bg-gray-800 text-white z-10">
                    <h2 className="text-lg font-semibold">{addon ? "Edit Addon" : "Create Addon"}</h2>
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





                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm ">
                        {/* Addon Name */}
                        <div className="flex flex-col gap-2">
                            <Label>Addon Name</Label>
                            <Input
                                value={form.addon_name}
                                onChange={(e) => setForm({ ...form, addon_name: e.target.value })}
                                placeholder="Enter addon name"
                            />
                            {fieldErrors.addon_name && <p className="text-red-500 text-xs">{fieldErrors.addon_name}</p>}
                        </div>

                        {/* Addon Value */}
                        <div className="flex flex-col gap-2">
                            <Label>Addon Value</Label>
                            <Input
                                type="number"
                                value={form.addon_value ?? ""}
                                onChange={(e) => setForm({ ...form, addon_value: +e.target.value })}
                                placeholder="Enter addon value"
                            />
                            {fieldErrors.addon_value && <p className="text-red-500 text-xs">{fieldErrors.addon_value}</p>}
                        </div>

                        {/* Addon Type */}
                        <div className="flex flex-col gap-2">
                            <Label>Addon Type</Label>
                            <Select
                                value={form.addon_type}
                                onValueChange={(v) => setForm({ ...form, addon_type: v as "fixed" | "percentage" })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fixed">Fixed</SelectItem>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                </SelectContent>
                            </Select>
                            {fieldErrors.addon_type && <p className="text-red-500 text-xs">{fieldErrors.addon_type}</p>}
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-[hsl(var(--primary))] to-blue-500 text-white">
                        {loading ? "Saving..." : addon ? "Update" : "Create"}
                    </Button>
                </div>
            </div>
        </>
    );
}
