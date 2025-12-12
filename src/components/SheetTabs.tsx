interface SheetTabsProps {
    sheetNames: string[]
    activeSheet: string
    onTabChange: (sheetName: string) => void
}

const SheetTabs = ({ sheetNames, activeSheet, onTabChange }: SheetTabsProps) => {
    if (sheetNames.length <= 1) return null

    return (
        <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-slate-900/50 border border-slate-800 p-1">
            {sheetNames.map((name) => (
                <button
                    key={name}
                    type="button"
                    onClick={() => onTabChange(name)}
                    className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${activeSheet === name
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                >
                    {name}
                </button>
            ))}
        </div>
    )
}

export default SheetTabs
