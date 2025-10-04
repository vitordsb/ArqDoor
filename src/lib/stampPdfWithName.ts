
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
export async function stampPdfWithName(
  pdfBytes: ArrayBuffer | Uint8Array,
  signerName: string,
  opts?: {
    role?: "cliente" | "prestador"
    when?: Date
    page?: "last" | "first"
    x?: number
    y?: number
  }
): Promise<Blob> {
  const when = opts?.when ?? new Date()
  const role = opts?.role ?? "cliente"
  const pagePref = opts?.page ?? "last"

  const pdfDoc = await PDFDocument.load(pdfBytes)
  const pages = pdfDoc.getPages()
  const page = pagePref === "first" ? pages[0] : pages[pages.length - 1]

  const { width } = page.getSize()
  const margin = 36
  const rectW = 360
  const rectH = 48
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

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const text1 = `Assinado por ${signerName} (${role})`
  const text2 = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(when)

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

  const signedBytes = await pdfDoc.save()
  return new Blob([signedBytes], { type: "application/pdf" })
}

