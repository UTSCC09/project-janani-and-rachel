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
        console.error("Error getting pantry: ", error);
    });
});

router.post('/pantry', (req, res, next) => {
    const uid = 'Janani'; // for testing purposes
    const { ingredientName, purchaseDate, expirationDate, frozen } = req.body;
    addToPantry(uid, ingredientName, purchaseDate, expirationDate, frozen).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        console.error("Error adding to pantry: ", error);
    });
});

router.patch('/pantry', (req, res, next) => {
    const uid = 'Janani'; // for testing purposes
    modifyInPantry(uid, req.body).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        console.error("Error modifying in pantry: ", error);
    });
});

router.delete('/pantry', (req, res, next) => {
    const uid = 'Janani'; // for testing purposes
    const ingredientName = req.body.ingredientName;
    removeFromPantry(uid, ingredientName).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        console.error("Error removing from pantry: ", error);
    });
});

router.get('/shoppingList', (req, res, next) => {
    const uid = 'Janani'; // for testing purposes
    getShoppingList(uid).then((shoppingList) => {
        res.json(shoppingList);
    }).catch((error) => {
        console.error("Error getting shopping list: ", error);
    });
});

router.post('/shoppingList', (req, res, next) => {
    const uid = 'Janani'; // for testing purposes
    const { ingredientName } = req.body;
    addToShoppingList(uid, ingredientName).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        console.error("Error adding to shopping list: ", error);
    });
});

router.patch('/shoppingList', (req, res, next) => {
    const uid = 'Janani'; // for testing purposes
    modifyInShoppingCart(uid, req.body).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        console.error("Error modifying in shopping list: ", error);
    });
});

router.delete('/shoppingList', (req, res, next) => {
    const uid = 'Janani'; // for testing purposes
    const ingredientName = req.body.ingredientName;
    removeFromShoppingCart(uid, ingredientName).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        console.error("Error removing from shopping list: ", error);
    });
});