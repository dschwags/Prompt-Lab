import { useState } from 'react';
import { SettingsModal } from './components/Settings/SettingsModal';
import { PromptEditor } from './components/PromptEditor/PromptEditor';
import { PromptProvider } from './context/PromptContext';

function App() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <PromptProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">🧪 Prompt Lab</h1>
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ⚙️ Settings
            </button>
          </div>
        </header>

        {/* Main Content - allow natural overflow */}
        <main className="flex-1 overflow-y-auto p-6">
          <PromptEditor />
        </main>

        {/* Settings Modal */}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </div>
    </PromptProvider>
  );
}

export default App;
