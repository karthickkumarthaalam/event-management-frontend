import { useEffect, useState } from "react";
import { fetchEvents } from "@/lib/events";
import { useTicketing } from "@/contexts/TicketingContextT";

export default function Dashboard() {
    const { selectedEvent } = useTicketing();
    return (
        <div>
            <h1 className="text-2xl font-bold">
                Ticketing for {selectedEvent.name}
            </h1>

        </div>
    );
}
