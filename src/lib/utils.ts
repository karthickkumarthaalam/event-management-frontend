import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateRange = (startDate: string, endDate?: string) => {
  const start = new Date(startDate).toLocaleDateString("en-EN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (endDate && endDate !== startDate) {
    const end = new Date(endDate).toLocaleDateString("en-EN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${start} - ${end}`;
  }
  return start;
};

export const formatDateTime = (dateStr: string, timeStr?: string) => {
  if (!dateStr) return "-";

  // Combine date and time
  const dateTime = timeStr
    ? new Date(`${dateStr}T${timeStr}`)
    : new Date(dateStr);

  return dateTime.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
