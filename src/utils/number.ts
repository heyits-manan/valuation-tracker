const formatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const toNumber = (value: string): number => {
  if (!value) return 0
  const cleaned = value.replace(/,/g, '').trim()
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

export const formatAmount = (value: number | string): string => {
  const numeric = typeof value === 'string' ? toNumber(value) : value
  return formatter.format(Number.isFinite(numeric) ? numeric : 0)
}
