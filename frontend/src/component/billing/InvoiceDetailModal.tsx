import { X, Download, Printer, Package2 } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface Invoice {
  id: string; customer: string; phone: string; address: string
  date: string; amount: number; gst: number; status: string
  items: { name: string; qty: number; price: number; gstRate: number }[]
}

export { downloadPDF }

interface Props { invoice: Invoice; onClose: () => void }

function downloadPDF(invoice: Invoice) {
  const subtotal = invoice.items.reduce((s, i) => s + i.qty * i.price, 0)
  const gstAmt   = invoice.items.reduce((s, i) => s + i.qty * i.price * i.gstRate / 100, 0)
  const cgst = gstAmt / 2, sgst = gstAmt / 2
  const total = subtotal + gstAmt

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()

  // ── Header banner ──
  doc.setFillColor(114, 75, 104)
  doc.rect(0, 0, W, 36, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('INVENTRA', 14, 16)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Tax Invoice', 14, 23)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(invoice.id, W - 14, 16, { align: 'right' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(invoice.date, W - 14, 23, { align: 'right' })

  // ── Bill To / Invoice Info ──
  doc.setTextColor(31, 41, 51)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('BILL TO', 14, 46)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(invoice.customer, 14, 52)
  doc.setFontSize(9)
  doc.setTextColor(75, 85, 99)
  doc.text(invoice.phone, 14, 57)
  doc.text(invoice.address, 14, 62)

  doc.setTextColor(31, 41, 51)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE INFO', W - 70, 46)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const infoRows: [string, string][] = [
    ['Invoice No', invoice.id],
    ['Date', invoice.date],
    ['Status', invoice.status],
  ]
  infoRows.forEach(([k, v], idx) => {
    doc.setTextColor(75, 85, 99)
    doc.text(k, W - 70, 52 + idx * 6)
    doc.setTextColor(31, 41, 51)
    doc.setFont('helvetica', 'bold')
    doc.text(v, W - 14, 52 + idx * 6, { align: 'right' })
    doc.setFont('helvetica', 'normal')
  })

  // ── Items table ──
  autoTable(doc, {
    startY: 72,
    head: [['Item', 'Qty', 'Unit Price', 'GST %', 'Amount']],
    body: invoice.items.map(i => [
      i.name,
      i.qty.toString(),
      `Rs.${i.price.toLocaleString()}`,
      `${i.gstRate}%`,
      `Rs.${(i.qty * i.price).toLocaleString()}`,
    ]),
    headStyles: { fillColor: [114, 75, 104], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [31, 41, 51] },
    columnStyles: { 0: { cellWidth: 70 }, 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
    alternateRowStyles: { fillColor: [245, 246, 248] },
    margin: { left: 14, right: 14 },
  })

  // ── GST summary ──
  const afterTable = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
  const summaryX = W - 80

  const summaryRows: [string, string][] = [
    ['Subtotal',  `Rs.${subtotal.toLocaleString()}`],
    ['CGST',      `Rs.${cgst.toFixed(2)}`],
    ['SGST',      `Rs.${sgst.toFixed(2)}`],
  ]
  summaryRows.forEach(([k, v], idx) => {
    doc.setFontSize(9)
    doc.setTextColor(75, 85, 99)
    doc.setFont('helvetica', 'normal')
    doc.text(k, summaryX, afterTable + idx * 7)
    doc.text(v, W - 14, afterTable + idx * 7, { align: 'right' })
  })

  // Total row
  const totalY = afterTable + summaryRows.length * 7 + 3
  doc.setDrawColor(231, 233, 237)
  doc.line(summaryX, totalY - 2, W - 14, totalY - 2)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(114, 75, 104)
  doc.text('TOTAL', summaryX, totalY + 5)
  doc.text(`Rs.${total.toLocaleString()}`, W - 14, totalY + 5, { align: 'right' })

  // ── Footer ──
  const pageH = doc.internal.pageSize.getHeight()
  doc.setFillColor(245, 246, 248)
  doc.rect(0, pageH - 16, W, 16, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  doc.text('Thank you for your business! — Inventra Inventory & Billing System', W / 2, pageH - 6, { align: 'center' })

  doc.save(`${invoice.id}.pdf`)
}

export default function InvoiceDetailModal({ invoice, onClose }: Props) {
  const subtotal = invoice.items.reduce((s, i) => s + i.qty * i.price, 0)
  const gstAmt   = invoice.items.reduce((s, i) => s + i.qty * i.price * i.gstRate / 100, 0)
  const cgst = gstAmt / 2, sgst = gstAmt / 2
  const total = subtotal + gstAmt

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', animation: 'fadeInUp 0.3s ease both' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#724B68,#5A3A52)', borderRadius: '20px 20px 0 0', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package2 size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#fff', fontFamily: 'Poppins, Inter, sans-serif' }}>Inventra</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Tax Invoice</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#fff' }}>{invoice.id}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{invoice.date}</div>
          </div>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Customer info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#F5F6F8', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Bill To</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1F2933' }}>{invoice.customer}</div>
              <div style={{ fontSize: 13, color: '#4B5563', marginTop: 4 }}>{invoice.phone}</div>
              <div style={{ fontSize: 13, color: '#4B5563', marginTop: 2 }}>{invoice.address}</div>
            </div>
            <div style={{ background: '#F5F6F8', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Invoice Info</div>
              {[['Invoice No', invoice.id], ['Date', invoice.date], ['Status', invoice.status]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: '#4B5563' }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: v === 'Paid' ? '#059669' : v === 'Pending' ? '#ca8a04' : '#1F2933' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Items table */}
          <div style={{ border: '1px solid #E7E9ED', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F5F6F8' }}>
                  {['Item', 'Qty', 'Unit Price', 'GST%', 'Amount'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Item' ? 'left' : 'right', fontSize: 11, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #F5F6F8' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: '#1F2933' }}>{item.name}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', color: '#4B5563' }}>{item.qty}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', color: '#4B5563' }}>₹{((item.price ?? (item as any).unitPrice) ?? 0).toLocaleString()}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', color: '#4B5563' }}>{item.gstRate ?? (item as any).gstPercentage ?? 0}%</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 700, color: '#1F2933' }}>₹{(item.qty * ((item.price ?? (item as any).unitPrice) ?? 0)).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* GST breakdown + total */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Subtotal', `₹${subtotal.toLocaleString()}`],
                ['CGST', `₹${cgst.toFixed(2)}`],
                ['SGST', `₹${sgst.toFixed(2)}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4B5563' }}>
                  <span>{k}</span><span>{v}</span>
                </div>
              ))}
              <div style={{ borderTop: '2px solid #E7E9ED', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: '#1F2933' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 16, color: '#724B68' }}>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 14, fontWeight: 600, color: '#4B5563', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <X size={15} /> Close
            </button>
            <button style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 14, fontWeight: 600, color: '#1F2933', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => window.print()}>
              <Printer size={15} /> Print
            </button>
            <button style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#724B68', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(114,75,104,0.3)' }}
              onClick={() => downloadPDF(invoice)}>
              <Download size={15} /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
