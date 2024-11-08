import express from 'express';
import { getIngredients, getPantry, addToPantry, removeFromPantry }  
    from '../services/ingredientServices.js';
import { getShoppingList, addToShoppingCart, removeFromShoppingCart } 
    from '../services/ingredientServices.js';

export const router = express.Router();

router.get('/', (req, res, next) => {
    const uid = 'janani_gurram'; // for testing purposes
    getIngredients(uid).then((ingredients) => {
        res.json(ingredients);
    }).catch((error) => {
        console.error("Error getting ingredients: ", error);
    });
});

router.get('/pantry', (req, res, next) => {
    const uid = 'janani_gurram'; // for testing purposes
    getPantry(uid).then((pantry) => {
        res.json(pantry);
    }).catch((error) => {
        console.error("Error getting pantry: ", error);
    });
});

router.post('/pantry', (req, res, next) => {
    const uid = 'janani_gurram'; // for testing purposes
    const { name, purchaseDate, expirationDate, quantity, unit, frozen } = req.body;
    addToPantry(uid, name, purchaseDate, expirationDate, quantity, unit, frozen).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        console.error("Error adding to pantry: ", error);
    });
});

router.delete('/pantry', (req, res, next) => {
    const uid = 'janani_gurram'; // for testing purposes
    const name = req.body.name;
    removeFromPantry(uid, name).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        console.error("Error removing from pantry: ", error);
    });
});

router.get('/shoppingList', (req, res, next) => {
    const uid = 'janani_gurram'; // for testing purposes
    getShoppingList(uid).then((shoppingList) => {
        res.json(shoppingList);
    }).catch((error) => {
        console.error("Error getting shopping list: ", error);
    });
});

router.post('/shoppingList', (req, res, next) => {
    const uid = 'janani_gurram'; // for testing purposes
    const { name, quantity, unit } = req.body;
    addToShoppingCart(uid, name, quantity, unit).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        console.error("Error adding to shopping list: ", error);
    });
});

router.delete('/shoppingList', (req, res, next) => {
    const uid = 'janani_gurram'; // for testing purposes
    const name = req.body.name;
    removeFromShoppingCart(uid, name).then((ingredient) => {
        res.json(ingredient);
    }).catch((error) => {
        console.error("Error removing from shopping list: ", error);
    });
});