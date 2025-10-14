"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";

/**
 * Generate PDF from a single ticket element and return as Blob
 */
export async function generateTicketPDFBlob(
  element: HTMLElement
): Promise<Blob | null> {
  if (!element) return null;

  const canvas = await html2canvas(element, {
    scale: 2, // reduce size
    useCORS: true,
    backgroundColor: "#ffffff",
    windowWidth: 1440, // Force desktop width
    scrollX: -window.scrollX, // Prevent scroll misalignment
    scrollY: -window.scrollY,
    logging: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdfWidth = canvas.width * 0.75;
  const pdfHeight = canvas.height * 0.75;

  const pdf = new jsPDF({
    orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
    unit: "px",
    format: [pdfWidth, pdfHeight],
  });

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  const pdfBlob = pdf.output("blob");
  return pdfBlob;
}

/**
 * Download single ticket PDF
 */
export async function downloadTicketPDF(
  element: HTMLElement,
  filename: string
) {
  const blob = await generateTicketPDFBlob(element);
  if (blob) saveAs(blob, `${filename}.pdf`);
}

/**
 * Download all tickets as a single ZIP
 */
export async function downloadAllTicketsAsZip(ids: string[]) {
  const zip = new JSZip();

  for (const id of ids) {
    const element = document.getElementById(id);
    if (!element) continue;

    const blob = await generateTicketPDFBlob(element);
    if (blob) {
      const isAddon = id.startsWith("addon-");
      const fileLabel = isAddon ? `AddOn_${id}.pdf` : `Ticket_${id}.pdf`;
      zip.file(fileLabel, blob);
    }
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, "tickets.zip");
}
