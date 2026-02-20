import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { boardReducer, createInitialBoardState } from './reducer'
import { createBoardActions } from './boardActions'
import { saveBoardState } from './storage'
import type { BoardState } from './types'

type BoardContextValue = { state: BoardState } & ReturnType<typeof createBoardActions>

const BoardContext = createContext<BoardContextValue | undefined>(undefined)

export function BoardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(boardReducer, {}, createInitialBoardState)
  const actions = useMemo(() => createBoardActions(dispatch), [dispatch])

  useEffect(() => {
    saveBoardState(state)
  }, [state])

  const value = useMemo<BoardContextValue>(() => ({ state, ...actions }), [state, actions])

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
}

export function useBoard(): BoardContextValue {
  const ctx = useContext(BoardContext)
  if (!ctx) {
    throw new Error('useBoard must be used within BoardProvider')
  }
  return ctx
}
