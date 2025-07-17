const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.json({ message: 'GitGauge backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});