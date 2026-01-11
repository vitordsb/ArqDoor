
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
    ticketId?: number | string
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

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const text1 = `Assinado por ${signerName} (${role})`
  const text2 = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(when)
  const ticketLabel =
    opts?.ticketId !== undefined && opts?.ticketId !== null
      ? `Ticket #${opts.ticketId}`
      : null
  const watermark =
    opts?.watermarkText ??
    [
      `Assinado eletronicamente por ${signerName}`,
      `em ${text2}`,
      ticketLabel,
    ]
      .filter((value): value is string => Boolean(value))
      .join(" - ")
  const watermarkOpacity = Math.min(
    0.6,
    Math.max(0.05, opts?.watermarkOpacity ?? 0.12)
  )
  const signatureLines = [
    {
      text: text1,
      font: fontBold,
      size: 12,
      color: rgb(0.2, 0.2, 0.2),
    },
    {
      text: `em ${text2}`,
      font,
      size: 11,
      color: rgb(0.25, 0.25, 0.25),
    },
  ]
  if (ticketLabel) {
    signatureLines.push({
      text: ticketLabel,
      font,
      size: 10,
      color: rgb(0.35, 0.35, 0.35),
    })
  }
  const lineGap = 4
  const blockPadding = 8
  const blockHeight =
    signatureLines.reduce((sum, line) => sum + line.size, 0) +
    Math.max(signatureLines.length - 1, 0) * lineGap
  const rectH = Math.max(48, blockHeight + blockPadding * 2)

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

    let cursorY = posY + rectH - blockPadding
    for (const line of signatureLines) {
      cursorY -= line.size
      page.drawText(line.text, {
        x: posX + 12,
        y: cursorY,
        size: line.size,
        font: line.font,
        color: line.color,
      })
      cursorY -= lineGap
    }

    let watermarkSize = Math.min(46, Math.max(20, width / 18))
    const maxWatermarkWidth = width * 0.9
    const textWidth = fontBold.widthOfTextAtSize(watermark, watermarkSize)
    if (textWidth > maxWatermarkWidth) {
      watermarkSize = Math.max(
        16,
        (maxWatermarkWidth / textWidth) * watermarkSize
      )
    }
    const finalWatermarkWidth = fontBold.widthOfTextAtSize(
      watermark,
      watermarkSize
    )

    page.drawText(watermark, {
      x: (width - finalWatermarkWidth) / 2,
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
