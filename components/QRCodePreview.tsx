"use client"

import QRCode from "react-qr-code"

type QRCodePreviewProps = {
  slug: string
  filename?: string
}

const BASE_URL = "http://localhost:3000"

export default function QRCodePreview({ slug, filename = "property-qr-code" }: QRCodePreviewProps) {
  const safeSlug = String(slug || "").trim()
  const qrValue = `${BASE_URL}/b/${safeSlug}`

  const downloadQR = () => {
    const svg = document.getElementById(`qr-${safeSlug}`)
    if (!svg) return

    const svgString = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    canvas.width = 1000
    canvas.height = 1000

    img.onload = () => {
      if (!ctx) return

      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const link = document.createElement("a")
      link.download = `${filename}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    }

    img.src = `data:image/svg+xml;base64,${btoa(svgString)}`
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-3 rounded-lg">
        <QRCode id={`qr-${safeSlug}`} value={qrValue} size={140} />
      </div>

      <div className="text-[10px] text-slate-500 max-w-[160px] break-all text-center">
        {qrValue}
      </div>

      <button
        onClick={downloadQR}
        className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Download QR
      </button>
    </div>
  )
}