import "@/lib/pdf-worker";
import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Loader2,
  AlertTriangle,
  Maximize2,
  Download,
  ZoomIn,
  ZoomOut,
  Minimize2,
  StretchHorizontal,
  Percent,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pdfUrl?: string;
  pdfBlob?: Blob | null;
  pdfFilename?: string;
  loading: boolean;
  error?: string;
  onReload: () => void;
  onOpenNew: () => void;
  onDownload: () => void;
  fullscreen: boolean;
  setFullscreen: (v: boolean) => void;
};

export function PdfViewerDialog({
  open,
  onOpenChange,
  pdfUrl,
  pdfBlob,
  pdfFilename,
  loading,
  error,
  onReload,
  onOpenNew,
  onDownload,
  fullscreen,
  setFullscreen,
}: Props) {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);

  // ---- Zoom / Fit ----
  const [scale, setScale] = useState(1); // para o modo 100%
  const [fitToWidth, setFitToWidth] = useState(true);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const widthRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  // observa a largura disponível no container para "fit to width"
  useEffect(() => {
    if (!widthRef.current) return;
    const el = widthRef.current;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      // padding interno leve para não colar no scrollbar
      setContainerWidth(Math.max(0, w - 8));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // volta página pro intervalo válido
  const onLoad = ({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    setPage((p) => Math.min(Math.max(1, p), n || 1));
  };

  const next = () => setPage((p) => Math.min(p + 1, numPages || p));
  const prev = () => setPage((p) => Math.max(p - 1, 1));
  const zoomIn = () => setScale((s) => Math.min(s + 0.1, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.1, 0.5));

  // `react-pdf` aceita Blob, URL, ArrayBuffer – priorize Blob
  const file = useMemo(() => pdfBlob || pdfUrl || null, [pdfBlob, pdfUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={[
          fullscreen
            ? "max-w-[95vw] w-[95vw] h-[95vh]"
            : "w-full max-w-4xl h-[85vh] sm:h-[80vh]",
          "p-0 flex flex-col",
        ].join(" ")}
      >
        {/* Header fixo (sticky) com controles */}
        <DialogHeader className="sticky top-0 z-10 bg-white border-b p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <DialogTitle className="flex items-center gap-2 truncate">
                <FileText className="h-5 w-5 shrink-0" />
                <span className="truncate">{pdfFilename ?? "Contrato"}</span>
              </DialogTitle>
              <DialogDescription id="pdf-desc" className="sr-only">
                Visualizador de PDF do contrato.
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Navegação */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prev}
                  disabled={page <= 1}
                  title="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm min-w-[70px] text-center">
                  {page}/{numPages || "-"}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={next}
                  disabled={!numPages || page >= numPages}
                  title="Próxima página"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="w-px h-6 bg-gray-200" />

              {/* Zoom / Fit */}
              <div className="flex items-center gap-1">
                <Button
                  variant={fitToWidth ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFitToWidth(true)}
                  title="Ajustar à largura"
                >
                  <StretchHorizontal className="h-4 w-4 mr-1" />
                  Largura
                </Button>
                <Button
                  variant={!fitToWidth ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFitToWidth(false)}
                  title="Zoom 100%"
                >
                  <Percent className="h-4 w-4 mr-1" />
                  100%
                </Button>

                {!fitToWidth && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={zoomOut}
                      title="Diminuir zoom"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm w-12 text-center">
                      {Math.round(scale * 100)}%
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={zoomIn}
                      title="Aumentar zoom"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              <div className="w-px h-6 bg-gray-200" />

              {/* Ações */}
              <Button
                variant="outline"
                size="sm"
                onClick={onReload}
                disabled={loading}
                title="Recarregar PDF"
              >
                <Loader2 className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Recarregar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenNew}
                disabled={!file}
                title="Abrir em nova aba"
              >
                <Download className="h-4 w-4 mr-2" />
                Nova aba
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
                disabled={!pdfBlob}
                title="Baixar PDF"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFullscreen(!fullscreen)}
                title={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
              >
                {fullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Área rolável do PDF */}
        <div ref={scrollRef} className="flex-1 overflow-auto bg-gray-50">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Carregando PDF...</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-lg">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium">Erro ao carregar PDF</p>
                <p className="text-gray-600 mt-2 break-words">{error}</p>
              </div>
            </div>
          ) : file ? (
            <div ref={widthRef} className="mx-auto w-full max-w-[1100px] p-3 sm:p-4">
              <Document
                file={file}
                onLoadSuccess={onLoad}
                loading={<div className="py-10 text-gray-600 text-center">Preparando visualização…</div>}
                error={<div className="py-10 text-red-600 text-center">Não foi possível abrir o PDF.</div>}
              >
                {/* Ajusta ou por width (fit) ou por scale (100%) */}
                {fitToWidth ? (
                  <Page
                    pageNumber={page}
                    width={containerWidth ?? undefined}
                    renderTextLayer
                    renderAnnotationLayer
                  />
                ) : (
                  <Page
                    pageNumber={page}
                    scale={scale}
                    renderTextLayer
                    renderAnnotationLayer
                  />
                )}
              </Document>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-600">Nenhum PDF disponível</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

