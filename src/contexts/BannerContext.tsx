"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type BannerContextType = {
    closedBanners: string[];
    closeBanner: (id: string) => void;
    isBannerOpen: (id: string) => boolean;
};

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export function BannerProvider({ children }: { children: React.ReactNode; }) {
    const [closedBanners, setClosedBanners] = useState<string[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("closed_banners");
        if (stored) {
            setClosedBanners(JSON.parse(stored));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("closed_banners", JSON.stringify(closedBanners));
    }, [closedBanners]);

    const closeBanner = (id: string) => {
        setClosedBanners((prev) => [...new Set([...prev, id])]);
    };

    const isBannerOpen = (id: string) => {
        return !closedBanners.includes(id);
    };

    return (
        <BannerContext.Provider value={{ closedBanners, closeBanner, isBannerOpen }}>
            {children}
        </BannerContext.Provider>
    );
}

export function useBanner() {
    const context = useContext(BannerContext);
    if (!context) throw new Error("useBanner must be used within BannerProvider");
    return context;
}