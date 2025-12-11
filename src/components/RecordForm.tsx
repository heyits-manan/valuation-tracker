import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { PAYMENT_STATUS_OPTIONS, REPORT_TYPES } from '../types'
import type { ValuationRecord } from '../types'
import { formatDDMMYYYY, parseDDMMYYYY } from '../utils/date'
import { formatAmount, toNumber } from '../utils/number'
import { PlusIcon, ArrowPathIcon, ArchiveBoxArrowDownIcon } from '@heroicons/react/24/outline'

type FormValues = Omit<ValuationRecord, 'createdAt' | 'updatedAt'>

type FormState = {
  [K in keyof FormValues]: FormValues[K] extends number ? string : FormValues[K]
}

interface RecordFormProps {
  editingRecord?: ValuationRecord
  onAdd: (values: FormValues) => void
  onUpdate: (values: FormValues) => void
  onClear: () => void
  onBackup: () => void | Promise<void>
}

const makeInitialState = (): FormState => ({
  hecRefNo: '',
  date: '',
  clientName: '',
  address: '',
  contactNo: '',
  typeOfReport: 'Final Report',
  bankName: '',
  branch: '',
  fmvAmount: '',
  dvAmount: '',
  billAmount: '',
  advancePayment: '',
  paidAmount: '',
  paymentStatus: 'Not Paid',
})

