// src/components/PersonaDropdown/CustomPersonaModal.tsx

import { useState, useEffect } from 'react';

interface CustomPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (instruction: string, name: string) => void;
  initialInstruction?: string;
  initialName?: string;
  modelName?: string;
}

export function CustomPersonaModal({
  isOpen,
  onClose,
  onSave,
  initialInstruction = '',
  initialName = '',
  modelName = 'Model',
}: CustomPersonaModalProps) {
  const [instruction, setInstruction] = useState(initialInstruction);
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (isOpen) {
      setInstruction(initialInstruction);
      setName(initialName);
    }
  }, [isOpen, initialInstruction, initialName]);

  const handleSave = () => {
    if (instruction.trim() && name.trim()) {
      onSave(instruction.trim(), name.trim());
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-zinc-800 border border-zinc-600 rounded-xl shadow-2xl p-6">
        <h3 className="text-lg font-semibold text-zinc-50 mb-4">
          Create Custom Persona {modelName && `for ${modelName}`}
        </h3>
        
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-1">
              Persona Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Senior React Developer"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          {/* Instruction */}
          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-1">
              Persona Instructions
            </label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="You are a senior React developer with 10 years of experience. You specialize in performance optimization and clean code patterns. You always explain your reasoning and provide code examples..."
              className="w-full h-48 px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
            />
          </div>
          
          {/* Tips */}
          <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-700">
            <p className="text-xs text-zinc-400 mb-2">
              💡 Tips for effective personas:
            </p>
            <ul className="text-xs text-zinc-500 space-y-1 list-disc list-inside">
              <li>Define expertise and experience level</li>
              <li>Specify communication style preferences</li>
              <li>Include domain-specific knowledge</li>
              <li>Mention constraints or focus areas</li>
            </ul>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!instruction.trim() || !name.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg transition-colors font-medium"
          >
            Save Persona
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomPersonaModal;
