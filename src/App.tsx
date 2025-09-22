import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import RecordForm, { type RecordFormValues } from './components/RecordForm'
import RecordsTable from './components/RecordsTable'
import SummaryBar from './components/SummaryBar'
import Filters from './components/Filters'
import type { Filters as FiltersValue, SortState, ValuationRecord } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { formatDDMMYYYY, inRange, parseDDMMYYYY, toISO } from './utils/date'
import { format } from 'date-fns'
import * as XLSX from 'xlsx'

/**
 * Valuation Details Manager (Web)
 *
 * Run locally: `npm install` then `npm run dev`
 * Data storage: Records persist in `localStorage["valuationRecords"]` using ISO dates for reliable sorting.
 * Import/Export: Excel workbook (`.xlsx`) with the fields defined in `ValuationRecord`.
 * - Dates are exported as DD/MM/YYYY strings; numbers remain raw for spreadsheet formulas.
 */

const STORAGE_KEY = 'valuationRecords'

const seedRecords: ValuationRecord[] = [
  {
    hecRefNo: 'HEC-2025-001',
    date: toISO('15/01/2025') ?? new Date('2025-01-15T00:00:00Z').toISOString(),
    clientName: 'Apex Builders Pvt. Ltd.',
    address: '221B Baker Street, London',
    contactNo: '+44 20 7946 0958',
    typeOfReport: 'Final Report',
    bankName: 'Global Trust Bank',
    branch: 'Downtown',
    fmvAmount: 12500000,
    dvAmount: 9400000,
    billAmount: 650000,
    advancePayment: 150000,
    paymentStatus: 'Paid',
    createdAt: new Date('2025-01-16T09:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-16T09:00:00Z').toISOString(),
  },
  {
    hecRefNo: 'HEC-2025-002',
    date: toISO('02/02/2025') ?? new Date('2025-02-02T00:00:00Z').toISOString(),
    clientName: 'Sunrise Retail Group',
    address: '19 Park Lane, Mumbai',
    contactNo: '+91 98765 43210',
    typeOfReport: 'Interim Report',
    bankName: 'Heritage Finance',
    branch: 'Andheri East',
    fmvAmount: 8800000,
    dvAmount: 6400000,
    billAmount: 420000,
    advancePayment: 100000,
    paymentStatus: 'Not Paid',
    createdAt: new Date('2025-02-05T11:30:00Z').toISOString(),
    updatedAt: new Date('2025-02-05T11:30:00Z').toISOString(),
  },
]

const initialFilters: FiltersValue = { clientName: '', bankName: '', from: undefined, to: undefined }

