import express from 'express';
import { getPantry, addToPantry, removeFromPantry, modifyInPantry }  
    from '../services/ingredientServices.js';
import { getShoppingList, addToShoppingList, removeFromShoppingCart, modifyInShoppingCart } 
    from '../services/ingredientServices.js';

export const router = express.Router();

router.get('/pantry', (req, res, next) => {
    const uid = 'Janani'; // for testing purposes
    const limit = parseInt(req.query.limit) || 10;
    const lastVisibleIngredient = req.query.lastVisibleIngredient || null;
    getPantry(uid, limit, lastVisibleIngredient).then((pantry) => {
        res.json(pantry);
    }).catch((error) => {
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while fetching pantry." });
    });
});

router.post('/pantry', (req, res, next) => {
    const uid = 'Janani'; // for testing purposes
    const { ingredientName, purchaseDate, expirationDate, frozen } = req.body;
    addToPantry(uid, ingredientName, purchaseDate, expirationDate, frozen).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while adding to pantry." });
    });
});

router.patch('/pantry', (req, res, next) => {
    const uid = 'Janani'; // for testing purposes
    modifyInPantry(uid, req.body).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while modifying in pantry." });
    });
});

router.delete('/pantry/:ingredientName', (req, res, next) => {
    const uid = 'Janani'; // for testing purposes
    const ingredientName = req.params.ingredientName;
    removeFromPantry(uid, ingredientName).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while removing from pantry." });
    });
});

router.get('/shopping-list', (req, res, next) => {
    const uid = 'Janani'; // for testing purposes
    const limit = parseInt(req.query.limit) || 10;
    const lastVisibleIngredient = req.query.lastVisibleIngredient || null;
    getShoppingList(uid, limit, lastVisibleIngredient).then((shoppingList) => {
        res.json(shoppingList);
    }).catch((error) => {
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while fetching shopping list." });
    });
});

router.post('/shopping-list', (req, res, next) => {
    const uid = 'Janani'; // for testing purposes
    const { ingredientName } = req.body;
    addToShoppingList(uid, ingredientName).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while adding to shopping list." });
    });
});

router.patch('/shopping-list', (req, res, next) => {
    const uid = 'Janani'; // for testing purposes
    modifyInShoppingCart(uid, req.body).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while modifying in shopping list." });
    });
});

router.delete('/shopping-list/:ingredientName', (req, res, next) => {
    const uid = 'Janani'; // for testing purposes
    const ingredientName = req.params.ingredientName;
    removeFromShoppingCart(uid, ingredientName).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while removing from shopping list." });
    });
});
