import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { name: 'Go to Dashboard', action: () => navigate('/') },
    { name: 'Browse Problems', action: () => navigate('/problems') },
    { name: 'View Submissions', action: () => navigate('/submissions') },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-surface w-full max-w-lg rounded-xl shadow-2xl border border-border overflow-hidden">
        <div className="flex items-center px-4 border-b border-border">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            className="w-full bg-transparent p-4 text-slate-200 placeholder-slate-500 outline-none"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="px-2 py-1 bg-secondary rounded text-xs text-slate-500 font-mono">ESC</kbd>
        </div>
        
        <div className="max-h-64 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">No commands found.</div>
          ) : (
            filteredCommands.map((cmd, i) => (
              <button
                key={i}
                className="w-full text-left px-4 py-3 hover:bg-primary/10 hover:text-primary rounded-lg text-sm text-slate-300 transition-colors"
                onClick={() => {
                  cmd.action();
                  setIsOpen(false);
                  setQuery('');
                }}
              >
                {cmd.name}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
