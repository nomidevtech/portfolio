"use client";

import { useState } from "react";
import { generateTicketPdf } from "@/app/lib/generateTicketPdf";

export default function DownloadTicketButton({ bookingPubId }) {
    const [loading, setLoading] = useState(false);

    async function handleDownload() {
        try {
            setLoading(true);

            const pdfBytes = await generateTicketPdf(bookingPubId);

            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `ticket-${bookingPubId}.pdf`;
            link.click();

            URL.revokeObjectURL(url);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button onClick={handleDownload} disabled={loading}>
            {loading ? "Generating..." : "Download Ticket"}
        </button>
    );
}