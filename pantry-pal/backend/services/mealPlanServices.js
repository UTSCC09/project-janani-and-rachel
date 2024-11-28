import { parse } from 'path';
import { db } from '../config/firebase.js';
import { addToPantry, addToShoppingList, modifyInPantry, modifyInShoppingList } from './ingredientServices.js';

export async function getMealPlan(uid, limit=10, lastVisibleMealId=null) {
    try {
        // return meals in the meal plan sorted by date
        const mealPlanRef = db.collection('Users').doc(uid).collection('MealPlan');
        let q = mealPlanRef.orderBy('date').limit(limit);

        if (lastVisibleMealId) {
            // retrieve the last visible meal plan if it exists
            const lastVisibleDoc = await mealPlanRef.doc(lastVisibleMealId).get();
            if (lastVisibleDoc.exists) {
                limit=parseInt(limit);
                q = mealPlanRef.orderBy('date').startAfter(lastVisibleDoc).limit(limit);
            }
        }

        const mealPlanSnapshot = await q.get();
        console.log("Fetching meal plan:", mealPlanSnapshot.size);

        if (mealPlanSnapshot.empty) {
            return [];
        }

        const mealPlan = await Promise.all(mealPlanSnapshot.docs.map(async (doc) => {
            const { recipe, ...data } = doc.data();
            const recipeDoc = await recipe.get();
            return { ...data, recipe: recipeDoc.data() };
        }));

        const newLastVisible = mealPlanSnapshot.docs[mealPlanSnapshot.docs.length - 1].id;

        return {
            mealPlan,
            lastVisible: newLastVisible
        };
    } catch (error) {
        console.error("Error fetching meal plan:", error);
        throw error;
    }
};

export async function getMealById(uid, mealId) {
    try {
        const mealPlanRef = db.collection('Users').doc(uid).collection('MealPlan').doc(mealId);
        const mealPlanDoc = await mealPlanRef.get();
        if (!mealPlanDoc.exists) {
            throw { status: 404, message: "Meal plan not found." };
        }

        const mealPlanData = mealPlanDoc.data();
        const recipeDoc = await mealPlanData.recipe.get();
        return { ...mealPlanData, recipe: recipeDoc.data() };
    } catch (error) {
        console.error("Error fetching meal plan by id:", error);
        throw error;
    }
}

export async function addRecipeToMealPlan(uid, recipeId, ingredients=[], date=new Date()) {
    recipeId = String(recipeId);

    try {
        // add recipe to meal plan
        console.log("Adding recipe to meal plan:", recipeId, ingredients, date);
        const mealPlanRef = db.collection('Users').doc(uid).collection('MealPlan').doc();
        const recipeRef = db.collection('Recipes').doc(recipeId);
        const pantryIngredients = await ingredients.filter((ingredient) => ingredient.inPantry).map((ingredient) => ingredient.ingredientName); 
        const shoppingListIngredients = await ingredients.filter((ingredient) => !ingredient.inPantry).map((ingredient) => ingredient.ingredientName);
        await mealPlanRef.set({ 
            recipe: recipeRef, 
            pantryIngredients, 
            shoppingListIngredients, 
            date, 
            mealId: mealPlanRef.id 
        });

        // update planned status and meal plan references in favourite recipes
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
        // keep track of frozen ingredients
        let frozenIngredients = [];
        const pantryRef = db.collection('Users').doc(uid).collection('Pantry');
        const shoppingListRef = db.collection('Users').doc(uid).collection('ShoppingList');
        await Promise.all(ingredients.map(async (ingredient) => {
            if (ingredient.inPantry) {
                // check if ingredient exists in pantry
                const pantryIngredient = await pantryRef.doc(ingredient.ingredientName).get();
                if (pantryIngredient.exists) {
                    // add meal plan reference to pantry ingredient
                    const pantryData = pantryIngredient.data();
                    await pantryRef.doc(ingredient.ingredientName).update({
                        mealPlans: [...(pantryData.mealPlans || []), mealPlanRef.id]
                    });
                    // if ingredient is frozen, add to frozen ingredients list
                    if (pantryData.frozen) {
                        frozenIngredients.push(ingredient.ingredientName);
                    }
                } else { // ingredient doesn't already exist in pantry so add it
                    await addToPantry(
                        uid,
                        ingredient.ingredientName,
                        Date(),
                        null, // expiration date
                        false, // not frozen
                        [mealPlanRef.id]
                    );
                }
            } else { // put ingredient in shopping list
                // check if ingredient exists in shopping list
                const shoppingListIngredient = await shoppingListRef.doc(ingredient.ingredientName).get();
                if (shoppingListIngredient.exists) {
                    // add meal plan reference to shopping list ingredient
                    const shoppingListData = shoppingListIngredient.data();
                    await shoppingListRef.doc(ingredient.ingredientName).update({
                        mealPlans: [...(shoppingListData.mealPlans || []), mealPlanRef.id]
                    });
                } else { // ingredient doesn't already exist in shopping list so add it
                    await addToShoppingList(
                        uid,
                        ingredient.ingredientName,
                        [mealPlanRef.id]
                    );
                }
            }
        }));
        // add frozen ingredients to meal plan
        await mealPlanRef.update({ frozenIngredients });
        
        return { 
            mealId: mealPlanRef.id, 
            recipeId, 
            pantryIngredients, 
            shoppingListIngredients, 
            frozenIngredients, 
            date 
        };
    } catch (error) {
        console.error("Error adding recipe to meal plan:", error);
        throw error;
    }
}

