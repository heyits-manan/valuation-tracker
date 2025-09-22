import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import Tooltip from './Tooltip'
import { PAYMENT_STATUS_OPTIONS, REPORT_TYPES } from '../types'
import type { ValuationRecord } from '../types'
import { formatDDMMYYYY, parseDDMMYYYY } from '../utils/date'
import { formatAmount, toNumber } from '../utils/number'

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

const tooltipCopy: Record<keyof FormValues, string> = {
  hecRefNo: 'Enter the unique HEC reference number',
  date: 'Enter date in DD/MM/YYYY format',
  clientName: 'Enter the full name of the client',
  address: 'Enter the complete address',
  contactNo: 'Enter a valid contact number',
  typeOfReport: 'Select the type of valuation report',
  bankName: 'Enter the name of the bank',
  branch: 'Enter the bank branch name',
  fmvAmount: 'Enter the Fair Market Value amount',
  dvAmount: 'Enter the Distress Value amount',
  billAmount: 'Enter the total bill amount',
  advancePayment: 'Enter any advance payment received',
  paymentStatus: 'Select Paid if the bill is settled, otherwise choose Not Paid',
}

const labelMap: Record<keyof FormState, string> = {
  hecRefNo: 'HEC Reference No',
  date: 'Date',
  clientName: 'Client Name',
  address: 'Address',
  contactNo: 'Contact No',
  typeOfReport: 'Type of Report',
  bankName: 'Bank Name',
  branch: 'Branch',
  fmvAmount: 'FMV Amount',
  dvAmount: 'DV Amount',
  billAmount: 'Bill Amount',
  advancePayment: 'Advance Payment',
  paymentStatus: 'Payment Status',
}

const fieldOrder: (keyof FormState)[] = [
  'hecRefNo',
  'date',
  'clientName',
  'address',
  'contactNo',
  'typeOfReport',
  'bankName',
  'branch',
  'fmvAmount',
  'dvAmount',
  'billAmount',
  'advancePayment',
  'paymentStatus',
]

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
      paymentStatus: editingRecord.paymentStatus ?? 'Not Paid',
    })
    setErrors({})
  }, [editingRecord])

  const handleChange = (
    field: keyof FormState,
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { value } = event.target
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

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-slate-100">Valuation Details</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fieldOrder.map((field) => {
          const isNumberField = ['fmvAmount', 'dvAmount', 'billAmount', 'advancePayment'].includes(field)
          return (
            <div key={field} className="flex flex-col gap-1">
              <label className="flex items-center text-sm font-medium text-slate-200">
                <span>{labelMap[field]}</span>
                <Tooltip content={tooltipCopy[field]} />
              </label>
              {field === 'typeOfReport' ? (
                <select
                  value={values.typeOfReport}
                  onChange={(event) => handleChange(field, event)}
                  className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {REPORT_TYPES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field === 'paymentStatus' ? (
                <select
                  value={values.paymentStatus}
                  onChange={(event) => handleChange(field, event)}
                  className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PAYMENT_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={values[field] as string}
                  onChange={(event) => handleChange(field, event)}
                  onBlur={isNumberField ? () => handleNumberBlur(field) : undefined}
                  placeholder={field === 'date' ? 'DD/MM/YYYY' : undefined}
                  aria-invalid={errors[field] ? 'true' : 'false'}
                  className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
              {errors[field] ? <span className="text-xs text-red-400">{errors[field]}</span> : null}
            </div>
          )
        })}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleAdd}
          className="rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          Add Record
        </button>
        <button
          type="button"
          onClick={handleUpdate}
          disabled={!editingRecord}
          className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-900 disabled:text-emerald-300"
        >
          Update Record
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded bg-slate-700 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-600"
        >
          Clear Form
        </button>
        <button
          type="button"
          onClick={onBackup}
          className="rounded border border-indigo-500 px-3 py-2 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500 hover:text-white"
        >
          Backup Data
        </button>
      </div>
    </div>
  )
}

export type { FormValues as RecordFormValues }
export default RecordForm
