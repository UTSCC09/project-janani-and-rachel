// backend/server.js
import express from 'express';
import { router as recipeRoutes } from './routes/recipes.js';
import { router as spoonacularRoutes } from './routes/spoonacularRecipes.js';
import cors from 'cors';
import corsConfig from './config/cors.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors(corsConfig)); // enable CORS
app.use(express.json()); // Middleware to parse JSON
app.use('/api/recipes', recipeRoutes); // Route for recipe-related requests
app.use('/api/spoonacular', spoonacularRoutes); // Route for spoonacular-related requests

// to display requests in console
app.use((req, res, next) => {
  console.log(`HTTTP request ${req.method} ${req.path} ${req.body}`);
  next();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});