import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, Circle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-8 text-slate-400">Loading problems...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-8 text-white">Problems</h1>
      
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
            {problems.map((prob, i) => (
              <tr key={prob.id} className="border-b border-border hover:bg-white/5 transition-colors group">
                <td className="p-4 text-center">
                  <Circle className="w-5 h-5 text-slate-600 inline-block group-hover:text-slate-400 transition-colors" />
                </td>
                <td className="p-4">
                  <Link to={`/problems/${prob.slug || prob.id}`} className="text-slate-200 hover:text-primary font-medium block">
                    {i + 1}. {prob.title}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProblemList;
