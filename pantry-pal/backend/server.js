// backend/server.js
const express = require('express');
const recipeRoutes = require('./routes/recipes');
const cors = require('cors'); // Enables CORS for cross-origin requests
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Parses incoming JSON requests
app.use(cors()); // Enables CORS

// Custom request logger
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

// Routes
// app.use('/api/recipes', recipeRoutes); // Routes for recipe-related requests

// Root Route
app.get('/', (req, res) => {
  res.send('Welcome to the Pantry Pal API');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
