import type { Dispatch } from 'react'
import type { BoardAction } from './reducer'
import type { ColumnId, StatusFilter, TaskId } from './types'

export function createBoardActions(dispatch: Dispatch<BoardAction>) {
  return {
    // columns
    addColumn: (title: string) =>
      dispatch({ type: 'ADD_COLUMN', id: crypto.randomUUID(), title: title || 'New column' }),

    deleteColumn: (columnId: ColumnId) => dispatch({ type: 'DELETE_COLUMN', columnId }),

    renameColumn: (columnId: ColumnId, title: string) =>
      dispatch({ type: 'RENAME_COLUMN', columnId, title }),

    setColumnColor: (columnId: ColumnId, color: string) =>
      dispatch({ type: 'SET_COLUMN_COLOR', columnId, color }),

    moveColumn: (fromId: ColumnId, toId: ColumnId) =>
      dispatch({ type: 'MOVE_COLUMN', fromId, toId }),

    // tasks
    addTask: (columnId: ColumnId, title: string) =>
      dispatch({
        type: 'ADD_TASK',
        id: crypto.randomUUID(),
        columnId,
        title: title || 'New task',
        createdAt: Date.now(),
      }),

    deleteTasks: (taskIds: TaskId[]) => dispatch({ type: 'DELETE_TASKS', taskIds }),

    moveTask: (taskId: TaskId, fromColumnId: ColumnId, toColumnId: ColumnId, beforeTaskId?: TaskId) =>
      dispatch({ type: 'MOVE_TASK', taskId, fromColumnId, toColumnId, beforeTaskId }),

    toggleTask: (taskId: TaskId) => dispatch({ type: 'TOGGLE_TASK', taskId }),

    toggleTasksBulk: (taskIds: TaskId[], completed: boolean) =>
      dispatch({ type: 'TOGGLE_TASKS_BULK', taskIds, completed }),

    editTaskTitle: (taskId: TaskId, title: string) =>
      dispatch({ type: 'EDIT_TASK_TITLE', taskId, title }),

    // selection
    toggleTaskSelection: (taskId: TaskId) => dispatch({ type: 'TOGGLE_TASK_SELECTION', taskId }),

    setSelectionForColumn: (columnId: ColumnId, selected: boolean) =>
      dispatch({ type: 'SET_SELECTION_FOR_COLUMN', columnId, selected }),

    moveSelectedTasksToColumn: (targetColumnId: ColumnId) =>
      dispatch({ type: 'MOVE_SELECTED_TASKS_TO_COLUMN', targetColumnId }),

    clearSelection: () => dispatch({ type: 'CLEAR_SELECTION' }),

    // ui
    setStatusFilter: (filter: StatusFilter) => dispatch({ type: 'SET_STATUS_FILTER', filter }),

    setSearchQuery: (query: string) => dispatch({ type: 'SET_SEARCH_QUERY', query }),
  }
}
