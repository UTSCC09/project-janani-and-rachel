// backend/server.js
import 'dotenv/config';
import express from 'express';
import { router as recipeRoutes } from './routes/recipes/recipeRoutes.js';
import { router as ingredientRoutes } from './routes/ingredientRoutes.js';
import { router as authRoutes } from './routes/authRoutes.js';
import cors from 'cors';
import corsConfig from './config/cors.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors(corsConfig)); // enable CORS
app.use(express.json()); // Middleware to parse JSON
app.use('/api/recipes', recipeRoutes); // Route for recipe-related requests
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/auth', authRoutes);

// to display requests in console
app.use((req, res, next) => {
  console.log(`HTTTP request ${req.method} ${req.path} ${req.body}`);
  next();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});