const Problem = require('../models/Problem');
const ExecutionService = require('../services/ExecutionService');
const crypto = require('crypto');

// In-memory mock database for submissions history
const submissionsDB = [];

const submitCode = async (req, res) => {
  const { problemId, code, language, isCustomInput, customInput } = req.body;
  
  if (!problemId || !code || !language) {
    return res.status(400).json({ verdict: 'Compilation Error', executionTime: 0, details: 'Missing required fields.' });
  }

  const problem = Problem.getInternalProblemData(problemId);
  if (!problem) {
    return res.status(404).json({ verdict: 'Error', details: 'Problem not found.' });
  }

  try {
    let result;
    
    // If it's a "Run" action (custom input or sample cases)
    if (isCustomInput) {
      const testCases = customInput !== undefined && customInput !== ''
        ? [{ input: customInput, expectedOutput: undefined }] 
        : problem.examples.map(ex => ({ input: ex.input, expectedOutput: ex.output }));
        
      result = await ExecutionService.executeCode(code, language, testCases, problem.timeLimit);
    } 
    // If it's a "Submit" action (hidden test cases)
    else {
      result = await ExecutionService.executeCode(code, language, problem.testCases, problem.timeLimit);
      
      // Save submission to history
      const submission = {
        id: crypto.randomUUID(),
        problemId: problem.id,
        problemTitle: problem.title,
        language,
        verdict: result.verdict,
        executionTime: result.executionTime,
        memory: result.memory,
        passed: result.passed,
        total: result.total,
        createdAt: new Date().toISOString()
      };
      submissionsDB.push(submission);
    }

    res.json(result);

  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ verdict: 'Internal Server Error', executionTime: 0, details: err.message });
  }
};

const getSubmissions = (req, res) => {
  // Sort by newest first
  res.json([...submissionsDB].reverse());
};

module.exports = {
  submitCode,
  getSubmissions
};
