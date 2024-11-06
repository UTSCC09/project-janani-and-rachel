// backend/server.js
import express from 'express';
import recipeRoutes from './routes/recipes.js';
import cors from 'cors';
import corsConfig from './config/cors.js';

const app = express();
const PORT = process.env.PORT || 5000;

// enable CORS 
app.use(cors(corsConfig));

app.use(express.json()); // Middleware to parse JSON
app.use('/api/recipes', recipeRoutes); // Route for recipe-related requests

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});