"use client";

import { useState, useEffect } from "react";
import { createEvent, updateEvent } from "@/lib/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EventModalProps {
    open: boolean;
    onClose: () => void;
    event: any | null;
    onSaved: () => void;
}

interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

export default function EventModal({ open, onClose, event, onSaved }: EventModalProps) {
    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
        start_date: "",
        end_date: "",
        country: "",
        location: "",
        address: "",
        currency: "",
        currency_symbol: "",
        status: "planing",
    });
    const [logo, setLogo] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [removeLogo, setRemoveLogo] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (event) {
            setForm({
                name: event.name || "",
                slug: event.slug || "",
                description: event.description || "",
                start_date: event.start_date?.split("T")[0] || "",
                end_date: event.end_date?.split("T")[0] || "",
                country: event.country || "",
                location: event.location || "",
                address: event.address || "",
                currency: event.currency || "",
                currency_symbol: event.currency_symbol || "",
                status: event.status || "planing",
            });
            setPreview(`${process.env.NEXT_PUBLIC_BASE_API}${event.logo}` || null);
            setRemoveLogo(false);
        } else {
            setForm({
                name: "",
                slug: "",
                description: "",
                start_date: "",
                end_date: "",
                country: "",
                location: "",
                address: "",
                currency: "",
                currency_symbol: "",
                status: "planing",
            });
            setPreview(null);
            setRemoveLogo(false);
        }
        setLogo(null);
        setError(null);
        setFieldErrors({});
    }, [event, open]);

    function handleLogoChange(file: File | null) {
        setLogo(file);
        setPreview(file ? URL.createObjectURL(file) : null);
        setRemoveLogo(false);
    }

    function handleRemoveLogo() {
        setLogo(null);
        setPreview(null);
        setRemoveLogo(true);
    }

    async function handleSave() {
        setError(null);
        setFieldErrors({});

        // ✅ Manual validation before API call
        const errors: Record<string, string> = {};
        if (!form.name.trim()) errors.name = "Event name is required";
        if (!form.start_date) errors.start_date = "Start date is required";
        if (!form.location.trim()) errors.location = "Location is required";
        if (!form.country.trim()) errors.country = "Country is required";
        if (!form.currency.trim()) errors.currency = "Currency is required";


        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return; // ❌ Stop execution before calling API
        }

        setLoading(true);
        try {
            const formData = {
                ...form,
                end_date: form.end_date === "" ? null : form.end_date,
                logo: removeLogo ? null : undefined,
            };

            if (event) {
                await updateEvent(event.id, formData, logo || undefined);
            } else {
                await createEvent(formData, logo || undefined);
            }
            onSaved();
            onClose();
        } catch (err: any) {
            console.error("Error saving event:", err);
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
                className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[480px] md:w-[630px] z-50 transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"
                    } flex flex-col bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900`}
            >
                {/* Header */}
                <div className="p-4 flex justify-between items-center sticky top-0 border-b border-gray-200 bg-gray-800 z-10">
                    <h2 className="text-xl text-white font-semibold">{event ? "Edit Event" : "Create Event"}</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:bg-blue-50"
                        onClick={onClose}
                    >
                        ✕
                    </Button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                            <Label className="text-sm font-medium">Event Name</Label>
                            <Input
                                placeholder="Enter event name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                                className={`rounded-lg border-gray-300 ${fieldErrors.name ? 'border-red-500' : ''}`}
                            />
                            {fieldErrors.name && (
                                <p className="text-red-500 text-xs">{fieldErrors.name}</p>
                            )}

                            <Label className="text-sm font-medium mt-2">Slug</Label>
                            <Input
                                placeholder="Enter unique slug"
                                value={form.slug}
                                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                className={`rounded-lg border-gray-300 ${fieldErrors.slug ? 'border-red-500' : ''}`}
                            />
                            {fieldErrors.slug && (
                                <p className="text-red-500 text-xs">{fieldErrors.slug}</p>
                            )}

                            <Label className="text-sm font-medium mt-2">Description</Label>
                            <textarea
                                placeholder="Enter event description"
                                rows={4}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className={`w-full rounded-lg p-2 text-sm border border-gray-300 resize-none ${fieldErrors.description ? 'border-red-500' : ''}`}
                            />
                            {fieldErrors.description && (
                                <p className="text-red-500 text-xs">{fieldErrors.description}</p>
                            )}
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-gray-200">
                            <div>
                                <Label className="text-sm font-medium">Start Date</Label>
                                <Input
                                    type="date"
                                    value={form.start_date}
                                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                    required
                                    className={`rounded-lg border-gray-300 ${fieldErrors.start_date ? 'border-red-500' : ''}`}
                                />
                                {fieldErrors.start_date && (
                                    <p className="text-red-500 text-xs">{fieldErrors.start_date}</p>
                                )}
                            </div>
                            <div>
                                <Label className="text-sm font-medium">End Date</Label>
                                <Input
                                    type="date"
                                    value={form.end_date}
                                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                    className={`rounded-lg border-gray-300 ${fieldErrors.end_date ? 'border-red-500' : ''}`}
                                />
                                {fieldErrors.end_date && (
                                    <p className="text-red-500 text-xs">{fieldErrors.end_date}</p>
                                )}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">

                            <Label className="text-sm font-medium">Country</Label>
                            <Input
                                placeholder="Enter Country"
                                value={form.country}
                                onChange={(e) => setForm({ ...form, country: e.target.value })}
                                required
                                className={`rounded-lg border-gray-300 ${fieldErrors.country ? 'border-red-500' : ''}`}
                            />
                            {fieldErrors.country && (
                                <p className="text-red-500 text-xs">{fieldErrors.country}</p>
                            )}

                            <Label className="text-sm font-medium">City</Label>
                            <Input
                                placeholder="Enter City"
                                value={form.location}
                                onChange={(e) => setForm({ ...form, location: e.target.value })}
                                required
                                className={`rounded-lg border-gray-300 ${fieldErrors.location ? 'border-red-500' : ''}`}
                            />
                            {fieldErrors.location && (
                                <p className="text-red-500 text-xs">{fieldErrors.location}</p>
                            )}

                            <Label className="text-sm font-medium mt-2">Address</Label>
                            <Input
                                placeholder="Enter address"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                className={`rounded-lg border-gray-300 ${fieldErrors.address ? 'border-red-500' : ''}`}
                            />
                            {fieldErrors.address && (
                                <p className="text-red-500 text-xs">{fieldErrors.address}</p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium mt-2">Currency</Label>
                                    <Input
                                        placeholder="Enter Currency"
                                        value={form.currency}
                                        onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                        className={`rounded-lg border-gray-300 ${fieldErrors.currency ? 'border-red-500' : ''}`}
                                    />
                                    {fieldErrors.address && (
                                        <p className="text-red-500 text-xs">{fieldErrors.currency}</p>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-sm font-medium mt-2">Currency Symbol</Label>
                                    <Input
                                        placeholder="Enter Currency Symbol"
                                        value={form.currency_symbol}
                                        onChange={(e) => setForm({ ...form, currency_symbol: e.target.value })}
                                        className={`rounded-lg border-gray-300 ${fieldErrors.currency_symbol ? 'border-red-500' : ''}`}
                                    />
                                    {fieldErrors.address && (
                                        <p className="text-red-500 text-xs">{fieldErrors.currency_symbol}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Status & Logo */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                            <Label className="text-sm font-medium">Status</Label>
                            <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                                <SelectTrigger className={`rounded-lg border-gray-300 ${fieldErrors.status ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="planing">Planing</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="ongoing">Ongoing</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            {fieldErrors.status && (
                                <p className="text-red-500 text-xs">{fieldErrors.status}</p>
                            )}

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-sm font-medium">Logo</Label>
                                    {preview && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleRemoveLogo}
                                            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    )}
                                </div>
                                <Input
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        handleLogoChange(file);
                                    }}
                                    className={`rounded-lg border-gray-300 ${fieldErrors.logo ? 'border-red-500' : ''}`}
                                />
                                {fieldErrors.logo && (
                                    <p className="text-red-500 text-xs">{fieldErrors.logo}</p>
                                )}
                            </div>

                            {preview && (
                                <div className="mt-2 py-4 w-full flex justify-center h-48 border border-gray-200 rounded-lg overflow-hidden">
                                    <img src={preview} alt="Logo preview" className="w-auto h-auto object-cover" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-gradient-to-r from-[hsl(var(--primary))] to-blue-500 text-white"
                    >
                        {loading ? "Saving..." : event ? "Update" : "Create"}
                    </Button>
                </div>
            </div>
        </>
    );
}