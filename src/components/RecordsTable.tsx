import type { ValuationRecord, SortState } from '../types'
import { formatAmount } from '../utils/number'
import { formatDDMMYYYY, parseDDMMYYYY } from '../utils/date'

interface RecordsTableProps {
  rows: ValuationRecord[]
  selectedId?: string
  sort: SortState
  setSort: (next: SortState) => void
  onSelect: (record: ValuationRecord) => void
  onDelete: (record: ValuationRecord) => void
}

const columnConfig: Array<{
  key: keyof ValuationRecord | 'serial' | 'actions'
  label: string
  sortable?: boolean
  align?: 'left' | 'right'
}> = [
  { key: 'serial', label: 'S.N' },
  { key: 'hecRefNo', label: 'HEC Reference No', sortable: true },
  { key: 'date', label: 'Date', sortable: true },
  { key: 'clientName', label: 'Client Name', sortable: true },
  { key: 'address', label: 'Address', sortable: true },
  { key: 'contactNo', label: 'Contact No', sortable: true },
  { key: 'typeOfReport', label: 'Type of Report', sortable: true },
  { key: 'bankName', label: 'Bank Name', sortable: true },
  { key: 'branch', label: 'Branch', sortable: true },
  { key: 'fmvAmount', label: 'FMV Amount', sortable: true, align: 'right' },
  { key: 'dvAmount', label: 'DV Amount', sortable: true, align: 'right' },
  { key: 'billAmount', label: 'Bill Amount', sortable: true, align: 'right' },
  { key: 'advancePayment', label: 'Advance Payment', sortable: true, align: 'right' },
  { key: 'paymentStatus', label: 'Payment Status', sortable: true },
  { key: 'actions', label: 'Actions' },
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
    if (sort.key !== key) return null
    return <span className="ml-1 text-xs">{sort.dir === 'asc' ? '▲' : '▼'}</span>
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-slate-100">Records</h2>
      <div className="max-h-[420px] overflow-y-auto">
        <table className="min-w-full table-fixed border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-800 text-left text-xs uppercase text-slate-300">
            <tr>
              {columnConfig.map(({ key, label, sortable, align }) => (
                <th key={key as string} className={`px-3 py-2 ${align === 'right' ? 'text-right' : 'text-left'}`}>
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(key as keyof ValuationRecord)}
                      className="flex items-center text-slate-300 hover:text-white"
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
          <tbody className="divide-y divide-slate-800 bg-[#1e1e1e] text-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columnConfig.length} className="px-3 py-6 text-center text-slate-400">
                  No records found. Try adjusting your filters or add a new record.
                </td>
              </tr>
            ) : (
              rows.map((record, index) => {
                const displayDate = parseDDMMYYYY(record.date)
                  ? record.date
                  : formatDDMMYYYY(record.date)
                const isSelected = record.hecRefNo === selectedId

                return (
                  <tr
                    key={record.hecRefNo}
                    className={`cursor-pointer transition hover:bg-slate-800 ${isSelected ? 'bg-slate-700' : index % 2 === 0 ? 'bg-slate-900' : 'bg-slate-950'}`}
                    onClick={() => onSelect(record)}
                  >
                    {columnConfig.map(({ key, align }) => {
                      if (key === 'serial') {
                        return (
                          <td key="serial" className="px-3 py-2 text-left">{index + 1}</td>
                        )
                      }
                      if (key === 'actions') {
                        return (
                          <td key="actions" className="px-3 py-2 text-left">
                            <button
                              type="button"
                              className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-500"
                              onClick={(event) => {
                                event.stopPropagation()
                                if (window.confirm('Delete this record?')) {
                                  onDelete(record)
                                }
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        )
                      }

                      const value = record[key]
                      const isAmount = typeof value === 'number'
                      const textValue =
                        key === 'paymentStatus'
                          ? (value as ValuationRecord['paymentStatus']) ?? 'Not Paid'
                          : (value as string)
                      return (
                        <td
                          key={key as string}
                          className={`px-3 py-2 ${align === 'right' || isAmount ? 'text-right tabular-nums' : 'text-left'}`}
                        >
                          {key === 'date'
                            ? displayDate
                            : isAmount
                              ? formatAmount(value)
                              : textValue || '—'}
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
