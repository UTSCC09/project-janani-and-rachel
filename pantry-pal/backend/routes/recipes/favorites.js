// backend/routes/recipes.js
// this route is for real time sharing of recipes between users
// might need to import collection, getDocs from 'firebase/firestore/lite';
import express from 'express';
import { getFavRecipes, getPlannedFavRecipes, getUnPlannedFavRecipes, getFavRecipeById } 
from '../../services/favRecipeServices.js'; 

export const router = express.Router();

// Route to get all favorited recipes
router.get('/', (req, res, next) => {
    getFavRecipes("Janani")
        .then((recipes) => {
            return res.status(200).json(recipes);
        });

});

// Route to planned recipes
router.get('/planned', (req, res, next) => {
    getPlannedFavRecipes("Janani")
        .then((recipes) => {
            return res.status(200).json(recipes);
        });
});

router.get('/unplanned', (req, res, next) => {
    getUnPlannedFavRecipes("Janani")
        .then((recipes) => {
            return res.status(200).json(recipes);
        });
});

// Route to get a specific recipe by id
router.get('/:recipeId', (req, res, next) => {
    getFavRecipeById("Janani", req.params.recipeId)
        .then((recipe) => {
            return res.status(200).json(recipe);
        });
});


// Route to add a recipe to favorites
router.post('/', (req, res, next) => {
    // add recipe to favorites
    // req.body formated as response from search recipes
    
});
