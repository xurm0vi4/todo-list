import { useEffect, useRef, useState } from 'react'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useBoard } from '../../board/BoardContext'
import type { Task } from '../../board/types'
import { PencilIcon, SmallCheckIcon } from '../../icons'
import './TaskItem.scss'

interface TaskItemProps {
  task: Task
  isSelected: boolean
}

export function TaskItem({ task, isSelected }: TaskItemProps) {
  const { toggleTask, toggleTaskSelection, editTaskTitle } = useBoard()

  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)
  const [isDragging, setIsDragging] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    return draggable({
      element: el,
      getInitialData: () => ({ type: 'task', taskId: task.id, columnId: task.columnId }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    })
  }, [task.id, task.columnId])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    return dropTargetForElements({
      element: el,
      getData: () => ({ type: 'task-item', taskId: task.id, columnId: task.columnId }),
      canDrop: ({ source }) => {
        const data = source.data as { type?: string; taskId?: string }
        return data.type === 'task' && data.taskId !== task.id
      },
      onDragEnter: () => setIsDragOver(true),
      onDragLeave: () => setIsDragOver(false),
      onDrop: () => setIsDragOver(false),
    })
  }, [task.id, task.columnId])

  const handleTitleSave = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== task.title) editTaskTitle(task.id, trimmed)
    else setDraft(task.title)
    setIsEditing(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleTitleSave()
    if (e.key === 'Escape') {
      setDraft(task.title)
      setIsEditing(false)
    }
  }

  const classNames = [
    'task',
    task.completed && 'task--completed',
    isSelected && 'task--selected',
    isDragging && 'task--dragging',
    isDragOver && 'task--drag-over',
    isEditing && 'task--editing',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classNames} ref={ref}>
      <button
        className="task__complete-btn"
        onClick={() => toggleTask(task.id)}
        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {task.completed ? <SmallCheckIcon /> : null}
      </button>

      <div className="task__body">
        {isEditing ? (
          <input
            ref={(el) => { el?.focus(); el?.select() }}
            className="task__input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="task__title">{task.title}</span>
        )}
      </div>

      <div className="task__actions">
        {!isEditing ? (
          <button
            className="task__edit-btn"
            onClick={(e) => {
              e.stopPropagation()
              setDraft(task.title)
              setIsEditing(true)
            }}
            title="Edit task"
            aria-label="Edit task"
            tabIndex={-1}
          >
            <PencilIcon />
          </button>
        ) : null}
        <input
          className="task__select"
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleTaskSelection(task.id)}
          title="Select task"
          aria-label="Select task"
        />
      </div>
    </div>
  )
}
