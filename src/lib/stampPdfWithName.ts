
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib"
export async function stampPdfWithName(
  pdfBytes: ArrayBuffer | Uint8Array,
  signerName: string,
  opts?: {
    role?: "cliente" | "prestador"
    when?: Date
    page?: "last" | "first" | "all"
    x?: number
    y?: number
    watermarkText?: string
    watermarkOpacity?: number
  }
): Promise<Blob> {
  const when = opts?.when ?? new Date()
  const role = opts?.role ?? "cliente"
  const pagePref = opts?.page ?? "last"

  const pdfDoc = await PDFDocument.load(pdfBytes)
  const pages = pdfDoc.getPages()
  if (pages.length === 0) {
    const bytes =
      pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes)
    return new Blob([bytes], { type: "application/pdf" })
  }
  const targetPages =
    pagePref === "all"
      ? pages
      : [pagePref === "first" ? pages[0] : pages[pages.length - 1]]

  const margin = 36
  const rectW = 360
  const rectH = 48

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const text1 = `Assinado por ${signerName} (${role})`
  const text2 = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(when)
  const watermark = opts?.watermarkText ?? `Assinado eletronicamente por ${signerName}`
  const watermarkOpacity = Math.min(
    0.6,
    Math.max(0.05, opts?.watermarkOpacity ?? 0.12)
  )

  for (const page of targetPages) {
    const { width, height } = page.getSize()
    const posX = opts?.x ?? (width - rectW - margin)
    const posY = opts?.y ?? margin

    page.drawRectangle({
      x: posX,
      y: posY,
      width: rectW,
      height: rectH,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.85, 0.85, 0.85),
      borderWidth: 1,
      opacity: 0.95,
    })

    page.drawText(text1, {
      x: posX + 12,
      y: posY + rectH - 18 - 12,
      size: 12,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    })
    page.drawText(`em ${text2}`, {
      x: posX + 12,
      y: posY + 10,
      size: 11,
      font,
      color: rgb(0.25, 0.25, 0.25),
    })

    const watermarkSize = Math.min(48, Math.max(32, width / 18))
    const textWidth = fontBold.widthOfTextAtSize(watermark, watermarkSize)

    page.drawText(watermark, {
      x: (width - textWidth) / 2,
      y: height / 2,
      size: watermarkSize,
      font: fontBold,
      color: rgb(0.4, 0.4, 0.4),
      opacity: watermarkOpacity,
      rotate: degrees(-35),
    })
  }

  const signedBytes = await pdfDoc.save()
  return new Blob([signedBytes], { type: "application/pdf" })
}
