import { useState } from 'react'
import { useBoard } from '../../board/BoardContext'
import { Column } from '../Column/Column'
import './Board.scss'

function AddColumnCard() {
  const { addColumn } = useBoard()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      addColumn(title.trim())
      setTitle('')
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setTitle('')
  }

  if (isEditing) {
    return (
      <div className="board__add-column-card">
        <form onSubmit={handleSubmit} className="board__add-column-form">
          <input
            autoFocus
            className="board__add-column-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Column name..."
            onKeyDown={(e) => e.key === 'Escape' && handleCancel()}
          />
          <div className="board__add-column-row">
            <button type="submit" className="board__add-column-submit">
              Add column
            </button>
            <button type="button" className="board__add-column-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <button className="board__add-column-btn" onClick={() => setIsEditing(true)}>
      + Add column
    </button>
  )
}

export function Board() {
  const { state } = useBoard()

  return (
    <div className="board">
      {state.columns.map((column) => (
        <Column key={column.id} column={column} />
      ))}
      <AddColumnCard />
    </div>
  )
}