export async function removeRecipeFromMealPlan(uid, mealId) {
    mealId = String(mealId);

    try {
        // remove recipe from meal plan
        console.log("Removing recipe from meal plan:", mealId);
        const mealPlanRef = db.collection('Users').doc(uid).collection('MealPlan').doc(mealId);
        const mealPlanDoc = await mealPlanRef.get();
        if (!mealPlanDoc.exists) {
            throw { status: 404, message: "Meal plan not found." };
        }

        const { recipe, pantryIngredients, shoppingListIngredients, frozenIngredients, date } = mealPlanDoc.data();
        await mealPlanRef.delete();

        // update favorite recipe's planned status and meal plan reference
        const recipeRef = db.collection('Recipes').doc(recipe.id);
        const favRecipeRef = db.collection('Users').doc(uid).collection('FavRecipes').doc(recipeRef.id);
        const favRecipeDoc = await favRecipeRef.get();
        if (favRecipeDoc.exists) {
            const favRecipeData = favRecipeDoc.data();
            const favRecipeMealPlans = favRecipeData.mealPlans.filter((mp) => mp !== mealId)
            await favRecipeRef.update({
                planned: (favRecipeMealPlans.length > 0),
                mealPlans: favRecipeMealPlans
            });
        }

        // remove link to this meal in the pantry or shopping list
        const pantryRef = db.collection('Users').doc(uid).collection('Pantry');
        const shoppingListRef = db.collection('Users').doc(uid).collection('ShoppingList');
        await Promise.all(pantryIngredients.map(async (ingredientName) => {
            const pantryIngredient = await pantryRef.doc(ingredientName).get();
            if (pantryIngredient.exists) {
                const pantryData = pantryIngredient.data();
                await pantryIngredient.ref.update({
                    mealPlans: pantryData.mealPlans.filter((mp) => mp !== mealId)
                });
            }
        }));
        await Promise.all(shoppingListIngredients.map(async (ingredientName) => {
            const shoppingListIngredient = await shoppingListRef.doc(ingredientName).get();
            if (shoppingListIngredient.exists) {
                const shoppingListData = shoppingListIngredient.data();
                await shoppingListIngredient.ref.update({
                    mealPlans: shoppingListData.mealPlans.filter((mp) => mp !== mealId)
                });
            }
        }));

        return { mealId, recipeId: recipe.id, pantryIngredients, shoppingListIngredients, frozenIngredients, date };
    }
    catch (error) {
        console.error("Error removing recipe from meal plan:", error);
        throw error;
    }
};

