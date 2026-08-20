"use client";

import React, { useState, useEffect } from "react";
import { Invoice, InvoiceLineItem, PaymentMethod, QueueToken, Booking } from "@/lib/types";
import { CLINIC_INFO, CLINIC_SERVICES, LEAD_DOCTOR } from "@/lib/constants";
import {
  Receipt,
  Plus,
  Trash2,
  Printer,
  QrCode,
  CheckCircle2,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
} from "lucide-react";

interface BillingPOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: QueueToken | null;
  booking?: Booking | null;
  onSaved?: (invoice: Invoice) => void;
}

const COMMON_BILLING_ITEMS = [
  { desc: "Specialist Dental Consultation & Digital RVG", cat: "Diagnostic", price: 500 },
  { desc: "Single-Visit Rotary Root Canal Treatment (RCT)", cat: "Endodontics", price: 4500 },
  { desc: "Re-RCT / Endodontic Retreatment", cat: "Endodontics", price: 5500 },
  { desc: "CAD/CAM Multi-Layered Zirconia Crown (15-Yr Warranty)", cat: "Prosthodontics", price: 6500 },
  { desc: "Full Mouth Ultrasonic Scaling & Air Polishing", cat: "Preventive", price: 1500 },
  { desc: "In-Office Laser Teeth Whitening (Bleaching)", cat: "Cosmetic", price: 8000 },
  { desc: "Dental Composite Light-Cure Tooth Filling", cat: "Restorative", price: 1200 },
  { desc: "Digital RVG X-Ray (Per Exposure)", cat: "Diagnostic", price: 400 },
];

