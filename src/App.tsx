import { useState, useEffect } from 'react'
import { initDB } from './services/db.service'

function App() {
  const [count, setCount] = useState(0)
  const [dbStatus, setDbStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    // Initialize IndexedDB on component mount
    initDB()
      .then(() => {
        setDbStatus('ready')
        console.log('✅ IndexedDB initialized successfully with 6 stores')
      })
      .catch((error) => {
        setDbStatus('error')
        console.error('❌ Failed to initialize IndexedDB:', error)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Prompt Lab</h1>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold mb-2">Environment Status</h2>
            <div className="space-y-2">
              <p className="flex items-center">
                <span className="mr-2">✅</span>
                Vite + React + TypeScript
              </p>
              <p className="flex items-center">
                <span className="mr-2">✅</span>
                Tailwind CSS configured
              </p>
              <p className="flex items-center">
                <span className="mr-2">{dbStatus === 'ready' ? '✅' : dbStatus === 'loading' ? '⏳' : '❌'}</span>
                IndexedDB: {dbStatus === 'ready' ? '6 stores initialized' : dbStatus === 'loading' ? 'Initializing...' : 'Failed'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
          >
            Test Counter: {count}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
