import { useCallback, useState } from "react";

type PdfResult = {
  blob: Blob;
  blobUrl: string;
  filename?: string;
};

type UsePdfViewerParams = {
  fetchPdf: (ticketId: number) => Promise<PdfResult | null>;
};

export const usePdfViewer = ({ fetchPdf }: UsePdfViewerParams) => {
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [pdfFilename, setPdfFilename] = useState<string>("");
  const [selectedTicketForPdf, setSelectedTicketForPdf] = useState<number | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string>("");
  const [fullscreenPdf, setFullscreenPdf] = useState(false);

  const handleViewPdf = useCallback(
    async (ticketOrId: number | { id: number }) => {
      try {
        setLoadingPdf(true);
        setPdfError("");
        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl);
          setPdfUrl("");
        }
        const ticketId = typeof ticketOrId === "number" ? ticketOrId : ticketOrId?.id;
        if (!ticketId) throw new Error("Ticket inválido.");
        setSelectedTicketForPdf(ticketId);
        const res = await fetchPdf(ticketId);
        if (!res) throw new Error("PDF não encontrado para este ticket.");
        const { blob, blobUrl, filename } = res;
        setPdfBlob(blob);
        setPdfUrl(blobUrl);
        setPdfFilename(filename || `contrato-ticket-${ticketId}.pdf`);
        setShowPdfViewer(true);
        setFullscreenPdf(true);
      } catch (e: any) {
        setPdfError(e?.message || "Falha ao carregar o PDF.");
        setShowPdfViewer(true);
      } finally {
        setLoadingPdf(false);
      }
    },
    [fetchPdf, pdfUrl]
  );

  const closePdfViewer = useCallback(() => {
    setShowPdfViewer(false);
    setFullscreenPdf(false);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl("");
    setPdfBlob(null);
    setPdfFilename("");
    setSelectedTicketForPdf(null);
    setPdfError("");
  }, [pdfUrl]);

  const downloadPdf = useCallback(() => {
    if (!pdfBlob || !selectedTicketForPdf) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = pdfFilename || `contrato-ticket-${selectedTicketForPdf}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [pdfBlob, pdfFilename, selectedTicketForPdf]);

  return {
    showPdfViewer,
    setShowPdfViewer,
    pdfBlob,
    pdfUrl,
    pdfFilename,
    selectedTicketForPdf,
    loadingPdf,
    pdfError,
    fullscreenPdf,
    setFullscreenPdf,
    handleViewPdf,
    closePdfViewer,
    downloadPdf,
  };
};
