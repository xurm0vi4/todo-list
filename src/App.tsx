import './App.scss'
import { BoardProvider } from './board/BoardContext'

function App() {
  return (
    <BoardProvider>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">Todo Board</h1>
        </header>
        <main className="app-main"></main>
      </div>
    </BoardProvider>
  )
}

export default App
