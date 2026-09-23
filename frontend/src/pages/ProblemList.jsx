import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Circle, Search, Filter, Bookmark } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  
  // Basic localStorage bookmarking for now
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('judge_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('judge_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/problems`)
      .then(res => {
        setProblems(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching problems:", err);
        setLoading(false);
      });
  }, []);

  const toggleBookmark = (id) => {
    setBookmarks(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  if (loading) return <div className="p-8 text-slate-400">Loading problems...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">Problems</h1>
        
        {/* Filters & Search */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search problems..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:border-primary outline-none transition-colors"
            />
          </div>
          
          <div className="relative">
            <select 
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="appearance-none bg-surface border border-border rounded-lg pl-9 pr-8 py-2 text-sm focus:border-primary outline-none transition-colors text-slate-200"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>
      
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="p-4 font-medium text-slate-400 w-16">Status</th>
              <th className="p-4 font-medium text-slate-400">Title</th>
              <th className="p-4 font-medium text-slate-400 w-32">Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-8 text-center text-slate-500">
                  No problems match your filters.
                </td>
              </tr>
            ) : (
              filteredProblems.map((prob, i) => (
                <tr key={prob.id} className="border-b border-border hover:bg-white/5 transition-colors group">
                  <td className="p-4 text-center">
                    <button onClick={() => toggleBookmark(prob.id)} className="focus:outline-none">
                      <Bookmark className={`w-5 h-5 transition-colors ${bookmarks.includes(prob.id) ? 'fill-primary text-primary' : 'text-slate-600 hover:text-slate-400'}`} />
                    </button>
                  </td>
                  <td className="p-4">
                    <Link to={`/problems/${prob.slug || prob.id}`} className="text-slate-200 hover:text-primary font-medium block">
                      {prob.id}. {prob.title}
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      prob.difficulty === 'Easy' ? 'bg-blue-500/10 text-blue-400' :
                      prob.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {prob.difficulty || 'Easy'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProblemList;
