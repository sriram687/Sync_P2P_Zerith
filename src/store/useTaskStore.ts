import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type TaskStatus = 'todo' | 'done'

export interface Task {
  id: string
  text: string
  status: TaskStatus
  timestamp: number
}

interface TaskState {
  tasks: Task[]
  addTask: (text: string) => void
  deleteTask: (id: string) => void
  toggleTaskStatus: (id: string) => void
  moveTask: (id: string, status: TaskStatus) => void
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (text) => 
        set((state) => ({
          tasks: [
            {
              id: crypto.randomUUID(),
              text,
              status: 'todo',
              timestamp: Date.now(),
            },
            ...state.tasks,
          ],
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      toggleTaskStatus: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, status: task.status === 'todo' ? 'done' : 'todo' }
              : task
          ),
        })),
      moveTask: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, status } : task
          ),
        })),
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
