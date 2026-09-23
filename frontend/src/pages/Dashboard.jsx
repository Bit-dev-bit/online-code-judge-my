import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Target, Zap, Trophy } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, accepted: 0 });

  useEffect(() => {
    // A real app would fetch user-specific stats
    axios.get(`${API_BASE_URL}/api/submissions`)
      .then(res => {
        const subs = res.data;
        const accepted = subs.filter(s => s.verdict === 'Accepted').length;
        setStats({ total: subs.length, accepted });
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-8 text-white">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface border border-border p-6 rounded-lg">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Target className="w-5 h-5" /> Total Submissions
          </div>
          <div className="text-4xl font-bold text-white">{stats.total}</div>
        </div>
        
        <div className="bg-surface border border-border p-6 rounded-lg">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> Accepted Solutions
          </div>
          <div className="text-4xl font-bold text-white">{stats.accepted}</div>
        </div>
        
        <div className="bg-surface border border-border p-6 rounded-lg">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Zap className="w-5 h-5 text-blue-400" /> Acceptance Rate
          </div>
          <div className="text-4xl font-bold text-white">
            {stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}%
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Start Practicing</h2>
        <p className="text-slate-400 mb-6">Head over to the problems list to start solving challenges and building your algorithmic skills.</p>
        <Link to="/problems" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded font-medium transition-colors">
          View Problems
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
