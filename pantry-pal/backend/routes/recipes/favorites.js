// backend/routes/recipes.js
// this route is for real time sharing of recipes between users
// might need to import collection, getDocs from 'firebase/firestore/lite';
import express from 'express';
import { getFavRecipes, getPlannedFavRecipes, getUnPlannedFavRecipes, getFavRecipeById, addFavRecipe, removeFavRecipe } 
from '../../services/favRecipeServices.js'; 

export const router = express.Router();

// Route to get all favorited recipes
router.get('/', (req, res, next) => {
    const { limit, lastVisible } = req.query;
    getFavRecipes("Janani", limit, lastVisible)
        .then((recipes) => {
            return res.status(200).json(recipes);
        }).catch((error) => {
            console.error("Error fetching favorite recipes:", error);
            res.status(500).json({ error: "An error occurred while fetching favorite recipes." });
        });

});

// Route to planned recipes
router.get('/planned', (req, res, next) => {
    getPlannedFavRecipes("Janani")
        .then((recipes) => {
            return res.status(200).json(recipes);
        }).catch((error) => {
            console.error("Error fetching planned favorite recipes:", error);
            res.status(500).json({ error: "An error occurred while fetching planned favorite recipes." });
        });
});

router.get('/unplanned', (req, res, next) => {
    getUnPlannedFavRecipes("Janani")
        .then((recipes) => {
            return res.status(200).json(recipes);
        }).catch((error) => {
            console.error("Error fetching unplanned favorite recipes:", error);
            res.status(500).json({ error: "An error occurred while fetching unplanned favorite recipes." });
        });
});

router.get('/:recipeId', async (req, res) => {
    try {
        const recipe = await getFavRecipeById("Janani", req.params.recipeId);
        console.log(recipe);
        if (!recipe) {
            // Recipe not found
            return res.status(404).json({ error: "Recipe not found in favorites." });
        }

        // Recipe found, send it in the response
        res.status(200).json(recipe);

    } catch (error) {
        console.error("Error fetching favorite recipe by ID:", error);
        res.status(500).json({ error: "An error occurred while fetching favorite recipe." });
    }
});


// Route to add a recipe to favorites
router.post('/', (req, res, next) => {
    // add recipe to favorites
    // req.body formated as response from search recipes
    addFavRecipe("Janani", req.body)
        .then((recipe) => {
            return res.status(200).json(recipe);
        }).catch((error) => {
            console.error("Error adding recipe to favorites:", error);
            res.status(500).json({ error: "An error occurred while adding recipe to favorites." });
        });
});

router.delete('/:recipeId', (req, res, next) => {
    // remove recipe from favorites
    // req.body formated as response from search recipes
    removeFavRecipe("Janani", req.params.recipeId)
        .then((recipe) => {
            return res.status(200).json(recipe);
        }).catch((error) => {
            console.error("Error removing recipe from favorites:", error);
            res.status(500).json({ error: "An error occurred while removing recipe from favorites." });
        });
});

