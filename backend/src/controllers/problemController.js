const Problem = require('../models/Problem');

const getProblems = (req, res) => {
  const problems = Problem.find();
  // Strip descriptions for the list view to reduce payload size
  const list = problems.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    difficulty: p.difficulty,
    tags: p.tags
  }));
  res.json(list);
};

const getProblemByIdOrSlug = (req, res) => {
  const problem = Problem.findBySlug(req.params.id);
  if (!problem) {
    return res.status(404).json({ error: "Problem not found" });
  }
  res.json(problem);
};

module.exports = {
  getProblems,
  getProblemByIdOrSlug
};
