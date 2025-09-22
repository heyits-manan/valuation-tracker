import { useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : defaultValue
    } catch (error) {
      console.warn(`Failed to read localStorage key "${key}":`, error)
      return defaultValue
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.warn(`Failed to write localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  const setValue = (value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => (typeof value === 'function' ? (value as (prev: T) => T)(prev) : value))
  }

  return [storedValue, setValue] as const
}
