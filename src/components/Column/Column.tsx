import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useBoard } from '../../board/BoardContext'
import { COLUMN_ACCENT_COLORS } from '../../board/constants'
import type { Column as ColumnType } from '../../board/types'
import { TaskItem } from '../TaskItem/TaskItem'
import './Column.scss'

interface ColumnProps {
  column: ColumnType
}

interface ColorPaletteProps {
  currentColor: string
  onSelect: (color: string) => void
  onClose: () => void
}

function ColorPalette({ currentColor, onSelect, onClose }: ColorPaletteProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div className="column__color-palette" ref={ref} role="menu" aria-label="Pick column color">
      {COLUMN_ACCENT_COLORS.map((color) => (
        <button
          key={color}
          className={[
            'column__color-swatch',
            color === currentColor && 'column__color-swatch--active',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ background: color }}
          onClick={() => {
            onSelect(color)
            onClose()
          }}
          title={color}
          aria-label={`Set color ${color}`}
        />
      ))}
    </div>
  )
}

export function Column({ column }: ColumnProps) {
  const {
    state,
    addTask,
    deleteColumn,
    renameColumn,
    setColumnColor,
    moveColumn,
    moveTask,
    setSelectionForColumn,
  } = useBoard()

  const columnRef = useRef<HTMLDivElement>(null)
  const dragHandleRef = useRef<HTMLButtonElement>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [isColumnDragOver, setIsColumnDragOver] = useState(false)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [taskDraft, setTaskDraft] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(column.title)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)

  const taskInputRef = useRef<HTMLInputElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isAddingTask) taskInputRef.current?.focus()
  }, [isAddingTask])

  useEffect(() => {
    if (isEditingTitle) titleInputRef.current?.focus()
  }, [isEditingTitle])

  const visibleTasks = useMemo(
    () =>
      column.taskIds
        .map((id) => state.tasksById[id])
        .filter((t): t is NonNullable<typeof t> => Boolean(t))
        .filter((task) => {
          if (state.statusFilter === 'completed') return task.completed
          if (state.statusFilter === 'incomplete') return !task.completed
          return true
        }),
    [column.taskIds, state.tasksById, state.statusFilter]
  )

  const allVisibleSelected =
    visibleTasks.length > 0 && visibleTasks.every((t) => state.selectedTaskIds.includes(t.id))

  useEffect(() => {
    const el = columnRef.current
    const handleEl = dragHandleRef.current
    if (!el || !handleEl) return

    return draggable({
      element: el,
      dragHandle: handleEl,
      getInitialData: () => ({ type: 'column', columnId: column.id }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    })
  }, [column.id])

  useEffect(() => {
    const el = columnRef.current
    if (!el) return

    return dropTargetForElements({
      element: el,
      getData: ({ source }) => {
        if ((source.data as { type?: string }).type === 'column') {
          return { type: 'column-drop', columnId: column.id }
        }
        return { type: 'column-task-drop', columnId: column.id }
      },
      canDrop: ({ source }) => {
        const data = source.data as { type?: string; columnId?: string }
        if (data.type === 'column') return data.columnId !== column.id
        if (data.type === 'task') return true
        return false
      },
      onDragEnter: ({ source }) => {
        if ((source.data as { type?: string }).type === 'column') setIsColumnDragOver(true)
      },
      onDragLeave: () => setIsColumnDragOver(false),
      onDrop: ({ source, location }) => {
        setIsColumnDragOver(false)
        const sourceData = source.data as { type: string; columnId: string; taskId?: string }

        if (sourceData.type === 'column') {
          moveColumn(sourceData.columnId, column.id)
          return
        }

        if (sourceData.type === 'task' && sourceData.taskId) {
          const taskItemTarget = location.current.dropTargets.find(
            (t) => (t.data as { type?: string }).type === 'task-item'
          )
          if (taskItemTarget) {
            const td = taskItemTarget.data as { taskId: string; columnId: string }
            moveTask(sourceData.taskId, sourceData.columnId, column.id, td.taskId)
          } else {
            moveTask(sourceData.taskId, sourceData.columnId, column.id)
          }
        }
      },
    })
  }, [column.id, moveColumn, moveTask])

  const handleAddTask = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (taskDraft.trim()) {
        addTask(column.id, taskDraft.trim())
        setTaskDraft('')
        setIsAddingTask(false)
      }
    },
    [column.id, taskDraft, addTask]
  )

  const handleDeleteColumn = useCallback(() => {
    if (
      column.taskIds.length === 0 ||
      window.confirm(`Delete "${column.title}" and all its tasks?`)
    ) {
      deleteColumn(column.id)
    }
  }, [column.id, column.title, column.taskIds.length, deleteColumn])

  const handleSelectAll = useCallback(() => {
    setSelectionForColumn(column.id, !allVisibleSelected)
  }, [column.id, allVisibleSelected, setSelectionForColumn])

  const handleTitleSave = useCallback(() => {
    const trimmed = titleDraft.trim()
    if (trimmed && trimmed !== column.title) renameColumn(column.id, trimmed)
    else setTitleDraft(column.title)
    setIsEditingTitle(false)
  }, [column.id, column.title, titleDraft, renameColumn])

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleTitleSave()
      if (e.key === 'Escape') {
        setTitleDraft(column.title)
        setIsEditingTitle(false)
      }
    },
    [handleTitleSave, column.title]
  )

  const columnClass = [
    'column',
    isDragging && 'column--dragging',
    isColumnDragOver && 'column--drag-over',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article
      className={columnClass}
      ref={columnRef}
      style={{ '--col-accent': column.accentColor } as React.CSSProperties}
    >
      <header className="column__header">
        <button
          ref={dragHandleRef}
          className="column__grip"
          title="Drag to reorder"
          aria-label="Drag handle"
        >
          ⠿
        </button>

        <div className="column__color-wrapper">
          <button
            className="column__color-dot"
            style={{ background: column.accentColor }}
            onClick={() => setIsColorPickerOpen((v) => !v)}
            title="Change column color"
            aria-label="Change column color"
          />
          {isColorPickerOpen && (
            <ColorPalette
              currentColor={column.accentColor}
              onSelect={(color) => setColumnColor(column.id, color)}
              onClose={() => setIsColorPickerOpen(false)}
            />
          )}
        </div>

        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            className="column__title-input"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyDown}
          />
        ) : (
          <button
            className="column__title"
            onDoubleClick={() => {
              setTitleDraft(column.title)
              setIsEditingTitle(true)
            }}
            title="Double-click to rename"
          >
            <span className="column__title-text">{column.title}</span>
            <span className="column__count">{visibleTasks.length}</span>
          </button>
        )}

        <div className="column__actions">
          <label className="column__select-all" title="Select / deselect all">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={handleSelectAll}
              disabled={visibleTasks.length === 0}
            />
          </label>
          <button
            className="column__btn column__btn--danger"
            onClick={handleDeleteColumn}
            title="Delete column"
            aria-label="Delete column"
          >
            ×
          </button>
        </div>
      </header>

      <div className="column__body">
        {visibleTasks.length === 0 && <p className="column__empty">No tasks</p>}
        {visibleTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>

      <footer className="column__footer">
        {isAddingTask ? (
          <form className="column__add-task" onSubmit={handleAddTask}>
            <input
              ref={taskInputRef}
              className="column__add-task-input"
              value={taskDraft}
              onChange={(e) => setTaskDraft(e.target.value)}
              placeholder="Task title..."
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsAddingTask(false)
                  setTaskDraft('')
                }
              }}
            />
            <div className="column__add-task-row">
              <button type="submit" className="column__add-task-submit">
                Add task
              </button>
              <button
                type="button"
                className="column__add-task-cancel"
                onClick={() => {
                  setIsAddingTask(false)
                  setTaskDraft('')
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button className="column__new-task-btn" onClick={() => setIsAddingTask(true)}>
            + Add task
          </button>
        )}
      </footer>
    </article>
  )
}