export default function BillingPOSModal({
  isOpen,
  onClose,
  token,
  booking,
  onSaved,
}: BillingPOSModalProps) {
  const [patientName, setPatientName] = useState(token?.patientName || booking?.patientName || "Aarav Sharma");
  const [patientPhone, setPatientPhone] = useState(token?.patientPhone || booking?.patientPhone || "+91 98260 12345");
  const [patientEmail, setPatientEmail] = useState(booking?.patientEmail || "aarav.sharma@example.com");
  
  const [items, setItems] = useState<InvoiceLineItem[]>([
    {
      id: "item-1",
      description: "Single-Visit Rotary Root Canal Treatment (RCT - Tooth #36)",
      category: "Endodontics",
      unitPrice: 4500,
      quantity: 1,
      taxableAmount: 4500,
    },
    {
      id: "item-2",
      description: "High-Resolution Digital RVG Diagnostic X-Ray",
      category: "Diagnostic",
      unitPrice: 400,
      quantity: 2,
      taxableAmount: 800,
    },
  ]);

  const [discountTotal, setDiscountTotal] = useState(300);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI_QR");
  const [amountPaid, setAmountPaid] = useState(5000);
  const [saving, setSaving] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0);
  const grandTotal = Math.max(0, subtotal - discountTotal);
  const balanceDue = Math.max(0, grandTotal - amountPaid);

  const handleAddItem = (preset: typeof COMMON_BILLING_ITEMS[0]) => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random()}`,
        description: preset.desc,
        category: preset.cat,
        unitPrice: preset.price,
        quantity: 1,
        taxableAmount: preset.price,
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateInvoice = async () => {
    setSaving(true);
    const payload = {
      bookingId: booking?.id || token?.bookingId,
      patientName,
      patientPhone,
      patientEmail,
      items,
      subtotal,
      discountTotal,
      taxTotal: 0,
      grandTotal,
      amountPaid,
      balanceDue,
      paymentMethod,
      paymentStatus: balanceDue === 0 ? "PAID" : "PARTIAL",
    };

    try {
      const res = await fetch("/api/admin/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CREATE_INVOICE", data: payload }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedInvoice(data.invoice);
        if (onSaved) onSaved(data.invoice);
      }
    } catch (e) {
      console.error("Create invoice error:", e);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto overscroll-contain"
    >
      <div
        data-lenis-prevent
        className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Frontdesk Billing &amp; Express POS</h3>
              <p className="text-xs text-amber-200/60 leading-tight">Generate Clinical Tax Invoices, UPI QR Collections &amp; Receipts</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedInvoice && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-lg border border-amber-500/30 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm overscroll-contain"
        >
          {/* Printable Invoice Container */}
          <div id="printable-invoice" className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 space-y-5">
            {/* Invoice Top Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">{CLINIC_INFO.name}</h2>
                <p className="text-[11px] text-slate-600 mt-1">{CLINIC_INFO.address}</p>
                <p className="text-[11px] text-slate-600">GSTIN / Reg: 23AABCA1234D1ZP • 📞 {CLINIC_INFO.phone}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 rounded text-slate-800 border">
                  Tax Invoice / Receipt
                </span>
                <p className="text-xs font-mono font-bold text-amber-700 mt-2">
                  {savedInvoice ? savedInvoice.invoiceNumber : "ADS-INV-2026-DRAFT"}
                </p>
                <p className="text-[11px] text-slate-500">Date: {new Date().toLocaleDateString("en-IN")}</p>
              </div>
            </div>

            {/* Bill To Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Billed To (Patient):</span>
                <span className="font-bold text-slate-900">{patientName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Mobile / WhatsApp:</span>
                <span className="font-bold text-slate-900">{patientPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Doctor In-Charge:</span>
                <span className="font-bold text-slate-900">{LEAD_DOCTOR.name}</span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-slate-600 font-bold">
                    <th className="py-2 px-1">#</th>
                    <th className="py-2 px-2">Treatment / Clinical Service</th>
                    <th className="py-2 px-2">Qty</th>
                    <th className="py-2 px-2">Unit Price (₹)</th>
                    <th className="py-2 px-2 text-right">Amount (₹)</th>
                    <th className="py-2 px-1 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2 px-1 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-2 font-semibold text-slate-900">{item.description}</td>
                      <td className="py-2 px-2 font-mono">{item.quantity}</td>
                      <td className="py-2 px-2 font-mono">₹{item.unitPrice.toLocaleString("en-IN")}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">
                        ₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2 px-1 text-center">
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Add Presets */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-700 block mb-1.5">+ Quick Add Dental Procedure:</span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_BILLING_ITEMS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddItem(preset)}
                    className="px-2 py-1 bg-white hover:bg-amber-100 text-slate-800 border border-slate-300 rounded text-[11px] font-medium transition"
                  >
                    + {preset.desc.split("(")[0]} (₹{preset.price})
                  </button>
                ))}
              </div>
            </div>

            {/* Calculation & Payment Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
              {/* Payment Mode Selector */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Select Payment Mode:</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { mode: "UPI_QR", label: "UPI / GPay / PhonePe", icon: Smartphone },
                    { mode: "CASH", label: "Cash in Drawer", icon: Banknote },
                    { mode: "CARD", label: "Debit / Credit Card", icon: CreditCard },
                    { mode: "NET_BANKING", label: "Net Banking / Transfer", icon: ShieldCheck },
                  ].map((p) => {
                    const Icon = p.icon;
                    const isSelected = paymentMethod === p.mode;
                    return (
                      <button
                        key={p.mode}
                        type="button"
                        onClick={() => setPaymentMethod(p.mode as PaymentMethod)}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-600 text-amber-900 font-bold ring-1 ring-amber-600"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <Icon className="w-4 h-4 text-amber-700" />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === "UPI_QR" && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3">
                    <div className="w-16 h-16 bg-white p-1.5 rounded-lg border border-amber-300 flex items-center justify-center shrink-0">
                      <QrCode className="w-12 h-12 text-slate-900" />
                    </div>
                    <div className="text-[11px] text-amber-950">
                      <p className="font-bold">Scan to Pay via Any UPI App</p>
                      <p className="text-slate-600 font-mono text-[10px]">amulyamdentalstudio@icici</p>
                      <p className="font-bold text-amber-800 mt-0.5">Amount: ₹{grandTotal.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Total Calculation Sheet */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono font-semibold">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Discount (₹):</span>
                  <input
                    type="number"
                    value={discountTotal}
                    onChange={(e) => setDiscountTotal(Number(e.target.value) || 0)}
                    className="w-24 bg-white border border-slate-300 rounded p-1 text-right font-mono font-semibold text-xs"
                  />
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST / Clinic Tax:</span>
                  <span className="font-mono text-emerald-700 font-semibold">Exempt (0%)</span>
                </div>
                <div className="flex justify-between border-t border-slate-300 pt-2 text-sm font-black text-slate-900">
                  <span>Grand Total:</span>
                  <span className="font-mono text-amber-800">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-300 text-xs">
                  <span className="font-bold text-slate-700">Amount Received (₹):</span>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
                    className="w-24 bg-white border border-slate-300 rounded p-1 text-right font-mono font-bold text-slate-900 text-xs"
                  />
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Balance Outstanding:</span>
                  <span className={`font-mono ${balanceDue > 0 ? "text-rose-600 font-bold" : "text-emerald-700"}`}>
                    ₹{balanceDue.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Invoice Footer Seal */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span>Thank you for choosing Amulyam Dental Studio! For queries: +91 97531 33330</span>
              <span className="font-semibold text-slate-800">Authorized Signatory / Cashier</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-amber-500/20 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            {savedInvoice ? `Recorded: ${savedInvoice.invoiceNumber}` : "Ready to settle payment"}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              Close
            </button>
            <button
              onClick={handleCreateInvoice}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
            >
              {saving ? (
                <span className="animate-spin">✦</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{savedInvoice ? "Update Invoice" : "Settle & Issue Invoice"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