const RecordForm = ({ editingRecord, onAdd, onUpdate, onClear, onBackup }: RecordFormProps) => {
  const [values, setValues] = useState<FormState>(() => makeInitialState())
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  useEffect(() => {
    if (!editingRecord) {
      setValues(makeInitialState())
      setErrors({})
      return
    }

    setValues({
      hecRefNo: editingRecord.hecRefNo,
      date: formatDDMMYYYY(editingRecord.date) || editingRecord.date,
      clientName: editingRecord.clientName,
      address: editingRecord.address,
      contactNo: editingRecord.contactNo,
      typeOfReport: editingRecord.typeOfReport,
      bankName: editingRecord.bankName,
      branch: editingRecord.branch,
      fmvAmount: formatAmount(editingRecord.fmvAmount),
      dvAmount: formatAmount(editingRecord.dvAmount),
      billAmount: formatAmount(editingRecord.billAmount),
      advancePayment: formatAmount(editingRecord.advancePayment),
      paidAmount: formatAmount(editingRecord.paidAmount),
      paymentStatus: editingRecord.paymentStatus ?? 'Not Paid',
    })
    setErrors({})
  }, [editingRecord])

  const handleChange = (
    field: keyof FormState,
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    let { value } = event.target

    // Date Masking
    if (field === 'date') {
      const nums = value.replace(/\D/g, '')
      if (nums.length <= 2) {
        value = nums
      } else if (nums.length <= 4) {
        value = `${nums.slice(0, 2)}/${nums.slice(2)}`
      } else {
        value = `${nums.slice(0, 2)}/${nums.slice(2, 4)}/${nums.slice(4, 8)}`
      }
    }

    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleNumberBlur = (field: keyof FormState) => {
    setValues((prev) => ({
      ...prev,
      [field]: formatAmount(toNumber(prev[field] as string)),
    }))
  }

  const validate = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {}
    if (!values.hecRefNo.trim()) {
      nextErrors.hecRefNo = 'HEC Reference No is required.'
    }
    if (!values.date.trim()) {
      nextErrors.date = 'Date is required.'
    } else if (!parseDDMMYYYY(values.date)) {
      nextErrors.date = 'Use DD/MM/YYYY format.'
    }
    if (!values.clientName.trim()) {
      nextErrors.clientName = 'Client Name is required.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const buildPayload = (): FormValues => ({
    hecRefNo: values.hecRefNo.trim(),
    date: values.date.trim(),
    clientName: values.clientName.trim(),
    address: values.address.trim(),
    contactNo: values.contactNo.trim(),
    typeOfReport: values.typeOfReport,
    bankName: values.bankName.trim(),
    branch: values.branch.trim(),
    fmvAmount: toNumber(values.fmvAmount),
    dvAmount: toNumber(values.dvAmount),
    billAmount: toNumber(values.billAmount),
    advancePayment: toNumber(values.advancePayment),
    paidAmount: toNumber(values.paidAmount),
    paymentStatus: values.paymentStatus ?? 'Not Paid',
  })

  const handleAdd = () => {
    if (!validate()) return
    onAdd(buildPayload())
    setValues(makeInitialState())
    setErrors({})
  }

  const handleUpdate = () => {
    if (!editingRecord) return
    if (!validate()) return
    onUpdate(buildPayload())
  }

  const handleClear = () => {
    setValues(makeInitialState())
    setErrors({})
    onClear()
  }

  const bill = toNumber(values.billAmount)
  const paid = toNumber(values.paidAmount)
  const advance = toNumber(values.advancePayment)
  const credit = Math.max(0, bill - paid - advance)
  const totalPaid = paid + advance

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-100">
          {editingRecord ? 'Edit Record' : 'New Valuation Record'}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            Clear Form
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">

        {/* Section 1: Basic Info */}
        <div className="space-y-4 rounded-lg bg-slate-900/50 p-4 border border-slate-800/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3">Project Details</h3>
          <FormField label="HEC Reference No" error={errors.hecRefNo}>
            <input
              type="text"
              value={values.hecRefNo}
              onChange={(e) => handleChange('hecRefNo', e)}
              placeholder="HEC-082-083-2500"
              className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
            />
          </FormField>
          <FormField label="Date" error={errors.date}>
            <input
              type="text"
              value={values.date}
              onChange={(e) => handleChange('date', e)}
              placeholder="DD/MM/YYYY"
              maxLength={10}
              className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
            />
          </FormField>
          <FormField label="Type of Report">
            <select
              value={values.typeOfReport}
              onChange={(e) => handleChange('typeOfReport', e)}
              className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {REPORT_TYPES.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Section 2: Client & Bank */}
        <div className="space-y-4 rounded-lg bg-slate-900/50 p-4 border border-slate-800/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3">Client & Bank</h3>
          <FormField label="Client Name" error={errors.clientName}>
            <input
              type="text"
              value={values.clientName}
              onChange={(e) => handleChange('clientName', e)}
              className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </FormField>
          <FormField label="Address">
            <input
              type="text"
              value={values.address}
              onChange={(e) => handleChange('address', e)}
              className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Bank Name">
              <input
                type="text"
                value={values.bankName}
                onChange={(e) => handleChange('bankName', e)}
                className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </FormField>
            <FormField label="Branch">
              <input
                type="text"
                value={values.branch}
                onChange={(e) => handleChange('branch', e)}
                className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </FormField>
          </div>
          <FormField label="Contact No">
            <input
              type="text"
              value={values.contactNo}
              onChange={(e) => handleChange('contactNo', e)}
              className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </FormField>
        </div>

        {/* Section 3: Value & Payment */}
        <div className="space-y-4 rounded-lg bg-slate-900/50 p-4 border border-slate-800/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3">Financials</h3>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="FMV Amount">
              <input
                type="text"
                value={values.fmvAmount}
                onChange={(e) => handleChange('fmvAmount', e)}
                onBlur={() => handleNumberBlur('fmvAmount')}
                className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-right tabular-nums"
              />
            </FormField>
            <FormField label="DV Amount">
              <input
                type="text"
                value={values.dvAmount}
                onChange={(e) => handleChange('dvAmount', e)}
                onBlur={() => handleNumberBlur('dvAmount')}
                className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-right tabular-nums"
              />
            </FormField>
          </div>
          <div className="h-px bg-slate-800 my-2"></div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Bill Amount">
              <input
                type="text"
                value={values.billAmount}
                onChange={(e) => handleChange('billAmount', e)}
                onBlur={() => handleNumberBlur('billAmount')}
                className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-right tabular-nums font-medium text-indigo-300"
              />
            </FormField>
            <FormField label="Payment Status">
              <select
                value={values.paymentStatus}
                onChange={(e) => handleChange('paymentStatus', e)}
                className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {PAYMENT_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Advance">
              <input
                type="text"
                value={values.advancePayment}
                onChange={(e) => handleChange('advancePayment', e)}
                onBlur={() => handleNumberBlur('advancePayment')}
                className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-right tabular-nums"
              />
            </FormField>
            <FormField label="Paid Amount">
              <input
                type="text"
                value={values.paidAmount}
                onChange={(e) => handleChange('paidAmount', e)}
                onBlur={() => handleNumberBlur('paidAmount')}
                className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-right tabular-nums"
              />
            </FormField>
          </div>
          <div className="mt-2 rounded bg-slate-950 p-3 text-xs space-y-1 border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Paid:</span>
              <span className="text-emerald-400 font-mono">{formatAmount(totalPaid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Remaining Credit:</span>
              <span className="text-red-400 font-mono">{formatAmount(credit)}</span>
            </div>
          </div>

        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-800/50 pt-6">
        <button
          type="button"
          onClick={editingRecord ? handleUpdate : handleAdd}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg transition-all active:scale-95 ${editingRecord
            ? 'bg-emerald-600 shadow-emerald-500/20 hover:bg-emerald-500'
            : 'bg-indigo-600 shadow-indigo-500/20 hover:bg-indigo-500'
            }`}
        >
          {editingRecord ? (
            <>
              <ArrowPathIcon className="h-4 w-4" />
              Update Record
            </>
          ) : (
            <>
              <PlusIcon className="h-4 w-4" />
              Add Record
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onBackup}
          className="ml-auto flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <ArchiveBoxArrowDownIcon className="h-4 w-4" />
          Backup Data
        </button>
      </div>
    </div>
  )
}

const FormField = ({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-slate-400">{label}</label>
    {children}
    {error && <span className="text-[10px] text-rose-500 font-medium">{error}</span>}
  </div>
)

export type { FormValues as RecordFormValues }
export default RecordForm

