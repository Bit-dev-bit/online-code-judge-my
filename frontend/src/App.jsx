import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Terminal, LayoutDashboard, Code2, List, User } from 'lucide-react';
import Workspace from './pages/Workspace';
import Dashboard from './pages/Dashboard';
import ProblemList from './pages/ProblemList';
import Submissions from './pages/Submissions';
import CommandPalette from './components/CommandPalette';

function App() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <div className="flex flex-col h-screen bg-background text-slate-300">
      <CommandPalette />
      {/* Top Navigation */}
      <nav className="h-14 border-b border-border bg-surface flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white">
            <Terminal className="w-5 h-5 text-primary" />
            <span>Judge<span className="text-primary">Pro</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link to="/" className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${isActive('/') ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}><LayoutDashboard className="w-4 h-4"/> Dashboard</Link>
            <Link to="/problems" className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${isActive('/problems') ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}><Code2 className="w-4 h-4"/> Problems</Link>
            <Link to="/submissions" className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${isActive('/submissions') ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}><List className="w-4 h-4"/> Submissions</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:ring-2 ring-primary/50 transition-all">
            <User className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/problems" element={<ProblemList />} />
          <Route path="/problems/:id" element={<Workspace />} />
          <Route path="/submissions" element={<Submissions />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;