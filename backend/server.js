const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Code Judge Backend Server running on port ${PORT}`);
});