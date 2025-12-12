export type ReportType =
  | 'Preliminary valuation'
  | 'Revaluation'
  | 'Reconfirmation'
  | 'Building estimation/valuation'
  | 'Final Report'
  | 'Interim Report'

export type PaymentStatus = 'Paid' | 'Not Paid'

export interface ValuationRecord {
  hecRefNo: string
  date: string
  clientName: string
  address: string
  contactNo: string
  typeOfReport: ReportType
  bankName: string
  branch: string
  fmvAmount: number
  dvAmount: number
  billAmount: number
  advancePayment: number
  paidAmount: number

  paymentStatus: PaymentStatus
  createdAt: string
  updatedAt: string
}

export interface Filters {
  clientName: string
  bankName: string
  from?: string
  to?: string
}

export interface SortState {
  key: keyof ValuationRecord
  dir: 'asc' | 'desc'
}

export interface SheetData {
  [sheetName: string]: ValuationRecord[]
}

export const REPORT_TYPES: ReportType[] = [
  'Preliminary valuation',
  'Revaluation',
  'Reconfirmation',
  'Building estimation/valuation',
  'Final Report',
  'Interim Report',
]
export const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ['Paid', 'Not Paid']
