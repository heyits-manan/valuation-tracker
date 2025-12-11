import type { ValuationRecord, SortState } from '../types'
import { formatAmount } from '../utils/number'
import { formatDDMMYYYY, parseDDMMYYYY } from '../utils/date'
import { TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface RecordsTableProps {
  rows: ValuationRecord[]
  selectedId?: string
  sort: SortState
  setSort: (next: SortState) => void
  onSelect: (record: ValuationRecord) => void
  onDelete: (record: ValuationRecord) => void
}

const columnConfig: Array<{
  key: keyof ValuationRecord | 'serial' | 'actions' | 'credit' | 'totalPaid'
  label: string
  sortable?: boolean
  align?: 'left' | 'right'
  width?: string
}> = [
    { key: 'serial', label: '#', width: 'w-12' },
    { key: 'hecRefNo', label: 'Ref No', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'clientName', label: 'Client', sortable: true },
    { key: 'billAmount', label: 'Bill', sortable: true, align: 'right' },
    { key: 'paidAmount', label: 'Paid', sortable: true, align: 'right' },
    { key: 'advancePayment', label: 'Adv', sortable: true, align: 'right' },
    { key: 'totalPaid', label: 'Total Paid', align: 'right' },
    { key: 'credit', label: 'Credit', align: 'right' },
    { key: 'paymentStatus', label: 'Status', sortable: true },
    { key: 'actions', label: '', width: 'w-10' },
  ]

const RecordsTable = ({ rows, selectedId, sort, setSort, onSelect, onDelete }: RecordsTableProps) => {
  const handleSort = (key: keyof ValuationRecord) => {
    if (sort.key === key) {
      setSort({ key, dir: sort.dir === 'asc' ? 'desc' : 'asc' })
    } else {
      setSort({ key, dir: 'asc' })
    }
  }

  const renderSortIcon = (key: keyof ValuationRecord) => {
    if (sort.key !== key) return <div className="w-3 h-3" /> // Placeholder
    return sort.dir === 'asc' ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:p-6 shadow-xl backdrop-blur-sm flex flex-col max-h-[80vh] lg:h-[600px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-100">
          Records <span className="ml-2 rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{rows.length}</span>
        </h2>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-slate-800 bg-slate-950/50">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              {columnConfig.map(({ key, label, sortable, align, width }) => (
                <th
                  key={key as string}
                  className={`px-4 py-3 bg-slate-900/90 backdrop-blur ${align === 'right' ? 'text-right' : 'text-left'} ${width || ''}`}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(key as keyof ValuationRecord)}
                      className={`flex items-center gap-1 hover:text-indigo-400 transition-colors ${align === 'right' ? 'ml-auto' : ''}`}
                    >
                      {label}
                      {renderSortIcon(key as keyof ValuationRecord)}
                    </button>
                  ) : (
                    <span>{label}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-300">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columnConfig.length} className="px-4 py-12 text-center text-slate-500 italic">
                  No records found.
                </td>
              </tr>
            ) : (
              rows.map((record, index) => {
                const displayDate = parseDDMMYYYY(record.date)
                  ? record.date
                  : formatDDMMYYYY(record.date)
                const isSelected = record.hecRefNo === selectedId

                // Calculations
                const bill = record.billAmount || 0
                const paid = record.paidAmount || 0
                const advance = record.advancePayment || 0
                const totalPaid = paid + advance
                const credit = Math.max(0, bill - totalPaid)

                return (
                  <tr
                    key={record.hecRefNo}
                    onClick={() => onSelect(record)}
                    className={`cursor-pointer transition-colors duration-150 ${isSelected
                      ? 'bg-indigo-500/10 hover:bg-indigo-500/20'
                      : 'hover:bg-slate-800/50'
                      }`}
                  >
                    {columnConfig.map(({ key, align }) => {
                      if (key === 'serial') {
                        return <td key="serial" className="px-4 py-3 text-slate-500">{index + 1}</td>
                      }
                      if (key === 'actions') {
                        return (
                          <td key="actions" className="px-4 py-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (window.confirm('Delete this record?')) {
                                  onDelete(record)
                                }
                              }}
                              className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-slate-800"
                              title="Delete Record"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        )
                      }

                      // Computed Columns
                      if (key === 'totalPaid') {
                        return <td key="totalPaid" className="px-4 py-3 text-right tabular-nums text-emerald-400/80">{formatAmount(totalPaid)}</td>
                      }
                      if (key === 'credit') {
                        return <td key="credit" className="px-4 py-3 text-right tabular-nums text-rose-400/80 font-medium">{credit > 0 ? formatAmount(credit) : '-'}</td>
                      }

                      const value = record[key as keyof ValuationRecord]
                      const isAmount = typeof value === 'number'

                      let content: React.ReactNode = value as string

                      if (key === 'date') content = displayDate
                      if (isAmount) content = formatAmount(value as number)
                      if (!value && !isAmount) content = <span className="text-slate-600">—</span>

                      if (key === 'paymentStatus') {
                        const status = value || 'Not Paid'
                        const isPaid = status === 'Paid'
                        content = (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded textxs font-medium ${isPaid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                            {status}
                          </span>
                        )
                      }

                      if (key === 'hecRefNo') {
                        content = <span className="font-mono text-xs">{value as string}</span>
                      }

                      return (
                        <td
                          key={key as string}
                          className={`px-4 py-3 ${align === 'right' || isAmount ? 'text-right tabular-nums' : 'text-left'}`}
                        >
                          {content}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RecordsTable

