import { db } from '../config/firebase.js';
import { addToPantry, addToShoppingList, modifyInPantry, modifyInShoppingList } from './ingredientServices.js';

export async function getMealPlan(uid) {
    try {
        const mealPlanRef = db.collection('Users').doc(uid).collection('MealPlan');
        const mealPlanSnapshot = await mealPlanRef.get();
        console.log("Fetching meal plan:", mealPlanSnapshot.size);

        if (mealPlanSnapshot.empty) {
            return [];
        }

        const mealPlan = await Promise.all(mealPlanSnapshot.docs.map(async (doc) => {
            const { recipe, ...data } = doc.data();
            const recipeDoc = await recipe.get();
            return { ...data, recipe: recipeDoc.data() };
        }));

        return mealPlan;
    } catch (error) {
        console.error("Error fetching meal plan:", error);
        throw error;
    }
};

export async function addRecipeToMealPlan(uid, recipeId, ingredients, date=new Date()) {
    recipeId = String(recipeId);

    try {
        // add recipe to meal plan
        console.log("Adding recipe to meal plan:", recipeId, ingredients, date);
        const mealPlanRef = db.collection('Users').doc(uid).collection('MealPlan').doc();
        const recipeRef = db.collection('Recipes').doc(recipeId);
        await mealPlanRef.set({ recipe: recipeRef, ingredients, date });

        // update favorite recipe's planned status and meal plan reference
        const favRecipeRef = db.collection('Users').doc(uid).collection('FavRecipes').doc(recipeId);
        const favRecipeDoc = await favRecipeRef.get();
        if (favRecipeDoc.exists) {
            const favRecipeData = favRecipeDoc.data();
            await favRecipeRef.update({
                planned: true,
                mealPlans: [...(favRecipeData.mealPlans || []), mealPlanRef.id]
            });
        }

        // add ingredients to pantry or shopping list asynchronously
        await Promise.all(ingredients.map(async (ingredient) => {
            if (ingredient.inPantry) {
                try {
                    // try to modify the ingredient in the pantry
                    await modifyInPantry(uid, {
                        ingredientName: ingredient.ingredientName,
                        mealPlans: [mealPlanRef.id]
                    });
                } catch (error) {
                    if (error.status === 404) {
                        // if not found, add it to the pantry
                        await addToPantry(
                            uid,
                            ingredient.ingredientName,
                            Date(),
                            null, // expiration date
                            false, // not frozen
                            [mealPlanRef.id]
                        );
                    } else {
                        throw error;
                    }
                }
            } else {
                try {
                    // try to modify the ingredient in the shopping list
                    await modifyInShoppingList(uid, {
                        ingredientName: ingredient.ingredientName,
                        mealPlans: [mealPlanRef.id]
                    });
                } catch (error) {
                    if (error.status === 404) {
                        // If not found, add it to the shopping list
                        await addToShoppingList(
                            uid,
                            ingredient.ingredientName,
                            [mealPlanRef.id]
                        );
                    } else {
                        throw error;
                    }
                }
            }
        }));
    return { recipeId, ingredients, date };
    } catch (error) {
        console.error("Error adding recipe to meal plan:", error);
        throw error;
    }
}
