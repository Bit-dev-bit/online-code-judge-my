const express = require('express');
const cors = require('cors');

const problemRoutes = require('./routes/problemRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(cors());

app.use('/api/problems', problemRoutes);
app.use('/api/submit', submissionRoutes); // Keeping /api/submit for backward compatibility, or could route to /api/submissions
app.use('/api/submissions', submissionRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

module.exports = app;
