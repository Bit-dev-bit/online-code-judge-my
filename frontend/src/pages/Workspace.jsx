import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { Play, Send, Settings, BookOpen, Terminal, CheckCircle2, XCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Workspace = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [verdict, setVerdict] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('testcases');
  const [customInput, setCustomInput] = useState('');

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/problems/${id}`)
      .then(res => {
        setProblem(res.data);
        // On problem load, try to restore from localStorage
        const savedCode = localStorage.getItem(`code_${id}_${language}`);
        if (savedCode) {
          setCode(savedCode);
        } else if (res.data.starterCode) {
          setCode(res.data.starterCode[language] || '');
        }
      })
      .catch(err => console.error("Error fetching problem:", err));
  }, [id, language]); // added language to dependency array so switching languages triggers load

  // Save to local storage on code change
  useEffect(() => {
    if (code && problem) {
      localStorage.setItem(`code_${id}_${language}`, code);
    }
  }, [code, id, language, problem]);

  const handleResetCode = () => {
    if (confirm("Are you sure you want to reset your code to the starter template?")) {
      const defaultCode = problem?.starterCode?.[language] || '';
      setCode(defaultCode);
      localStorage.setItem(`code_${id}_${language}`, defaultCode);
    }
  };

  const executeCode = async (isRun) => {
    setLoading(true);
    setVerdict(null);
    setActiveTab('result');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/submit`, {
        problemId: id,
        code,
        language,
        isCustomInput: isRun,
        customInput: isRun && activeTab === 'custom' ? customInput : ''
      });
      setVerdict(res.data);
    } catch (err) {
      setVerdict({ verdict: 'Error', details: 'Failed to connect to judge.' });
    }
    setLoading(false);
  };

  const handleRun = () => executeCode(true);
  const handleSubmit = () => executeCode(false);

  if (!problem) return <div className="flex items-center justify-center h-full">Loading Workspace...</div>;

  return (
    <PanelGroup orientation="horizontal" className="h-full">
      {/* Problem Description Panel */}
      <Panel defaultSize={35} minSize={20} className="bg-surface border-r border-border flex flex-col">
        <div className="h-10 border-b border-border flex items-center px-4 gap-2 bg-secondary/50 font-medium text-sm">
          <BookOpen className="w-4 h-4" /> Description
        </div>
        <div className="flex-1 overflow-y-auto p-6 prose prose-invert max-w-none">
          <div className="mb-4">
            <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-500/20 text-blue-400">
              {problem.difficulty}
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-4">{problem.id}. {problem.title}</h1>
          <p className="text-slate-300 leading-relaxed mb-6">{problem.description}</p>
          
          <h3 className="font-semibold mt-6 mb-2 text-white">Input Format</h3>
          <p className="text-slate-400 text-sm mb-4">{problem.inputFormat}</p>
          
          <h3 className="font-semibold mt-6 mb-2 text-white">Output Format</h3>
          <p className="text-slate-400 text-sm mb-4">{problem.outputFormat}</p>

          <h3 className="font-semibold mt-6 mb-2 text-white">Constraints</h3>
          <code className="block bg-secondary p-3 rounded text-sm mb-6">{problem.constraints}</code>

          {problem.examples && problem.examples.map((ex, i) => (
            <div key={i} className="mb-6">
              <h3 className="font-semibold mb-2 text-white">Example {i + 1}</h3>
              <div className="bg-secondary border border-border rounded p-4 font-mono text-sm">
                <div className="mb-2"><span className="text-slate-500">Input:</span><br/>{ex.input}</div>
                <div><span className="text-slate-500">Output:</span><br/>{ex.output}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors cursor-col-resize" />

      {/* Editor & Console Panel */}
      <Panel minSize={30} className="flex flex-col">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-10 border-b border-border flex items-center justify-between px-4 bg-secondary/50">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-background border border-border rounded px-2 py-1 text-sm outline-none focus:border-primary"
            >
              <option value="python">Python 3</option>
              <option value="cpp">C++ (GCC)</option>
              <option value="java">Java</option>
            </select>
            <div className="flex items-center gap-2">
              <button onClick={handleResetCode} className="p-1.5 hover:bg-white/10 rounded text-slate-400 text-sm flex items-center gap-1" title="Reset Code">Reset</button>
              <button className="p-1.5 hover:bg-white/10 rounded text-slate-400" title="Settings"><Settings className="w-4 h-4"/></button>
            </div>
          </div>
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language === 'python' ? 'python' : language === 'cpp' ? 'cpp' : 'java'}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val)}
              options={{ 
                fontSize: 14, 
                minimap: { enabled: false }, 
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                padding: { top: 16 }
              }}
            />
          </div>
        </div>

        {/* Console Area */}
        <div className="h-64 border-t border-border flex flex-col bg-surface">
          <div className="h-10 border-b border-border flex items-center justify-between px-4 bg-secondary/50">
            <div className="flex items-center gap-4 text-sm font-medium">
              <button 
                onClick={() => setActiveTab('testcases')}
                className={`flex items-center gap-2 py-2 px-1 ${activeTab === 'testcases' ? 'text-white border-b-2 border-primary' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Terminal className="w-4 h-4" /> Test Cases
              </button>
              <button 
                onClick={() => setActiveTab('custom')}
                className={`py-2 px-1 ${activeTab === 'custom' ? 'text-white border-b-2 border-primary' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Custom Input
              </button>
              <button 
                onClick={() => setActiveTab('result')}
                className={`py-2 px-1 ${activeTab === 'result' ? 'text-white border-b-2 border-primary' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Result
              </button>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleRun}
                disabled={loading}
                className="px-4 py-1.5 rounded bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 text-slate-200"
              >
                {loading ? 'Running...' : <><Play className="w-3 h-3 fill-current"/> Run</>}
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="px-4 py-1.5 rounded bg-primary hover:bg-primary/90 text-sm font-medium text-white flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : <><Send className="w-3 h-3"/> Submit</>}
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {activeTab === 'testcases' && (
              <div className="text-sm">
                <p className="text-slate-400 mb-2">Sample test cases that will be run:</p>
                <div className="flex gap-2">
                  {problem.examples && problem.examples.map((_, i) => (
                    <div key={i} className="px-3 py-1 bg-secondary rounded border border-border cursor-pointer hover:border-slate-500">Case {i + 1}</div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'custom' && (
              <div className="h-full flex flex-col">
                <textarea 
                  className="flex-1 bg-background border border-border rounded p-3 text-sm font-mono focus:border-primary outline-none resize-none" 
                  placeholder="Enter custom input here..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                ></textarea>
              </div>
            )}
            
            {activeTab === 'result' && (
              !verdict ? (
                <div className="text-slate-500 text-sm h-full flex items-center justify-center">
                  Run or submit code to see results here.
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className={`text-lg font-bold mb-2 flex items-center gap-2 ${verdict.verdict === 'Accepted' ? 'text-green-400' : 'text-red-400'}`}>
                    {verdict.verdict === 'Accepted' ? <CheckCircle2 className="w-5 h-5"/> : <XCircle className="w-5 h-5"/>}
                    {verdict.verdict}
                  </div>
                  {verdict.executionTime !== undefined && (
                    <div className="text-sm text-slate-400 mb-4 flex gap-4">
                      <span>Runtime: <span className="text-white font-mono">{verdict.executionTime} ms</span></span>
                      {verdict.memory > 0 && <span>Memory: <span className="text-white font-mono">{verdict.memory} MB</span></span>}
                      {verdict.total > 0 && <span>Test Cases: <span className="text-white font-mono">{verdict.passed} / {verdict.total}</span></span>}
                    </div>
                  )}
                  
                  {verdict.testCaseResults && verdict.testCaseResults.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {verdict.testCaseResults.map((tc, i) => (
                        <div key={i} className={`px-2 py-1 text-xs rounded border ${tc.verdict === 'Accepted' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                          Case {i+1}
                        </div>
                      ))}
                    </div>
                  )}

                  {verdict.details && (
                    <pre className="bg-background p-4 rounded border border-border text-red-300 text-sm overflow-x-auto whitespace-pre-wrap flex-1 font-mono">
                      {verdict.details}
                    </pre>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </Panel>
    </PanelGroup>
  );
};

export default Workspace;
