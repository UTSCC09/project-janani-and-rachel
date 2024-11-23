import express from 'express';
import { getPantry, addToPantry, removeFromPantry, modifyInPantry }  
    from '../services/ingredientServices.js';
import { getShoppingList, addToShoppingList, removeFromShoppingList, modifyInShoppingList } 
    from '../services/ingredientServices.js';
import { verifyToken } from '../middleware/authMiddleware.js';

export const router = express.Router();

router.use(verifyToken);

router.get('/pantry', (req, res, next) => {
    const uid = req.uid;
    const limit = parseInt(req.query.limit) || 10;
    const lastVisibleIngredient = req.query.lastVisibleIngredient || null;
    getPantry(uid, limit, lastVisibleIngredient).then((pantry) => {
        res.json(pantry);
    }).catch((error) => {
        console.error("Error fetching pantry:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while fetching pantry." });
    });
});

router.post('/pantry', (req, res, next) => {
    const uid = req.uid;
    const { ingredientName, purchaseDate, expirationDate, frozen, mealPlans } = req.body;
    addToPantry(uid, ingredientName, purchaseDate, expirationDate, frozen, mealPlans).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        console.error("Error adding to pantry:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while adding to pantry." });
    });
});

router.patch('/pantry', (req, res, next) => {
    const uid = req.uid;
    modifyInPantry(uid, req.body).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        console.error("Error modifying in pantry:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while modifying in pantry." });
    });
});

router.delete('/pantry/:ingredientName', (req, res, next) => {
    const uid = req.uid;
    const ingredientName = req.params.ingredientName;
    removeFromPantry(uid, ingredientName).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        console.error("Error removing from pantry:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while removing from pantry." });
    });
});

router.get('/shopping-list', (req, res, next) => {
    const uid = req.uid;
    const limit = parseInt(req.query.limit) || 10;
    const lastVisibleIngredient = req.query.lastVisibleIngredient || null;
    getShoppingList(uid, limit, lastVisibleIngredient).then((shoppingList) => {
        res.json(shoppingList);
    }).catch((error) => {
        console.error("Error fetching shopping list:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while fetching shopping list." });
    });
});

router.post('/shopping-list', (req, res, next) => {
    const uid = req.uid;
    const { ingredientName, mealPlans } = req.body;
    addToShoppingList(uid, ingredientName, mealPlans).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        console.error("Error adding to shopping list:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while adding to shopping list." });
    });
});

router.patch('/shopping-list', (req, res, next) => {
    const uid = req.uid;
    modifyInShoppingList(uid, req.body).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        console.error("Error modifying in shopping list:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while modifying in shopping list." });
    });
});

router.delete('/shopping-list/:ingredientName', (req, res, next) => {
    const uid = req.uid;
    const ingredientName = req.params.ingredientName;
    removeFromShoppingList(uid, ingredientName).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        console.error("Error removing from shopping list:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while removing from shopping list." });
    });
});
