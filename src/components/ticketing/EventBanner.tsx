"use client";

import { Calendar, X } from "lucide-react";
import { useBanner } from "../../contexts/BannerContext";
import { formatDateRange } from "../../lib/utils";

export const EventBanner = ({ selectedEvent }: { selectedEvent: any; }) => {
  const { isBannerOpen, closeBanner } = useBanner();
  const bannerId = `event-${selectedEvent?.id}`;

  if (!isBannerOpen(bannerId)) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl p-2 md:p-4 shadow-xl flex gap-4 items-center mb-6 lg:mb-0 relative">
      <button
        onClick={() => closeBanner(bannerId)}
        aria-label="Close banner"
        className="absolute top-3 right-3 flex items-center justify-center rounded-full p-2 
             bg-black/40 backdrop-blur-md border border-white/20 
             text-white/80 hover:text-white hover:bg-black/50 transition"
      >
        <X size={18} strokeWidth={3} />
      </button>


      {selectedEvent?.logo ? (
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_API}${selectedEvent?.logo}`}
          alt={selectedEvent?.name}
          className="w-12 h-12 md:w-24 md:h-24 rounded"
        />
      ) : (
        <Calendar size={32} className="text-white mr-4" />
      )}

      <div>
        <h1 className="text-xl md:text-2xl font-bold mb-3 tracking-tight">
          {selectedEvent?.name || "Event"}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-indigo-100 text-xs md:text-sm">
          <span className="truncate">{selectedEvent?.location}</span>
          <span>•</span>
          <span>
            {formatDateRange(
              selectedEvent?.start_date,
              selectedEvent?.end_date
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
