import express from 'express';
import { router as favRecipeRoutes } from './favRecipeRoutes.js';
import { router as mealPlanRoutes } from './mealPlanRoutes.js';
import { searchRecipesByKeyword, searchRecipesByMaxMatching, searchRecipesByMinMissing} 
    from '../../services/searchRecipeServices.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

export const router = express.Router();

router.use('/favorites', favRecipeRoutes);
router.use('/meal-plan', mealPlanRoutes);

router.use(verifyToken);

// SEARCH RECIPES
router.get('/search-keyword', (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        searchRecipesByMaxMatching(uid, page, limit)
            .then((recipes) => { res.json(recipes) });
    } catch (error) {
        console.error("Error searching recipes by most matching:", error);
        res.status(500).json({ error: "An error occurred while fetching recipes." });
    }
});

router.get('/search-least-missing', (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        searchRecipesByMinMissing(uid, page, limit)
            .then((recipes) => { res.json(recipes) });
    } catch (error) {
        console.error("Error searching recipes by least missing:", error);
        res.status(500).json({ error: "An error occurred while fetching recipes." });
    }
});


