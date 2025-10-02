import { createContext, useContext, useEffect, useState } from "react";

type TicketingContextType = {
    selectedEvent: any | null;
    setSelectedEvent: (event: any | null) => void;
};

const TicketingContext = createContext<TicketingContextType | undefined>(undefined);


export function TicketingProvider({ children }: { children: React.ReactNode; }) {
    const [selectedEvent, setSelectedEventState] = useState<any | null>(null);


    useEffect(() => {
        const savedEvent = localStorage.getItem("selected_event");
        if (savedEvent) {
            setSelectedEventState(JSON.parse(savedEvent));
        }
    }, []);

    const setSelectedEvent = (event: any | null) => {
        setSelectedEventState(event);
        if (event) {
            localStorage.setItem("selected_event", JSON.stringify(event));
        } else {
            localStorage.removeItem("selected_event");
        }
    };

    return (
        <TicketingContext.Provider value={{ selectedEvent, setSelectedEvent }} >
            {children}
        </TicketingContext.Provider>
    );
};

export function useTicketing() {
    const context = useContext(TicketingContext);
    if (!context) {
        throw new Error("useTicketing must be used within a TicketingProvider");
    }

    return context;
}