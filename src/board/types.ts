export type TaskId = string
export type ColumnId = string

export type StatusFilter = 'all' | 'completed' | 'incomplete'

export interface Task {
  id: TaskId
  title: string
  completed: boolean
  columnId: ColumnId
  createdAt: number
}

export interface Column {
  id: ColumnId
  title: string
  taskIds: TaskId[]
}

export interface BoardState {
  columns: Column[]
  tasksById: Record<TaskId, Task>
  selectedTaskIds: TaskId[]
  statusFilter: StatusFilter
  searchQuery: string
}

