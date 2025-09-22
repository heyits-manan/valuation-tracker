import { format, isValid, parse } from 'date-fns'

const DATE_FORMAT = 'dd/MM/yyyy'

export const parseDDMMYYYY = (value: string): Date | null => {
  if (!value) return null
  const parsed = parse(value, DATE_FORMAT, new Date())
  return isValid(parsed) ? parsed : null
}

export const formatDDMMYYYY = (value: Date | string): string => {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  return isValid(date) ? format(date, DATE_FORMAT) : ''
}

export const toISO = (value: string): string | null => {
  const parsed = parseDDMMYYYY(value)
  return parsed ? parsed.toISOString() : null
}

export const inRange = (isoDate: string, from?: string, to?: string): boolean => {
  if (!isoDate) return false
  const date = new Date(isoDate)
  if (!isValid(date)) return false

  const meetsFrom = from ? (() => {
    const parsedFrom = parseDDMMYYYY(from)
    return parsedFrom ? date >= parsedFrom : true
  })() : true

  const meetsTo = to ? (() => {
    const parsedTo = parseDDMMYYYY(to)
    return parsedTo ? date <= parsedTo : true
  })() : true

  return meetsFrom && meetsTo
}
