const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'problems.json');

class Problem {
  static _getProblems() {
    try {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading problems data:', err);
      return [];
    }
  }

  static find() {
    // Return all problems but strip out hidden test cases for security
    const problems = this._getProblems();
    return problems.map(p => ({
      ...p,
      testCases: undefined // NEVER send hidden test cases to the frontend
    }));
  }

  static findBySlug(slug) {
    const problems = this._getProblems();
    const problem = problems.find(p => p.slug === slug || p.id === slug);
    if (!problem) return null;
    
    // For specific problem fetch, we also omit testCases
    const safeProblem = { ...problem };
    delete safeProblem.testCases;
    return safeProblem;
  }

  static getInternalProblemData(idOrSlug) {
    // Used ONLY internally by the execution engine to access test cases
    const problems = this._getProblems();
    return problems.find(p => p.id === idOrSlug || p.slug === idOrSlug);
  }
}

module.exports = Problem;
