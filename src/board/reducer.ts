import type { BoardState, Column, ColumnId, StatusFilter, Task, TaskId } from './types'
import { loadBoardState } from './storage'

export type BoardAction =
  | { type: 'ADD_COLUMN'; id: ColumnId; title: string }
  | { type: 'DELETE_COLUMN'; columnId: ColumnId }
  | { type: 'MOVE_COLUMN'; fromId: ColumnId; toId: ColumnId }
  | { type: 'ADD_TASK'; id: TaskId; columnId: ColumnId; title: string; createdAt: number }
  | { type: 'DELETE_TASKS'; taskIds: TaskId[] }
  | {
      type: 'MOVE_TASK'
      taskId: TaskId
      fromColumnId: ColumnId
      toColumnId: ColumnId
      beforeTaskId?: TaskId
    }
  | { type: 'TOGGLE_TASK'; taskId: TaskId }
  | { type: 'TOGGLE_TASKS_BULK'; taskIds: TaskId[]; completed: boolean }
  | { type: 'EDIT_TASK_TITLE'; taskId: TaskId; title: string }
  | { type: 'SET_STATUS_FILTER'; filter: StatusFilter }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'TOGGLE_TASK_SELECTION'; taskId: TaskId }
  | { type: 'SET_SELECTION_FOR_COLUMN'; columnId: ColumnId; selected: boolean }
  | { type: 'MOVE_SELECTED_TASKS_TO_COLUMN'; targetColumnId: ColumnId }

