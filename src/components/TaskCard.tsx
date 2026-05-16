'use client'

import { useZerith, useQuery } from '@/hooks/zerith'
import { motion } from 'framer-motion'
import { Trash2, MoveHorizontal, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: any
}

export function TaskCard({ task }: TaskCardProps) {
  const { update, remove } = useQuery("tasks")

  const toggleTaskStatus = async () => {
    const nextStatus = task.status === 'todo' ? 'done' : 'todo'
    await update(task._id, { status: nextStatus })
  }

  const deleteTask = async () => {
    await remove(task._id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="group relative p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 shadow-lg hover:shadow-zinc-950/50"
    >
      <div className="flex items-start gap-3">
        <button
          onClick={toggleTaskStatus}
          className={cn(
            "mt-1 transition-colors duration-200",
            task.status === 'done' ? "text-emerald-500" : "text-zinc-600 hover:text-zinc-400"
          )}
        >
          {task.status === 'done' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium leading-relaxed transition-all duration-300",
            task.status === 'done' ? "text-zinc-500 line-through" : "text-zinc-200"
          )}>
            {task.text}
          </p>
          <span className="text-[10px] text-zinc-600 font-mono mt-2 block">
            {new Date(task.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={toggleTaskStatus}
            title="Move"
            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
          >
            <MoveHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={deleteTask}
            title="Delete"
            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Decorative gradient border on hover */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-indigo-500/5 via-transparent to-emerald-500/5" />
    </motion.div>
  )
}