const App = () => {
  const [records, setRecords] = useLocalStorage<ValuationRecord[]>(STORAGE_KEY, seedRecords)
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [filters, setFilters] = useState<FiltersValue>(initialFilters)
  const [sort, setSortState] = useState<SortState>({ key: 'createdAt', dir: 'desc' })
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const selectedRecord = useMemo(
    () => records.find((record) => record.hecRefNo === selectedId),
    [records, selectedId],
  )

  const normalizeDate = (value: string): string | null => {
    if (parseDDMMYYYY(value)) {
      return toISO(value)
    }
    const parsed = Date.parse(value)
    return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null
  }

  const buildRecord = (values: RecordFormValues, base?: ValuationRecord): ValuationRecord => {
    const now = new Date()
    const createdAt = base?.createdAt ?? now.toISOString()
    const isoDate = normalizeDate(values.date) ?? now.toISOString()
    return {
      hecRefNo: values.hecRefNo,
      date: isoDate,
      clientName: values.clientName,
      address: values.address,
      contactNo: values.contactNo,
      typeOfReport: values.typeOfReport,
      bankName: values.bankName,
      branch: values.branch,
      fmvAmount: Math.max(0, values.fmvAmount),
      dvAmount: Math.max(0, values.dvAmount),
      billAmount: Math.max(0, values.billAmount),
      advancePayment: Math.max(0, values.advancePayment),
      paymentStatus: values.paymentStatus,
      createdAt,
      updatedAt: now.toISOString(),
    }
  }

  const handleAdd = (values: RecordFormValues) => {
    if (records.some((record) => record.hecRefNo === values.hecRefNo)) {
      window.alert('A record with this HEC Reference No already exists. Please use a unique identifier.')
      return
    }
    const record = buildRecord(values)
    setRecords([...records, record])
    setSelectedId(undefined)
  }

  const handleUpdate = (values: RecordFormValues) => {
    if (!selectedRecord) return
    const duplicate = records.find(
      (record) => record.hecRefNo === values.hecRefNo && record.hecRefNo !== selectedRecord.hecRefNo,
    )
    if (duplicate) {
      window.alert('Another record already uses this HEC Reference No. Please choose a different one.')
      return
    }

    const updatedRecord = buildRecord(values, selectedRecord)
    setRecords(records.map((record) => (record.hecRefNo === selectedRecord.hecRefNo ? updatedRecord : record)))
    setSelectedId(updatedRecord.hecRefNo)
  }

  const handleClearSelection = () => {
    setSelectedId(undefined)
  }

  const handleDelete = (record: ValuationRecord) => {
    setRecords(records.filter((item) => item.hecRefNo !== record.hecRefNo))
    if (selectedId === record.hecRefNo) {
      setSelectedId(undefined)
    }
  }

  const filteredAndSortedRecords = useMemo(() => {
    const trimmedClient = filters.clientName.trim().toLowerCase()
    const trimmedBank = filters.bankName.trim().toLowerCase()

    const filtered = records.filter((record) => {
      const matchesClient = trimmedClient
        ? record.clientName.toLowerCase().includes(trimmedClient)
        : true
      const matchesBank = trimmedBank ? record.bankName.toLowerCase().includes(trimmedBank) : true
      const matchesDate = filters.from || filters.to ? inRange(record.date, filters.from, filters.to) : true
      return matchesClient && matchesBank && matchesDate
    })

    const sorted = [...filtered].sort((a, b) => {
      const direction = sort.dir === 'asc' ? 1 : -1
      const key = sort.key

      if (typeof a[key] === 'number' && typeof b[key] === 'number') {
        return ((a[key] as number) - (b[key] as number)) * direction
      }

      if (['date', 'createdAt', 'updatedAt'].includes(key)) {
        const aTime = Date.parse(a[key] as string)
        const bTime = Date.parse(b[key] as string)
        return ((aTime || 0) - (bTime || 0)) * direction
      }

      return (a[key] as string).localeCompare(b[key] as string, undefined, { sensitivity: 'base' }) * direction
    })

    return sorted
  }, [records, filters, sort])

  const handleFiltersChange = (next: FiltersValue) => {
    setFilters(next)
  }

  const handleFiltersClear = () => {
    setFilters(initialFilters)
  }

  const handleBackup = async () => {
    if (records.length === 0) {
      window.alert('There are no records to back up yet.')
      return
    }

    const today = format(new Date(), 'yyyy-MM-dd')
    const exportRows = records.map((record) => ({
      hecRefNo: record.hecRefNo,
      date: formatDDMMYYYY(record.date) || record.date,
      clientName: record.clientName,
      address: record.address,
      contactNo: record.contactNo,
      typeOfReport: record.typeOfReport,
      bankName: record.bankName,
      branch: record.branch,
      fmvAmount: record.fmvAmount,
      dvAmount: record.dvAmount,
      billAmount: record.billAmount,
      advancePayment: record.advancePayment,
      paymentStatus: record.paymentStatus,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportRows, { skipHeader: false })
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Valuations')

    const fileName = `valuation_records_${today}.xlsx`
    const workbookArray = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      compression: true,
    })

    const savePicker = (window as unknown as {
      showSaveFilePicker?: (options?: unknown) => Promise<
        { createWritable: () => Promise<{ write: (data: ArrayBuffer) => Promise<void>; close: () => Promise<void> }> }
      >
    }).showSaveFilePicker

    if (savePicker) {
      try {
        const handle = await savePicker({
          suggestedName: fileName,
          types: [
            {
              description: 'Excel Workbook',
              accept: {
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
              },
            },
          ],
        })
        const writable = await handle.createWritable()
        await writable.write(workbookArray)
        await writable.close()
        window.alert('Export completed successfully.')
        return
      } catch (error) {
        if ((error as { name?: string }).name === 'AbortError') {
          return
        }
        console.warn('Falling back to default download flow:', error)
      }
    }

    const blob = new Blob([workbookArray], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generateCopyRef = (base: string, existing: ValuationRecord[]): string => {
    let candidate = `${base}-copy`
    let counter = 1
    while (existing.some((record) => record.hecRefNo === candidate)) {
      candidate = `${base}-copy-${counter}`
      counter += 1
    }
    return candidate
  }

  const normaliseImportedRecord = (raw: unknown): ValuationRecord | null => {
    if (!raw || typeof raw !== 'object') return null
    const record = raw as Partial<ValuationRecord> & Record<string, unknown>
    const hecRefNo = String(record.hecRefNo ?? '').trim()
    const clientName = String(record.clientName ?? '').trim()
    if (!hecRefNo || !clientName) return null

    const rawDate = typeof record.date === 'string' ? record.date : ''
    const date = normalizeDate(rawDate) ?? new Date().toISOString()
    const typeOfReport = record.typeOfReport === 'Interim Report' ? 'Interim Report' : 'Final Report'
    const paymentStatus = record.paymentStatus === 'Paid' ? 'Paid' : 'Not Paid'

    const toNonNegative = (value: unknown) => {
      const parsed = Number(value)
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
    }

    const now = new Date().toISOString()
    const createdAt = record.createdAt && !Number.isNaN(Date.parse(String(record.createdAt)))
      ? new Date(String(record.createdAt)).toISOString()
      : now
    const updatedAt = record.updatedAt && !Number.isNaN(Date.parse(String(record.updatedAt)))
      ? new Date(String(record.updatedAt)).toISOString()
      : now

    return {
      hecRefNo,
      date,
      clientName,
      address: String(record.address ?? ''),
      contactNo: String(record.contactNo ?? ''),
      typeOfReport,
      bankName: String(record.bankName ?? ''),
      branch: String(record.branch ?? ''),
      fmvAmount: toNonNegative(record.fmvAmount),
      dvAmount: toNonNegative(record.dvAmount),
      billAmount: toNonNegative(record.billAmount),
      advancePayment: toNonNegative(record.advancePayment),
      paymentStatus,
      createdAt,
      updatedAt,
    }
  }

  const mergeImportedRecords = (incoming: ValuationRecord[]) => {
    if (incoming.length === 0) return

    const next = [...records]
    incoming.forEach((candidate) => {
      const existingIndex = next.findIndex((record) => record.hecRefNo === candidate.hecRefNo)
      if (existingIndex === -1) {
        next.push(candidate)
        return
      }

      const choiceRaw = window
        .prompt(
          `Record with HEC Ref ${candidate.hecRefNo} already exists. Enter:\n- "s" to Skip\n- "o" to Overwrite\n- "c" to Keep Both (append -copy)`,
          's',
        )
        ?.toLowerCase()

      if (choiceRaw === 'o') {
        next[existingIndex] = { ...candidate }
      } else if (choiceRaw === 'c') {
        const copyRef = generateCopyRef(candidate.hecRefNo, next)
        next.push({ ...candidate, hecRefNo: copyRef })
      }
      // default is skip
    })

    setRecords(next)
  }

  const parseJsonImport = (text: string) => {
    const parsed = JSON.parse(text)
    if (!Array.isArray(parsed)) {
      window.alert('Import failed. The JSON file must contain an array of records.')
      return
    }
    const normalised = parsed
      .map((item) => normaliseImportedRecord(item))
      .filter((item): item is ValuationRecord => Boolean(item))

    if (normalised.length === 0) {
      window.alert('No valid records were found in the imported file.')
      return
    }

    mergeImportedRecords(normalised)
  }

  const parseExcelImport = async (file: File) => {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    if (workbook.SheetNames.length === 0) {
      window.alert('The Excel file does not contain any sheets.')
      return
    }
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' })
    if (rows.length === 0) {
      window.alert('No rows were found in the Excel sheet.')
      return
    }
    const normalised = rows
      .map((row) => normaliseImportedRecord(row))
      .filter((item): item is ValuationRecord => Boolean(item))

    if (normalised.length === 0) {
      window.alert('No valid records were found in the imported file.')
      return
    }

    mergeImportedRecords(normalised)
  }

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (extension === 'json') {
        const text = await file.text()
        parseJsonImport(text)
      } else {
        await parseExcelImport(file)
      }
    } catch (error) {
      console.error(error)
      window.alert('Failed to import the selected file. Please ensure it is a valid Excel or JSON export.')
    }
  }

  const selectedRecordForForm = selectedRecord
    ? { ...selectedRecord, date: formatDDMMYYYY(selectedRecord.date) || selectedRecord.date }
    : undefined

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 px-6 py-4 shadow">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Valuation Details Manager</h1>
          <p className="text-sm text-slate-400">Manage valuation records with inline validation and local backups.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded border border-indigo-500 px-3 py-2 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500 hover:text-white"
          >
            Import Data
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xlsm,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/json"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      </header>

      <RecordForm
        editingRecord={selectedRecordForForm}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onClear={handleClearSelection}
        onBackup={handleBackup}
      />

      <RecordsTable
        rows={filteredAndSortedRecords}
        selectedId={selectedId}
        sort={sort}
        setSort={(next) => setSortState(next)}
        onSelect={(record) => setSelectedId(record.hecRefNo)}
        onDelete={handleDelete}
      />

      <SummaryBar rows={filteredAndSortedRecords} />

      <Filters value={filters} onChange={handleFiltersChange} onClear={handleFiltersClear} />
    </div>
  )
}

export default App
