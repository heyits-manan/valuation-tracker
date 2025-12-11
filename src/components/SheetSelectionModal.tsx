import { useState } from 'react'

interface SheetSelectionModalProps {
    isOpen: boolean
    sheetNames: string[]
    onSelect: (sheetName: string) => void
    onCancel: () => void
}

const SheetSelectionModal = ({
    isOpen,
    sheetNames,
    onSelect,
    onCancel,
}: SheetSelectionModalProps) => {
    if (!isOpen) return null

    const [selected, setSelected] = useState<string>(sheetNames[0] || '')

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all duration-300">
            <div className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
                <h3 className="mb-4 text-xl font-semibold text-slate-100">Select Sheet</h3>
                <p className="mb-4 text-sm text-slate-400">
                    The selected file contains multiple sheets. Please choose the one you wish to import.
                </p>

                <div className="mb-6 space-y-2">
                    {sheetNames.map((name) => (
                        <label
                            key={name}
                            className={`flex cursor-pointer items-center rounded-lg border p-3 transition hove:bg-slate-800 ${selected === name
                                    ? 'border-indigo-500 bg-indigo-500/10'
                                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                }`}
                        >
                            <input
                                type="radio"
                                name="sheet"
                                value={name}
                                checked={selected === name}
                                onChange={() => setSelected(name)}
                                className="h-4 w-4 border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                            />
                            <span className="ml-3 text-sm font-medium text-slate-200">{name}</span>
                        </label>
                    ))}
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onSelect(selected)}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-500 active:scale-95"
                    >
                        Import Selected
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SheetSelectionModal
