import express from 'express';
import { router as favRecipeRoutes } from './favorites.js';
import { router as spoonacularRecipeRoutes } from './spoonacular.js';

export const router = express.Router();

router.use('/favorites', favRecipeRoutes);
router.use('/spoonacular', spoonacularRecipeRoutes);
