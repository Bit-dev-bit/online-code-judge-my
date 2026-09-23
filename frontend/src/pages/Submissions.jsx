import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/submissions`)
      .then(res => {
        setSubmissions(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching submissions:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-slate-400">Loading submissions...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-8 text-white">Global Submissions</h1>
      
      {submissions.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-border rounded-lg text-slate-500">
          No submissions found. Submit some code to see history here!
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="p-4 font-medium text-slate-400">Time</th>
                <th className="p-4 font-medium text-slate-400">Problem</th>
                <th className="p-4 font-medium text-slate-400">Verdict</th>
                <th className="p-4 font-medium text-slate-400">Runtime</th>
                <th className="p-4 font-medium text-slate-400">Language</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id} className="border-b border-border hover:bg-white/5 transition-colors">
                  <td className="p-4 text-slate-500">{new Date(sub.createdAt).toLocaleString()}</td>
                  <td className="p-4">
                    <Link to={`/problems/${sub.problemId}`} className="text-primary hover:underline">
                      {sub.problemTitle}
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1.5 font-medium ${sub.verdict === 'Accepted' ? 'text-green-400' : 'text-red-400'}`}>
                      {sub.verdict === 'Accepted' ? <CheckCircle2 className="w-4 h-4"/> : <XCircle className="w-4 h-4"/>}
                      {sub.verdict}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-slate-300">{sub.executionTime} ms</td>
                  <td className="p-4 text-slate-400 capitalize">{sub.language}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Submissions;
