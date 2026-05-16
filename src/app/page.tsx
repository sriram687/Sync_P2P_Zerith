import { KanbanBoard } from '@/components/KanbanBoard'
import { SyncIndicator } from '@/components/SyncIndicator'
import { Layout } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Premium Header */}
      <header className="glass-header">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Sync Kanban</h1>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] -mt-0.5">Local-First P2P</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <SyncIndicator />
            <div className="h-6 w-px bg-zinc-800" />
            <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Docs
            </button>
            <button className="px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/5">
              Connect
            </button>
          </div>
        </div>
      </header>

      {/* Hero / Board Section */}
      <div className="flex-1 px-6">
        <KanbanBoard />
      </div>

      {/* Subtle Footer */}
      <footer className="py-8 border-t border-zinc-900 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <p className="text-sm text-zinc-600 font-medium">
            &copy; 2026 Sync P2P. Built with Next.js 15.
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-zinc-700 font-mono">v1.0.0-beta</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
