import express from 'express';
import { router as favRecipeRoutes } from './favorites.js';
import { searchRecipesByKeyword, searchRecipesByMaxMatching, searchRecipesByMinMissing} 
    from '../../services/searchRecipeServices.js';

export const router = express.Router();

router.use('/favorites', favRecipeRoutes);

// SEARCH RECIPES
router.get('/search-keyword', (req, res, next) => {
    try {
        const page = req.query.page || 0;
        const limit = parseInt(req.query.limit) || 10;
        const keyword = req.query.keyword || "";
        searchRecipesByKeyword(keyword, page, limit)
        .then((recipes) => { res.json(recipes) });
    } catch (error) {
        console.error("Error searching recipes by keyword:", error);
        res.status(500).json({ error: "An error occurred while fetching recipes." });
    }
});

router.get('/search-most-matching', (req, res, next) => {
    try {
        const page = req.query.page || 0;
        const limit = parseInt(req.query.limit) || 10;
        searchRecipesByMaxMatching(page, limit)
        .then((recipes) => { res.json(recipes) });
    } catch (error) {
        console.error("Error searching recipes by most matching:", error);
        res.status(500).json({ error: "An error occurred while fetching recipes." });
    }
});

router.get('/search-least-missing', (req, res, next) => {
    try {
        const page = req.query.page || 0;
        const limit = parseInt(req.query.limit) || 10;
        searchRecipesByMinMissing(page, limit)
        .then((recipes) => { res.json(recipes) });
    } catch (error) {
        console.error("Error searching recipes by least missing:", error);
        res.status(500).json({ error: "An error occurred while fetching recipes." });
    }
});

// maybe put this in favorites 
router.get('/:recipeId/pantry-comparison', (req, res, next) => {});
// can prolly just use pantry comparison for this
router.get('/:recipeId/missing-ingredients', (req, res, next) => {});
