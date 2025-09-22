import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Filters as FiltersValue } from '../types'
import { parseDDMMYYYY } from '../utils/date'

interface FiltersProps {
  value: FiltersValue
  onChange: (next: FiltersValue) => void
  onClear: () => void
}

const makeInitial = (): FiltersValue => ({ clientName: '', bankName: '', from: undefined, to: undefined })

const Filters = ({ value, onChange, onClear }: FiltersProps) => {
  const [draft, setDraft] = useState<FiltersValue>(() => ({ ...makeInitial(), ...value }))
  const [errors, setErrors] = useState<{ from?: string; to?: string }>({})

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

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-slate-100">Filter Records</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-200">Client Name</label>
          <input
            type="text"
            value={draft.clientName}
            onChange={(event) => handleChange('clientName', event)}
            className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search client"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-200">Bank Name</label>
          <input
            type="text"
            value={draft.bankName}
            onChange={(event) => handleChange('bankName', event)}
            className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search bank"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-200">From Date</label>
          <input
            type="text"
            value={draft.from ?? ''}
            onChange={(event) => handleChange('from', event)}
            placeholder="DD/MM/YYYY"
            className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-invalid={errors.from ? 'true' : 'false'}
          />
          {errors.from ? <span className="text-xs text-red-400">{errors.from}</span> : null}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-200">To Date</label>
          <input
            type="text"
            value={draft.to ?? ''}
            onChange={(event) => handleChange('to', event)}
            placeholder="DD/MM/YYYY"
            className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-invalid={errors.to ? 'true' : 'false'}
          />
          {errors.to ? <span className="text-xs text-red-400">{errors.to}</span> : null}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleApply}
          className="rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          Apply Filter
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded bg-slate-700 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-600"
        >
          Clear Filter
        </button>
      </div>
    </div>
  )
}

export default Filters
