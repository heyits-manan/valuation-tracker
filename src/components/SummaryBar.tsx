import type { ValuationRecord } from '../types'
import { formatAmount } from '../utils/number'

interface SummaryBarProps {
  rows: ValuationRecord[]
}

const SummaryBar = ({ rows }: SummaryBarProps) => {
  const totals = rows.reduce(
    (acc, record) => {
      acc.fmv += record.fmvAmount
      acc.dv += record.dvAmount
      acc.bill += record.billAmount
      return acc
    },
    { fmv: 0, dv: 0, bill: 0 },
  )

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-slate-100">Summary</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-800 p-4">
          <p className="text-xs uppercase text-slate-400">Total FMV Amount</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{formatAmount(totals.fmv)}</p>
        </div>
        <div className="rounded-lg bg-slate-800 p-4">
          <p className="text-xs uppercase text-slate-400">Total DV Amount</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{formatAmount(totals.dv)}</p>
        </div>
        <div className="rounded-lg bg-slate-800 p-4">
          <p className="text-xs uppercase text-slate-400">Total Bill Amount</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{formatAmount(totals.bill)}</p>
        </div>
      </div>
    </div>
  )
}

export default SummaryBar
