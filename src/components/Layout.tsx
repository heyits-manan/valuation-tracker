import { useState, type ReactNode } from 'react'
import {
    ClipboardDocumentCheckIcon,
    HomeIcon,
    QuestionMarkCircleIcon,
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline'

type TabType = 'dashboard' | 'help'

interface LayoutProps {
    children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
    const [activeTab, setActiveTab] = useState<TabType>('dashboard')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-2 text-indigo-400">
                            <ClipboardDocumentCheckIcon className="h-7 w-7" />
                            <span className="text-lg font-bold tracking-tight text-slate-100">
                                Valuation<span className="text-indigo-500">Tracker</span>
                            </span>
                        </div>

                        {/* Desktop Tabs */}
                        <nav className="hidden md:flex items-center gap-1">
                            <TabButton
                                icon={<HomeIcon className="h-4 w-4" />}
                                label="Dashboard"
                                active={activeTab === 'dashboard'}
                                onClick={() => setActiveTab('dashboard')}
                            />
                            <TabButton
                                icon={<QuestionMarkCircleIcon className="h-4 w-4" />}
                                label="How to Use"
                                active={activeTab === 'help'}
                                onClick={() => setActiveTab('help')}
                            />
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                            {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-3 border-t border-slate-800/50">
                            <nav className="flex flex-col gap-1">
                                <TabButton
                                    icon={<HomeIcon className="h-4 w-4" />}
                                    label="Dashboard"
                                    active={activeTab === 'dashboard'}
                                    onClick={() => {
                                        setActiveTab('dashboard')
                                        setMobileMenuOpen(false)
                                    }}
                                />
                                <TabButton
                                    icon={<QuestionMarkCircleIcon className="h-4 w-4" />}
                                    label="How to Use"
                                    active={activeTab === 'help'}
                                    onClick={() => {
                                        setActiveTab('help')
                                        setMobileMenuOpen(false)
                                    }}
                                />
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 bg-gradient-to-br from-slate-950 to-slate-900 p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {activeTab === 'dashboard' ? children : <HowToUseContent />}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-800 bg-slate-950/50 py-4 text-center text-xs text-slate-500">
                Valuation Tracker &copy; {new Date().getFullYear()}
            </footer>
        </div>
    )
}

const TabButton = ({
    icon,
    label,
    active,
    onClick,
}: {
    icon: ReactNode
    label: string
    active: boolean
    onClick: () => void
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${active
                ? 'bg-indigo-500/10 text-indigo-400'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
    >
        {icon}
        {label}
    </button>
)

const HowToUseContent = () => (
    <div className="space-y-8">
        <header>
            <h1 className="text-3xl font-bold text-slate-100">How to Use</h1>
            <p className="mt-2 text-slate-400">A quick guide to help you get started with the Valuation Tracker.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
            {/* Card 1: Adding a Record */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
                <h3 className="text-lg font-semibold text-indigo-400">1. Adding a New Record</h3>
                <p className="text-sm text-slate-300">
                    Fill out the form on the left side of the Dashboard. Enter the <strong>HEC Reference No</strong>, <strong>Date</strong> (DD/MM/YYYY), and <strong>Client Name</strong> — these are required fields.
                </p>
                <p className="text-sm text-slate-400">
                    <strong>Tip:</strong> The date field auto-formats. Just type the numbers (e.g., <code className="bg-slate-800 px-1 rounded">12122025</code>) and it will become <code className="bg-slate-800 px-1 rounded">12/12/2025</code>.
                </p>
            </div>

            {/* Card 2: Editing & Deleting */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
                <h3 className="text-lg font-semibold text-indigo-400">2. Editing & Deleting Records</h3>
                <p className="text-sm text-slate-300">
                    Click on any row in the table to select it. The form will populate with that record's data. Make your changes and click <strong>Update Record</strong>.
                </p>
                <p className="text-sm text-slate-400">
                    To delete a record, click the <span className="text-rose-400">trash icon</span> on the right side of the row.
                </p>
            </div>

            {/* Card 3: Tracking Payments */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
                <h3 className="text-lg font-semibold text-indigo-400">3. Tracking Payments</h3>
                <p className="text-sm text-slate-300">
                    Use the <strong>Bill Amount</strong>, <strong>Advance</strong>, and <strong>Paid Amount</strong> fields to track finances. The app automatically calculates:
                </p>
                <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                    <li><strong>Total Paid:</strong> Advance + Paid Amount</li>
                    <li><strong>Credit / Outstanding:</strong> Bill - Total Paid</li>
                </ul>
            </div>

            {/* Card 4: Importing Data */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
                <h3 className="text-lg font-semibold text-indigo-400">4. Importing from Excel</h3>
                <p className="text-sm text-slate-300">
                    Click the <strong>Import Excel</strong> button and select your <code className="bg-slate-800 px-1 rounded">.xlsx</code> file. If the file has multiple sheets, a popup will let you choose which one to import.
                </p>
                <p className="text-sm text-slate-400">
                    The Excel columns should match the field names (e.g., <code className="bg-slate-800 px-1 rounded">hecRefNo</code>, <code className="bg-slate-800 px-1 rounded">clientName</code>, <code className="bg-slate-800 px-1 rounded">billAmount</code>).
                </p>
            </div>

            {/* Card 5: Backing Up Data */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
                <h3 className="text-lg font-semibold text-indigo-400">5. Backing Up Data</h3>
                <p className="text-sm text-slate-300">
                    Click <strong>Backup Data</strong> in the form to download all your records as an <code className="bg-slate-800 px-1 rounded">.xlsx</code> file. This file can be re-imported later.
                </p>
                <p className="text-sm text-rose-400">
                    <strong>Important:</strong> Records are stored in your browser's memory. If you close or refresh the page, unsaved data will be lost. Always backup!
                </p>
            </div>

            {/* Card 6: Filtering & Sorting */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
                <h3 className="text-lg font-semibold text-indigo-400">6. Filtering & Sorting</h3>
                <p className="text-sm text-slate-300">
                    Use the <strong>Filters</strong> panel below the form to search by Client Name, Bank Name, or Date Range. Click on any column header in the table to sort by that column.
                </p>
            </div>
        </div>
    </div>
)

export default Layout

