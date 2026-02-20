import type { BoardState } from './types'

const STORAGE_KEY = 'todo-board'

export function loadBoardState(): BoardState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as BoardState
    return {
      ...parsed,
      selectedTaskIds: [],
      searchQuery: '',
    }
  } catch {
    return null
  }
}

export function saveBoardState(state: BoardState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore persistence errors
  }
}
