import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import RecordForm, { type RecordFormValues } from './components/RecordForm'
import RecordsTable from './components/RecordsTable'
import SummaryBar from './components/SummaryBar'
import Filters from './components/Filters'
import Layout from './components/Layout'
import SheetTabs from './components/SheetTabs'
import type {
  Filters as FiltersValue,
  SheetData,
  SortState,
  ValuationRecord,
} from './types'
import { formatDDMMYYYY, inRange, parseDDMMYYYY, toISO } from './utils/date'
import { format } from 'date-fns'
import * as XLSX from 'xlsx'

const DEFAULT_SHEET = 'Records'

const initialFilters: FiltersValue = {
  clientName: '',
  bankName: '',
  from: undefined,
  to: undefined,
}

const App = () => {
  const [sheetData, setSheetData] = useState<SheetData>({ [DEFAULT_SHEET]: [] })
  const [activeSheet, setActiveSheet] = useState<string>(DEFAULT_SHEET)
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [filters, setFilters] = useState<FiltersValue>(initialFilters)
  const [sort, setSortState] = useState<SortState>({
    key: 'createdAt',
    dir: 'desc',
  })
  const [currentFileName, setCurrentFileName] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Get current sheet's records
  const records = sheetData[activeSheet] || []
  const sheetNames = Object.keys(sheetData)

  const selectedRecord = useMemo(
    () => records.find((record) => record.hecRefNo === selectedId),
    [records, selectedId]
  )

  // Update records for current sheet
  const setRecords = (newRecords: ValuationRecord[]) => {
    setSheetData((prev) => ({ ...prev, [activeSheet]: newRecords }))
  }

  const normalizeDate = (value: string): string | null => {
    if (parseDDMMYYYY(value)) {
      return toISO(value)
    }
    const parsed = Date.parse(value)
    return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null
  }

  const buildRecord = (
    values: RecordFormValues,
    base?: ValuationRecord
  ): ValuationRecord => {
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
      paidAmount: Math.max(0, values.paidAmount),
      paymentStatus: values.paymentStatus,
      createdAt,
      updatedAt: now.toISOString(),
    }
  }

  const handleAdd = (values: RecordFormValues) => {
    if (records.some((record) => record.hecRefNo === values.hecRefNo)) {
      window.alert(
        'A record with this HEC Reference No already exists. Please use a unique identifier.'
      )
      return
    }
    const record = buildRecord(values)
    setRecords([...records, record])
    setSelectedId(undefined)
  }

  const handleUpdate = (values: RecordFormValues) => {
    if (!selectedRecord) return
    const duplicate = records.find(
      (record) =>
        record.hecRefNo === values.hecRefNo &&
        record.hecRefNo !== selectedRecord.hecRefNo
    )
    if (duplicate) {
      window.alert(
        'Another record already uses this HEC Reference No. Please choose a different one.'
      )
      return
    }

    const updatedRecord = buildRecord(values, selectedRecord)
    setRecords(
      records.map((record) =>
        record.hecRefNo === selectedRecord.hecRefNo ? updatedRecord : record
      )
    )
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
      const matchesBank = trimmedBank
        ? record.bankName.toLowerCase().includes(trimmedBank)
        : true
      const matchesDate =
        filters.from || filters.to
          ? inRange(record.date, filters.from, filters.to)
          : true
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

      return (
        (a[key] as string).localeCompare(b[key] as string, undefined, {
          sensitivity: 'base',
        }) * direction
      )
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
    const allRecords = Object.values(sheetData).flat()
    if (allRecords.length === 0) {
      window.alert('There are no records to back up yet.')
      return
    }

    const today = format(new Date(), 'yyyy-MM-dd')
    const workbook = XLSX.utils.book_new()

    // Export each sheet
    for (const [sheetName, sheetRecords] of Object.entries(sheetData)) {
      const exportRows = sheetRecords.map((record) => ({
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
        paidAmount: record.paidAmount,
        paymentStatus: record.paymentStatus,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      }))
      const worksheet = XLSX.utils.json_to_sheet(exportRows)
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    }

    const fileName = currentFileName
      ? currentFileName.replace(/\.[^/.]+$/, '') + '.xlsx'
      : `valuation_records_${today}.xlsx`
    const workbookArray = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      compression: true,
    })

    // Try to use the File System Access API to let user choose save location
    const savePicker = (
      window as unknown as {
        showSaveFilePicker?: (options?: unknown) => Promise<{
          createWritable: () => Promise<{
            write: (data: ArrayBuffer) => Promise<void>
            close: () => Promise<void>
          }>
        }>
      }
    ).showSaveFilePicker

    if (savePicker) {
      try {
        const handle = await savePicker({
          suggestedName: fileName,
          types: [
            {
              description: 'Excel Workbook',
              accept: {
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                  ['.xlsx'],
              },
            },
          ],
        })
        const writable = await handle.createWritable()
        await writable.write(workbookArray)
        await writable.close()
        window.alert('File saved successfully!')
        return
      } catch (error) {
        // User cancelled the save dialog
        if ((error as { name?: string }).name === 'AbortError') {
          return
        }
        // Other error - fall through to legacy download
        console.warn('File System Access API error, using fallback:', error)
      }
    }

    // Fallback for browsers that don't support File System Access API (e.g., Firefox, Safari)
    // Show a message to the user explaining the limitation
    const useFallback = window.confirm(
      'Your browser does not support choosing a save location.\n\n' +
      'The file will be downloaded to your default Downloads folder.\n\n' +
      'For the best experience, use Google Chrome or Microsoft Edge.\n\n' +
      'Click OK to proceed with download, or Cancel to abort.'
    )

    if (!useFallback) {
      return
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

  const normaliseImportedRecord = (raw: unknown): ValuationRecord | null => {
    if (!raw || typeof raw !== 'object') return null
    const record = raw as Partial<ValuationRecord> & Record<string, unknown>
    const hecRefNo = String(record.hecRefNo ?? '').trim()
    const clientName = String(record.clientName ?? '').trim()
    if (!hecRefNo || !clientName) return null

    const rawDate = typeof record.date === 'string' ? record.date : ''
    const date = normalizeDate(rawDate) ?? new Date().toISOString()

    // Attempt to map imported report type, fallback if not exact match or validation needed
    const typeOfReport = record.typeOfReport as ValuationRecord['typeOfReport'] || 'Final Report'

    const paymentStatus = record.paymentStatus === 'Paid' ? 'Paid' : 'Not Paid'

    const toNonNegative = (value: unknown) => {
      const parsed = Number(value)
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
    }

    const now = new Date().toISOString()
    const createdAt =
      record.createdAt && !Number.isNaN(Date.parse(String(record.createdAt)))
        ? new Date(String(record.createdAt)).toISOString()
        : now
    const updatedAt =
      record.updatedAt && !Number.isNaN(Date.parse(String(record.updatedAt)))
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
      paidAmount: toNonNegative(record.paidAmount),
      paymentStatus,
      createdAt,
      updatedAt,
    }
  }

  const mergeImportedRecords = (incoming: ValuationRecord[], sheetName: string = DEFAULT_SHEET) => {
    if (incoming.length === 0) return
    setSheetData((prev) => ({ ...prev, [sheetName]: incoming }))
  }

  const parseJsonImport = (text: string, fileName: string) => {
    const parsed = JSON.parse(text)
    if (!Array.isArray(parsed)) {
      window.alert(
        'Import failed. The JSON file must contain an array of records.'
      )
      return
    }
    const normalised = parsed
      .map((item) => normaliseImportedRecord(item))
      .filter((item): item is ValuationRecord => Boolean(item))

    if (normalised.length === 0) {
      window.alert('No valid records were found in the imported file.')
      return
    }

    setCurrentFileName(fileName)
    mergeImportedRecords(normalised)
  }

  const parseExcelImport = async (file: File) => {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })

    if (workbook.SheetNames.length === 0) {
      window.alert('The Excel file does not contain any sheets.')
      return
    }

    // Import ALL sheets
    const newSheetData: SheetData = {}
    let validSheetsCount = 0

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        defval: '',
      })

      const normalised = rows
        .map((row) => normaliseImportedRecord(row))
        .filter((item): item is ValuationRecord => Boolean(item))

      if (normalised.length > 0) {
        newSheetData[sheetName] = normalised
        validSheetsCount++
      }
    }

    if (validSheetsCount === 0) {
      window.alert('No valid records were found in any sheet.')
      return
    }

    setSheetData(newSheetData)
    setActiveSheet(Object.keys(newSheetData)[0])
    setCurrentFileName(file.name)
    setSelectedId(undefined)
  }

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (extension === 'json') {
        const text = await file.text()
        parseJsonImport(text, file.name)
      } else {
        await parseExcelImport(file)
      }
    } catch (error) {
      console.error(error)
      window.alert(
        'Failed to import the selected file. Please ensure it is a valid Excel or JSON export.'
      )
    }
  }

  const selectedRecordForForm = selectedRecord
    ? {
      ...selectedRecord,
      date: formatDDMMYYYY(selectedRecord.date) || selectedRecord.date,
    }
    : undefined

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-4 shadow backdrop-blur-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-1">
              Dashboard
            </h1>
            <p className="text-sm text-slate-400">
              Manage your valuation reports and payments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="hidden" // Hidden because we put it in the form, but let's keep it accessible if needed
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

            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Import Excel
            </button>
          </div>
        </header>

        {currentFileName && (
          <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 text-sm text-indigo-300">
            Working on file: <span className="font-semibold">{currentFileName}</span>
          </div>
        )}

        {/* Summary Cards - Full Width at Top */}
        <SummaryBar rows={filteredAndSortedRecords} />

        {/* New Valuation Record Form - Full Width */}
        <RecordForm
          editingRecord={selectedRecordForForm}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onClear={handleClearSelection}
          onBackup={handleBackup}
        />

        {/* Filters */}
        <Filters
          value={filters}
          onChange={handleFiltersChange}
          onClear={handleFiltersClear}
        />

        {/* Sheet Tabs - Only shown when multiple sheets exist */}
        <SheetTabs
          sheetNames={sheetNames}
          activeSheet={activeSheet}
          onTabChange={(name) => {
            setActiveSheet(name)
            setSelectedId(undefined)
          }}
        />

        {/* Records Table - Full Width */}
        <RecordsTable
          rows={filteredAndSortedRecords}
          selectedId={selectedId}
          sort={sort}
          setSort={(next) => setSortState(next)}
          onSelect={(record) => setSelectedId(record.hecRefNo)}
          onDelete={handleDelete}
        />
      </div>
    </Layout>
  )
}

export default App

