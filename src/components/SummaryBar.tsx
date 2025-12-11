import type { ValuationRecord } from '../types'
import { formatAmount } from '../utils/number'
import { BanknotesIcon, CreditCardIcon, CalculatorIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline'

interface SummaryBarProps {
  rows: ValuationRecord[]
}

const SummaryBar = ({ rows }: SummaryBarProps) => {
  const totals = rows.reduce(
    (acc, record) => {
      acc.fmv += record.fmvAmount || 0
      acc.bill += record.billAmount || 0

      const paid = record.paidAmount || 0
      const advance = record.advancePayment || 0
      acc.totalPaid += (paid + advance)

      return acc
    },
    { fmv: 0, bill: 0, totalPaid: 0 },
  )

  const pending = Math.max(0, totals.bill - totals.totalPaid)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Bill */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-500/20 p-2 text-indigo-400">
            <CalculatorIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Billed</p>
            <p className="mt-1 text-xl font-bold text-slate-100">{formatAmount(totals.bill)}</p>
          </div>
        </div>
      </div>

      {/* Total Paid */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400">
            <BanknotesIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Received</p>
            <p className="mt-1 text-xl font-bold text-emerald-100">{formatAmount(totals.totalPaid)}</p>
          </div>
        </div>
      </div>

      {/* Pending / Credit */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-rose-500/20 p-2 text-rose-400">
            <CreditCardIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Outstanding</p>
            <p className="mt-1 text-xl font-bold text-rose-100">{formatAmount(pending)}</p>
          </div>
        </div>
      </div>

      {/* Total Value (FMV) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-700/50 p-2 text-slate-400">
            <CurrencyRupeeIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total FMV</p>
            <p className="mt-1 text-xl font-bold text-slate-300">{formatAmount(totals.fmv)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SummaryBar
