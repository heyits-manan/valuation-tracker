import { useId, useState } from 'react'
import type { ReactNode } from 'react'

interface TooltipProps {
  content: ReactNode
  children?: ReactNode
}

const Tooltip = ({ content, children }: TooltipProps) => {
  const [open, setOpen] = useState(false)
  const tooltipId = useId()

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span
        tabIndex={0}
        aria-describedby={open ? tooltipId : undefined}
        className="ml-1 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-slate-700 text-[10px] font-semibold text-slate-100"
      >
        {children ?? 'i'}
      </span>
      {open ? (
        <span
          role="tooltip"
          id={tooltipId}
          className="absolute left-1/2 top-full z-10 mt-2 w-48 -translate-x-1/2 rounded-md bg-slate-800 px-3 py-2 text-xs text-slate-100 shadow-lg"
        >
          {content}
        </span>
      ) : null}
    </span>
  )
}

export default Tooltip
