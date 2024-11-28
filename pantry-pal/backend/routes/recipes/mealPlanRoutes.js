import express from 'express';
import { getMealPlan, getMealById, addRecipeToMealPlan, removeRecipeFromMealPlan } 
    from '../../services/mealPlanServices.js';  
import { addMealReminders, addThisWeeksMealReminders } from '../../services/reminderServices.js';
import { verifyToken } from '../../middleware/authMiddleware.js';
import { sanitizeAndValidateMeal, sanitizeAndValidateGetMealQuery } from '../../validators/mealValidator.js';

export const router = express.Router();
router.use(verifyToken);

router.get('/', sanitizeAndValidateGetMealQuery, (req, res, next) => {
    // get all recipes in the meal plan
    const uid = req.uid;
    const { limit, lastVisibleMealId } = req.query;
    getMealPlan(uid, limit, lastVisibleMealId)
        .then((recipes) => {
            return res.status(200).json(recipes);
        }).catch((error) => {
            console.error("Error fetching meal plan:", error);
            res.status(error.status || 500)
                .json({ error: error.message || "An error occurred while fetching meal plan." });
        });
});

router.get('/:mealId', (req, res, next) => {
    const uid = req.uid;
    const mealId = req.params.mealId;
    getMealById(uid, mealId)
        .then((recipe) => {
            return res.status(200).json(recipe);
        }).catch((error) => {
            console.error("Error fetching meal plan by id:", error);
            res.status(error.status || 500)
                .json({ error: error.message || "An error occurred while fetching meal plan by id." });
        });
});

router.post('/', sanitizeAndValidateMeal, (req, res, next) => {
    // add a recipe to the meal plan
    const uid = req.uid;
    const { recipeId, ingredients, date } = req.body;
    if (!recipeId || !ingredients) {
        return res.status(400).json({ error: "Missing recipeId or ingredients." });
    }
    addRecipeToMealPlan(uid, recipeId, ingredients, date)
        .then((recipe) => {
            return res.status(200).json(recipe);
        }).catch((error) => {
            console.error("Error adding recipe to meal plan:", error);
            res.status(error.status || 500)
                .json({ error: error.message || "An error occurred while adding recipe to meal plan." });
        });
});

router.delete('/:recipeId', (req, res, next) => {
    // remove a recipe from the meal plan
    const uid = req.uid;
    const recipeId = req.params.recipeId;
    removeRecipeFromMealPlan(uid, recipeId)
        .then((recipe) => {
            return res.status(200).json(recipe);
        }).catch((error) => {
            console.error("Error removing recipe from meal plan:", error);
            res.status(error.status || 500)
                .json({ error: error.message || "An error occurred while removing recipe from meal plan." });
        });

});

// add reminder for all meals this week 
router.post('/reminders', (req, res, next) => {
    // add reminders for all meals in the meal plan
    const uid = req.uid;
    const googleAccessToken = req.headers['googleaccesstoken'];
    if (!googleAccessToken) {
        return res.status(401).json({ error: "Google access token required." });
    }
    try {
        const daysInAdvanceDefrost = parseInt(req.query.daysInAdvanceDefrost) || 1;
        const daysInAdvanceBuy = parseInt(req.query.daysInAdvanceBuy) || 3;
        
        addThisWeeksMealReminders(uid, googleAccessToken, daysInAdvanceDefrost, daysInAdvanceBuy)
        .then(() => {
            return res.status(200).json({ message: "Reminders added successfully." });
        }).catch((error) => {
            console.error("Error adding reminders:", error);
            res.status(error.status || 500)
                .json({ error: error.message || "An error occurred while adding reminders." });
        });
    } catch (error) {
        console.error("Error adding reminders:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while adding reminders." });
    }
});

// and also a add reminders to tasks
router.post('/:mealId/reminders', (req, res, next) => {
    const uid = req.uid;
    const googleAccessToken = req.headers['googleaccesstoken'];
    if (!req.params.mealId) {
        return res.status(400).json({ error: "Missing mealId." });
    }
    if (!googleAccessToken) {
        return res.status(401).json({ error: "Google access token required." });
    }
    const daysInAdvanceDefrost = parseInt(req.query.daysInAdvanceDefrost) || 1;
    const daysInAdvanceBuy = parseInt(req.query.daysInAdvanceBuy) || 3;
    addMealReminders(uid, req.params.mealId, googleAccessToken, daysInAdvanceDefrost, daysInAdvanceBuy)
        .then(() => {
            return res.status(200).json({ message: "Reminders added successfully." });
        }).catch((error) => {
            console.error("Error adding reminders:", error);
            res.status(error.status || 500)
                .json({ error: error.message || "An error occurred while adding reminders." });
        });
});
