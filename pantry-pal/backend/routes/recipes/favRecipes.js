// backend/routes/recipes.js
// this route is for real time sharing of recipes between users
// might need to import collection, getDocs from 'firebase/firestore/lite';
import express from 'express';
import { getFavRecipes, getPlannedFavRecipes, getUnPlannedFavRecipes, getFavRecipeById, addFavRecipe, removeFavRecipe } 
from '../../services/favRecipeServices.js'; 

export const router = express.Router();

// Route to get all favorited recipes
router.get('/', (req, res, next) => {
    const uid = "Janani";
    const { limit=10, lastVisible=null } = req.query;
    getFavRecipes(uid, limit, lastVisible)
        .then((recipes) => {
            return res.status(200).json(recipes);
        }).catch((error) => {
            console.error("Error fetching favorite recipes:", error);
            res.status(error.status || 500)
                .json({ error: error.message || "An error occurred while fetching favorite recipes." });
        });

});

// Route to planned recipes
router.get('/planned', (req, res, next) => {
    const uid = "Janani";
    const { limit=10, lastVisible=null } = req.query;
    getPlannedFavRecipes(uid, limit, lastVisible)
        .then((recipes) => {
            return res.status(200).json(recipes);
        }).catch((error) => {
            console.error("Error fetching planned favorite recipes:", error);
            res.status(error.status || 500)
                .json({ error: error.message || "An error occurred while fetching planned favorite recipes." });
        });
});

router.get('/unplanned', (req, res, next) => {
    const uid = "Janani";
    const { limit=10, lastVisible=null } = req.query;
    getUnPlannedFavRecipes(uid, limit, lastVisible)
        .then((recipes) => {
            return res.status(200).json(recipes);
        }).catch((error) => {
            console.error("Error fetching unplanned favorite recipes:", error);
            res.status(error.status || 500)
                .json({ error: error.message || "An error occurred while fetching unplanned favorite recipes." });
        });
});

router.get('/:recipeId', async (req, res) => {
    if (!req.params.recipeId) {
        return res.status(400).json({ error: "Recipe ID is required." });
    }
    getFavRecipeById("Janani", req.params.recipeId)
        .then((recipe) => {
            return res.status(200).json(recipe);
        }).catch((error) => {
            res.status(error.status || 500)
                .json({ error: error.message || "An error occurred while fetching favorite recipe by ID." });
        });

});


router.post('/', (req, res, next) => {
    // add recipe to favorites
    const uid = "Janani";
    // req.body formated as response from search recipes
    addFavRecipe(uid, req.body)
        .then((recipe) => {
            return res.status(200).json(recipe);
        }).catch((error) => {
            console.error("Error adding recipe to favorites:", error);
            res.status(error.status || 500)
                .json({ error: error.message || "An error occurred while adding recipe to favorites." });
        });
});

router.delete('/:recipeId', (req, res, next) => {
    // remove recipe from favorites
    const uid = "Janani";
    if (!req.params.recipeId) {
        return res.status(400).json({ error: "Recipe ID is required." });
    }
    removeFavRecipe(uid, req.params.recipeId)
        .then((recipe) => {
            console.log("Recipe removed from favorites:", recipe);
            return res.status(200).json(recipe);
        }).catch((error) => {
            res.status(error.status || 500)
               .json({ error: error.message || "An error occurred while removing recipe from favorites." });
        });
});

