import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Filters as FiltersValue } from '../types'
import { parseDDMMYYYY } from '../utils/date'
import { FunnelIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface FiltersProps {
  value: FiltersValue
  onChange: (next: FiltersValue) => void
  onClear: () => void
}

const makeInitial = (): FiltersValue => ({ clientName: '', bankName: '', from: undefined, to: undefined })

const Filters = ({ value, onChange, onClear }: FiltersProps) => {
  const [draft, setDraft] = useState<FiltersValue>(() => ({ ...makeInitial(), ...value }))
  const [errors, setErrors] = useState<{ from?: string; to?: string }>({})
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setDraft({ ...makeInitial(), ...value })
  }, [value])

  const handleChange = (field: keyof FiltersValue, event: ChangeEvent<HTMLInputElement>) => {
    const nextDraft = { ...draft, [field]: event.target.value }
    setDraft(nextDraft)
    onChange(nextDraft)
  }

  const validate = () => {
    const nextErrors: { from?: string; to?: string } = {}
    if (draft.from && !parseDDMMYYYY(draft.from)) {
      nextErrors.from = 'Invalid date'
    }
    if (draft.to && !parseDDMMYYYY(draft.to)) {
      nextErrors.to = 'Invalid date'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleApply = () => {
    if (!validate()) return
    onChange(draft)
  }

  const handleClear = () => {
    const cleared = makeInitial()
    setDraft(cleared)
    setErrors({})
    onClear()
  }

  const hasActiveFilters = !!(draft.clientName || draft.bankName || draft.from || draft.to)

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 shadow-lg backdrop-blur-sm overflow-hidden">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-800/50"
      >
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-indigo-400" />
          <span className="font-medium text-slate-100">Filters</span>
          {hasActiveFilters && (
            <span className="ml-2 rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-400">Active</span>
          )}
        </div>
        {isOpen ? (
          <ChevronUpIcon className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="border-t border-slate-800/50 p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Client Name</label>
              <input
                type="text"
                value={draft.clientName}
                onChange={(event) => handleChange('clientName', event)}
                className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Search client..."
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Bank Name</label>
              <input
                type="text"
                value={draft.bankName}
                onChange={(event) => handleChange('bankName', event)}
                className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Search bank..."
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">From Date</label>
              <input
                type="text"
                value={draft.from ?? ''}
                onChange={(event) => handleChange('from', event)}
                placeholder="DD/MM/YYYY"
                className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                aria-invalid={errors.from ? 'true' : 'false'}
              />
              {errors.from && <span className="text-[10px] text-rose-500 font-medium">{errors.from}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">To Date</label>
              <input
                type="text"
                value={draft.to ?? ''}
                onChange={(event) => handleChange('to', event)}
                placeholder="DD/MM/YYYY"
                className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                aria-invalid={errors.to ? 'true' : 'false'}
              />
              {errors.to && <span className="text-[10px] text-rose-500 font-medium">{errors.to}</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={handleApply}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow transition-all hover:bg-indigo-500 active:scale-95"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Filters

