// backend/routes/recipes.js
// this route is for real time sharing of recipes between users
// might need to import collection, getDocs from 'firebase/firestore/lite';
import express from 'express';
import { getFavRecipes, getPlannedFavRecipes, getUnPlannedFavRecipes, getFavRecipeById } 
from '../../services/favRecipeServices.js'; 

export const router = express.Router();

// Route to get all favorited recipes
router.get('/', (req, res, next) => {
    getFavRecipes("janani_gurram")
        .then((recipes) => {
            return res.status(200).json(recipes);
        });

});

// Route to planned recipes
router.get('/planned', (req, res, next) => {
    getPlannedFavRecipes("janani_gurram")
        .then((recipes) => {
            return res.status(200).json(recipes);
        });
});

router.get('/unplanned', (req, res, next) => {
    getUnPlannedFavRecipes("janani_gurram")
        .then((recipes) => {
            return res.status(200).json(recipes);
        });
});

// Route to get a specific recipe by id
router.get('/:recipeId', (req, res, next) => {
    getFavRecipeById("janani_gurram", req.params.recipeId)
        .then((recipe) => {
            return res.status(200).json(recipe);
        });
});