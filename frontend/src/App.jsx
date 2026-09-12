import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

function App() {
  const [problemsList, setProblemsList] = useState([]);
  const [selectedId, setSelectedId] = useState(1);
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [verdict, setVerdict] = useState('');
  const [execTime, setExecTime] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch problem list on load
  useEffect(() => {
    axios.get('http://localhost:5000/api/problems')
      .then(res => setProblemsList(res.data))
      .catch(err => console.error("Error fetching problems list:", err));
  }, []);

  // Fetch specific problem details when selectedId changes
  useEffect(() => {
    axios.get(`http://localhost:5000/api/problem/${selectedId}`)
      .then(res => {
        setProblem(res.data);
        setVerdict('');
        if (language === 'python') {
          setCode('# Write your Python code here\n');
        } else if (language === 'cpp') {
          setCode('// Write your C++ code here\n#include <iostream>\nusing namespace std;\nint main() {\n    return 0;\n}');
        } else {
          setCode('// Write your Java code here\nimport java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n    }\n}');
        }
      })
      .catch(err => console.error("Error fetching problem details:", err));
  }, [selectedId, language]);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setVerdict('');
    try {
      const res = await axios.post('http://localhost:5000/api/submit', {
        problemId: selectedId,
        code,
        language
      });
      setVerdict(res.data.verdict);
      setExecTime(res.data.executionTime);
    } catch (err) {
      setVerdict('Error executing code');
    }
    setLoading(false);
  };

  if (!problem) return <div style={{ padding: '40px', color: '#61dafb', background: '#0f172a', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem' }}>Loading Online Judge Platform...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      {/* Sidebar: Problem List */}
      <div style={{ width: '22%', padding: '20px', borderRight: '1px solid #1e293b', backgroundColor: '#1e293b33' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#38bdf8' }}>Problems List</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {problemsList.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              style={{
                padding: '12px 15px',
                textAlign: 'left',
                background: selectedId === p.id ? '#2563eb' : '#1e293b',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: '0.2s'
              }}
            >
              {p.id}. {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Middle Pane: Problem Description */}
      <div style={{ width: '35%', padding: '30px', borderRight: '1px solid #1e293b', overflowY: 'auto', backgroundColor: '#1e293b22' }}>
        <div style={{ display: 'inline-block', padding: '4px 12px', background: '#3b82f622', color: '#3b82f6', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '15px' }}>
          Problem #{problem.id}
        </div>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#fff' }}>{problem.title}</h1>
        <p style={{ lineHeight: '1.7', color: '#cbd5e1', fontSize: '0.95rem' }}>{problem.description}</p>
        
        <div style={{ marginTop: '25px' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Sample Input</h3>
          <pre style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '8px', border: '1px solid #334155', color: '#38bdf8', marginTop: '8px' }}>{problem.sampleInput}</pre>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Sample Output</h3>
          <pre style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '8px', border: '1px solid #334155', color: '#34d399', marginTop: '8px' }}>{problem.sampleOutput}</pre>
        </div>
      </div>

      {/* Right Pane: Code Editor & Submission */}
      <div style={{ width: '43%', display: 'flex', flexDirection: 'column', padding: '25px', backgroundColor: '#0f172a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center', background: '#1e293b', padding: '10px 15px', borderRadius: '8px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: '500' }}>Language:</span>
            <select value={language} onChange={handleLanguageChange} style={{ padding: '8px 12px', background: '#0f172a', color: '#fff', border: '1px solid #475569', borderRadius: '6px', outline: 'none', cursor: 'pointer', fontWeight: '600' }}>
              <option value="python">Python 3</option>
              <option value="cpp">C++ (GCC)</option>
              <option value="java">Java (OpenJDK)</option>
            </select>
          </div>

          <button onClick={handleSubmit} disabled={loading} style={{ padding: '10px 20px', background: loading ? '#475569' : 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
            {loading ? 'Evaluating...' : '🚀 Run & Submit'}
          </button>
        </div>

        <div style={{ flex: 1, border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
          <Editor
            height="100%"
            language={language === 'python' ? 'python' : language === 'cpp' ? 'cpp' : 'java'}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value)}
            options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false }}
          />
        </div>

        {/* Verdict Box */}
        {verdict && (
          <div style={{ marginTop: '15px', padding: '16px', background: verdict === 'Accepted' ? 'rgba(21, 128, 61, 0.2)' : 'rgba(185, 28, 28, 0.2)', border: `1px solid ${verdict === 'Accepted' ? '#22c55e' : '#ef4444'}`, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: verdict === 'Accepted' ? '#4ade80' : '#f87171', fontSize: '1.05rem' }}>
                {verdict === 'Accepted' ? '🎉 Verdict: Accepted' : `❌ Verdict: ${verdict}`}
              </strong>
            </div>
            {execTime !== null && <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Time: <span style={{ color: '#fff', fontWeight: '600' }}>{execTime} ms</span></div>}
          </div>
        )}
      </div>

    </div>
  );
}

export default App;