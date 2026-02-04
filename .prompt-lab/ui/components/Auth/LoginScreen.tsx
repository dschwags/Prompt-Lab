import { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { login } from '../../services/workspace-api';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const result = await login(password);
    
    if (result.success) {
      onLogin();
    } else {
      setError(result.error || 'Invalid password');
      setPassword('');
    }
    
    setLoading(false);
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
            <Lock size={32} className="text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Prompt Lab</h1>
          <p className="text-slate-500 mt-1">Enter the shared password to continue</p>
        </div>
        
        {/* Form */}
        <div className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              disabled={loading}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              autoFocus
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              'Checking...'
            ) : (
              <>
                Enter
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
        
        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Contact the project owner for access
        </p>
      </div>
    </div>
  );
}
