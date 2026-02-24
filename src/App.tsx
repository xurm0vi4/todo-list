import './App.scss'
import { BoardProvider } from './board/BoardContext'
import { Board } from './components/Board/Board'
import { SelectionBar } from './components/SelectionBar/SelectionBar'
import { Toolbar } from './components/Toolbar/Toolbar'

function App() {
  return (
    <BoardProvider>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">Todo Board</h1>
        </header>
        <Toolbar />
        <SelectionBar />
        <main className="app-main">
          <Board />
        </main>
      </div>
    </BoardProvider>
  )
}

export default App
