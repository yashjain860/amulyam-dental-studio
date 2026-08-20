"use client";

import React, { useState } from "react";
import { CashRegisterEntry, PaymentMethod } from "@/lib/types";
import {
  Banknote,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Printer,
  Calendar,
  CreditCard,
  Smartphone,
  CheckCircle2,
  DollarSign,
  X,
} from "lucide-react";

interface CashRegisterSummaryProps {
  entries: CashRegisterEntry[];
  onRefresh: () => void;
}

export default function CashRegisterSummary({
  entries,
  onRefresh,
}: CashRegisterSummaryProps) {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Clinic Consumables");
  const [expenseMethod, setExpenseMethod] = useState<PaymentMethod>("CASH");
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const totalIncome = entries
    .filter((e) => e.type === "INCOME")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = entries
    .filter((e) => e.type === "EXPENSE")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netCashInHand = entries
    .filter((e) => e.method === "CASH")
    .reduce((acc, curr) => acc + (curr.type === "INCOME" ? curr.amount : -curr.amount), 0);

  const totalUPI = entries
    .filter((e) => e.method === "UPI_QR" && e.type === "INCOME")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalCard = entries
    .filter((e) => e.method === "CARD" && e.type === "INCOME")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !expenseDesc) return;
    setLoading(true);

    try {
      await fetch("/api/admin/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_CASH_ENTRY",
          data: {
            date: todayStr,
            type: "EXPENSE",
            category: expenseCategory,
            amount: parseFloat(expenseAmount),
            method: expenseMethod,
            description: expenseDesc,
            recordedBy: "Frontdesk / Cashier",
          },
        }),
      });

      setExpenseDesc("");
      setExpenseAmount("");
      setIsExpenseModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-[#1C1A17] dark:text-white">
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collections */}
        <div className="bg-white dark:bg-slate-900/90 border border-emerald-500/30 p-5 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#7A7265] dark:text-slate-400 text-xs font-semibold">
            <span>Total Day Collections</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            ₹{totalIncome.toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 inline-block">
            {entries.filter((e) => e.type === "INCOME").length} Transactions
          </span>
        </div>

        {/* Physical Cash in Drawer */}
        <div className="bg-white dark:bg-slate-900/90 border border-amber-500/30 p-5 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#7A7265] dark:text-slate-400 text-xs font-semibold">
            <span>Cash in Drawer</span>
            <Banknote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono">
            ₹{netCashInHand.toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 inline-block">
            Physical Vault Balance
          </span>
        </div>

        {/* Digital Collections (UPI + Card) */}
        <div className="bg-white dark:bg-slate-900/90 border border-sky-500/30 p-5 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#7A7265] dark:text-slate-400 text-xs font-semibold">
            <span>UPI &amp; Card Receipts</span>
            <Smartphone className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="text-2xl font-black text-sky-700 dark:text-sky-300 font-mono">
            ₹{(totalUPI + totalCard).toLocaleString("en-IN")}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-[#7A7265] dark:text-slate-400 font-mono font-semibold">
            <span>UPI: ₹{totalUPI.toLocaleString()}</span>
            <span>•</span>
            <span>Card: ₹{totalCard.toLocaleString()}</span>
          </div>
        </div>

        {/* Clinic Expenses */}
        <div className="bg-white dark:bg-slate-900/90 border border-rose-500/30 p-5 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#7A7265] dark:text-slate-400 text-xs font-semibold">
            <span>Petty Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            ₹{totalExpense.toLocaleString("en-IN")}
          </p>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="w-full py-1.5 text-center text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl border border-rose-500/30 transition cursor-pointer"
          >
            + Record Expense
          </button>
        </div>
      </div>

      {/* Cash Flow Ledger Table */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-extrabold text-[#1C1A17] dark:text-white">Daily Cash Flow Ledger &amp; Reconciliation</h4>
            <p className="text-xs text-[#7A7265] dark:text-slate-400">All incoming invoices, UPI transfers, and outgoing clinic disbursements</p>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-amber-500/30 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print EOD Summary</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[#7A7265] dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50">
                <th className="py-2.5 px-3 font-bold">Time / Date</th>
                <th className="py-2.5 px-3 font-bold">Type</th>
                <th className="py-2.5 px-3 font-bold">Description</th>
                <th className="py-2.5 px-3 font-bold">Category</th>
                <th className="py-2.5 px-3 font-bold">Payment Mode</th>
                <th className="py-2.5 px-3 text-right font-bold">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 text-[#7A7265] dark:text-slate-400 font-mono text-[11px]">
                    {new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        entry.type === "INCOME"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {entry.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#1C1A17] dark:text-white">{entry.description}</td>
                  <td className="py-3 px-3 text-[#7A7265] dark:text-slate-400">{entry.category}</td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] font-bold text-amber-700 dark:text-amber-300/90">{entry.method}</span>
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono font-bold text-sm ${
                      entry.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {entry.type === "INCOME" ? "+" : "-"}₹{entry.amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {isExpenseModalOpen && (
        <div
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overscroll-contain"
        >
          <div
            data-lenis-prevent
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-rose-500/30 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 overscroll-contain text-[#1C1A17] dark:text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="text-base font-extrabold text-[#1C1A17] dark:text-white">Record Petty Cash Clinic Expense</h4>
              <button onClick={() => setIsExpenseModalOpen(false)} className="p-1 text-[#7A7265] dark:text-slate-400 hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-800 dark:text-slate-300 font-bold mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="e.g. Distilled water &amp; Autoclave rolls"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-rose-500 rounded-xl p-2.5 text-xs text-[#1C1A17] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-800 dark:text-slate-300 font-bold mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="350"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-rose-500 rounded-xl p-2.5 text-xs text-[#1C1A17] dark:text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-800 dark:text-slate-300 font-bold mb-1">Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-rose-500 rounded-xl p-2.5 text-xs text-[#1C1A17] dark:text-white focus:outline-none font-semibold"
                >
                  <option value="Clinic Consumables">Clinic Consumables / Materials</option>
                  <option value="Laboratory Bill">Dental Lab Courier / Bill</option>
                  <option value="Refreshments &amp; Housekeeping">Refreshments &amp; Housekeeping</option>
                  <option value="Repairs &amp; Maintenance">Equipment Maintenance</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer shadow-md"
                >
                  {loading ? "Recording..." : "Record Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
