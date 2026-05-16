'use client'

import React from 'react'
import { useQuery } from '@/hooks/zerith'
import { TaskCard } from './TaskCard'
import { Plus, ListTodo, CheckCircle2, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type TaskStatus = 'todo' | 'done'

export function KanbanBoard() {
  const [inputValue, setInputValue] = React.useState('')
  const { data: tasks, insert, loading } = useQuery("tasks")
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      await insert({
        text: inputValue.trim(),
        status: 'todo' as TaskStatus,
        timestamp: Date.now(),
      })
      setInputValue('')
    }
  }

  if (loading) return null

  const todoTasks = tasks?.filter((t: any) => t.status === 'todo') || []
  const doneTasks = tasks?.filter((t: any) => t.status === 'done') || []

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto py-8">
      {/* To Do Column */}
      <Column
        title="To Do"
        icon={<ListTodo className="w-5 h-5 text-indigo-400" />}
        count={todoTasks.length}
        status="todo"
      >
        <form onSubmit={handleSubmit} className="mb-6 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Plan something new..."
            className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all shadow-xl"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-0 disabled:scale-90 transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {todoTasks.map((task: any) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </AnimatePresence>
          {todoTasks.length === 0 && (
            <EmptyState message="All caught up!" />
          )}
        </div>
      </Column>

      {/* Completed Column */}
      <Column
        title="Completed"
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        count={doneTasks.length}
        status="done"
      >
        <div className="space-y-4 pt-[74px]"> {/* Offset for input alignment */}
          <AnimatePresence mode="popLayout">
            {doneTasks.map((task: any) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </AnimatePresence>
          {doneTasks.length === 0 && (
            <EmptyState message="No tasks completed yet." />
          )}
        </div>
      </Column>
    </div>
  )
}

function Column({ 
  title, 
  icon, 
  count, 
  children,
  status 
}: { 
  title: string, 
  icon: React.ReactNode, 
  count: number, 
  children: React.ReactNode,
  status: TaskStatus
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl bg-zinc-900 border border-zinc-800",
            status === 'todo' ? "text-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.1)]" : "text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.1)]"
          )}>
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">{title}</h2>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{count} Tasks</p>
          </div>
        </div>
      </div>
      <div className="flex-1 rounded-3xl bg-zinc-950/30 border border-zinc-900/50 p-6 backdrop-blur-3xl">
        {children}
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl border border-dashed border-zinc-800"
    >
      <div className="p-3 rounded-full bg-zinc-900/50 border border-zinc-800/50 mb-3">
        <ChevronRight className="w-5 h-5 text-zinc-700" />
      </div>
      <p className="text-zinc-600 text-sm font-medium">{message}</p>
    </motion.div>
  )
}
