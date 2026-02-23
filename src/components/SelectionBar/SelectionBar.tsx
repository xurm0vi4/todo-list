import { useBoard } from '../../board/BoardContext'
import { CheckIcon, CircleIcon, MoveIcon, TrashIcon } from '../../icons'
import './SelectionBar.scss'

export function SelectionBar() {
  const { state, deleteTasks, toggleTasksBulk, moveSelectedTasksToColumn, clearSelection } =
    useBoard()

  const { selectedTaskIds, columns } = state

  if (selectedTaskIds.length === 0) return null

  const count = selectedTaskIds.length
  const label = `${count} task${count !== 1 ? 's' : ''} selected`

  const handleMarkComplete = () => {
    toggleTasksBulk(selectedTaskIds, true)
    clearSelection()
  }

  const handleMarkIncomplete = () => {
    toggleTasksBulk(selectedTaskIds, false)
    clearSelection()
  }

  const handleDelete = () => {
    deleteTasks(selectedTaskIds)
    clearSelection()
  }

  const handleMoveTo = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetId = e.target.value
    if (targetId) {
      moveSelectedTasksToColumn(targetId)
      clearSelection()
    }
  }

  return (
    <div className="bar" role="toolbar" aria-label="Selection actions">
      <span className="bar__count">{label}</span>

      <div className="bar__actions">
        <button className="bar__btn" onClick={handleMarkComplete} title="Mark all as complete">
          <CheckIcon />
          <span>Complete</span>
        </button>

        <button className="bar__btn" onClick={handleMarkIncomplete} title="Mark all as incomplete">
          <CircleIcon />
          <span>Incomplete</span>
        </button>

        <div className="bar__divider" />

        <div className="bar__move">
          <MoveIcon />
          <select
            className="bar__move-select"
            value=""
            onChange={handleMoveTo}
            aria-label="Move selected tasks to column"
          >
            <option value="" disabled>
              Move to…
            </option>
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.title}
              </option>
            ))}
          </select>
        </div>

        <div className="bar__divider" />

        <button className="bar__btn bar__btn--danger" onClick={handleDelete} title="Delete selected tasks">
          <TrashIcon />
          <span>Delete</span>
        </button>
      </div>

      <button className="bar__close" onClick={clearSelection} title="Clear selection" aria-label="Clear selection">
        ✕
      </button>
    </div>
  )
}