export function createInitialBoardState(): BoardState {
  const stored = loadBoardState()
  if (stored) return stored

  return {
    columns: [
      { id: 'todo', title: 'Todo', taskIds: [] },
      { id: 'in-progress', title: 'In progress', taskIds: [] },
      { id: 'done', title: 'Done', taskIds: [] },
    ],
    tasksById: {},
    selectedTaskIds: [],
    statusFilter: 'all',
    searchQuery: '',
  }
}

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    // columns
    case 'ADD_COLUMN': {
      const column: Column = { id: action.id, title: action.title, taskIds: [] }
      return { ...state, columns: [...state.columns, column] }
    }

    case 'DELETE_COLUMN': {
      const removedIds = new Set(
        Object.values(state.tasksById)
          .filter((t) => t.columnId === action.columnId)
          .map((t) => t.id)
      )

      return {
        ...state,
        columns: state.columns.filter((c) => c.id !== action.columnId),
        tasksById: Object.fromEntries(
          Object.entries(state.tasksById).filter(([id]) => !removedIds.has(id))
        ) as Record<TaskId, Task>,
        selectedTaskIds: state.selectedTaskIds.filter((id) => !removedIds.has(id)),
      }
    }

    case 'MOVE_COLUMN': {
      const { fromId, toId } = action
      if (fromId === toId) return state

      const columns = [...state.columns]
      const fromIndex = columns.findIndex((c) => c.id === fromId)
      const toIndex = columns.findIndex((c) => c.id === toId)
      if (fromIndex === -1 || toIndex === -1) return state

      const [moved] = columns.splice(fromIndex, 1)
      columns.splice(toIndex, 0, moved)

      return { ...state, columns }
    }

    // tasks
    case 'ADD_TASK': {
      const columnIndex = state.columns.findIndex((c) => c.id === action.columnId)
      if (columnIndex === -1) return state

      const task: Task = {
        id: action.id,
        title: action.title,
        completed: false,
        columnId: action.columnId,
        createdAt: action.createdAt,
      }

      const columns = [...state.columns]
      const col = columns[columnIndex]
      columns[columnIndex] = { ...col, taskIds: [...col.taskIds, action.id] }

      return { ...state, columns, tasksById: { ...state.tasksById, [action.id]: task } }
    }

    case 'DELETE_TASKS': {
      const toRemove = new Set(action.taskIds)

      return {
        ...state,
        tasksById: Object.fromEntries(
          Object.entries(state.tasksById).filter(([id]) => !toRemove.has(id))
        ) as Record<TaskId, Task>,
        columns: state.columns.map((c) => ({
          ...c,
          taskIds: c.taskIds.filter((id) => !toRemove.has(id)),
        })),
        selectedTaskIds: state.selectedTaskIds.filter((id) => !toRemove.has(id)),
      }
    }

    case 'MOVE_TASK': {
      const { taskId, fromColumnId, toColumnId, beforeTaskId } = action
      const task = state.tasksById[taskId]
      if (!task) return state

      const columns = state.columns.map((col) =>
        col.id === fromColumnId
          ? { ...col, taskIds: col.taskIds.filter((id) => id !== taskId) }
          : col
      )

      const targetIndex = columns.findIndex((c) => c.id === toColumnId)
      if (targetIndex === -1) return state

      const targetCol = columns[targetIndex]
      const newTaskIds = [...targetCol.taskIds]

      if (beforeTaskId) {
        const insertAt = newTaskIds.indexOf(beforeTaskId)
        insertAt === -1 ? newTaskIds.push(taskId) : newTaskIds.splice(insertAt, 0, taskId)
      } else {
        newTaskIds.push(taskId)
      }

      columns[targetIndex] = { ...targetCol, taskIds: newTaskIds }

      return {
        ...state,
        columns,
        tasksById: { ...state.tasksById, [taskId]: { ...task, columnId: toColumnId } },
      }
    }

    case 'TOGGLE_TASK': {
      const task = state.tasksById[action.taskId]
      if (!task) return state

      return {
        ...state,
        tasksById: {
          ...state.tasksById,
          [action.taskId]: { ...task, completed: !task.completed },
        },
      }
    }

    case 'TOGGLE_TASKS_BULK': {
      const ids = new Set(action.taskIds)

      return {
        ...state,
        tasksById: Object.fromEntries(
          Object.entries(state.tasksById).map(([id, task]) => [
            id,
            ids.has(id) ? { ...task, completed: action.completed } : task,
          ])
        ) as Record<TaskId, Task>,
      }
    }

    case 'EDIT_TASK_TITLE': {
      const task = state.tasksById[action.taskId]
      if (!task) return state

      return {
        ...state,
        tasksById: {
          ...state.tasksById,
          [action.taskId]: { ...task, title: action.title },
        },
      }
    }

    // ui
    case 'SET_STATUS_FILTER': {
      return { ...state, statusFilter: action.filter }
    }

    case 'SET_SEARCH_QUERY': {
      return { ...state, searchQuery: action.query }
    }

    // selection
    case 'TOGGLE_TASK_SELECTION': {
      const exists = state.selectedTaskIds.includes(action.taskId)

      return {
        ...state,
        selectedTaskIds: exists
          ? state.selectedTaskIds.filter((id) => id !== action.taskId)
          : [...state.selectedTaskIds, action.taskId],
      }
    }

    case 'SET_SELECTION_FOR_COLUMN': {
      const column = state.columns.find((c) => c.id === action.columnId)
      if (!column) return state

      const columnTaskIds = new Set(column.taskIds)
      const current = new Set(state.selectedTaskIds)

      if (action.selected) {
        column.taskIds.forEach((id) => current.add(id))
      } else {
        state.selectedTaskIds.forEach((id) => {
          if (columnTaskIds.has(id)) current.delete(id)
        })
      }

      return { ...state, selectedTaskIds: Array.from(current) }
    }

    case 'MOVE_SELECTED_TASKS_TO_COLUMN': {
      const { targetColumnId } = action
      if (!state.selectedTaskIds.length) return state

      const toMove = new Set(state.selectedTaskIds)

      const tasksById = Object.fromEntries(
        Object.entries(state.tasksById).map(([id, task]) => [
          id,
          toMove.has(id) ? { ...task, columnId: targetColumnId } : task,
        ])
      ) as Record<TaskId, Task>

      const columns = state.columns.map((col) => {
        const remaining = col.taskIds.filter((id) => !toMove.has(id))
        return col.id === targetColumnId
          ? { ...col, taskIds: [...remaining, ...state.selectedTaskIds] }
          : { ...col, taskIds: remaining }
      })

      return { ...state, columns, tasksById }
    }

    default:
      return state
  }
}
