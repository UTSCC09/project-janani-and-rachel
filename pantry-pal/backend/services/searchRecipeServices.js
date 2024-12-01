const spoonacularAPI = "https://api.spoonacular.com/";
const spoonacularKey = process.env.SPOONACULAR_API_KEY;

import { getPantry } from './ingredientServices.js';
import { getPantryForGroup } from './groupServices.js';


async function getPantryIngredients(uid) {
    try {
      const pantry = await getPantry(uid, 1000);
      if (pantry.ingredients && pantry.ingredients.length > 0) {
        return pantry.ingredients.map((ingredient) => ingredient.ingredientName);
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching pantry ingredients:", error);
      return [];
    }
}

async function getPantryIngredientsForGroup(uid, groupId) {
    try {
        const pantrys = await getPantryForGroup(uid, groupId);
        if (pantrys && pantrys.length > 0) {
            const allIngredients = [];
            pantrys.forEach(({ uid, pantry }) => {
                pantry.forEach((ingredient) => {
                    if (ingredient.ingredientName) {
                        allIngredients.push(ingredient.ingredientName);
                    }
                });
            });
            return allIngredients;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching pantry ingredients:", error);
        return [];
    }
}



function formatRecipes(data) {
    // want to return array of recipes
    // each entry in array contains 
        // recipe id
        // recipe name
        // used ingredient count
        // missing ingredient count
        // used ingredient list
            // name of ingredient 
        // missing ingredient list
            // name of ingredient
        // recipe instructions as array
            // step number
            // step instruction
        // recipe cource url
    const recipes = data.results;
    return recipes.map((recipe) => {
        const simpleStringReplacementSchema = /[^a-zA-Z0-9 &()'-,]/g;
        const complexStringReplacementSchema = /[^a-zA-Z0-9 $*&()';:.,/!-]/g;

        const missedIngredients = recipe.missedIngredients.map((ingredient) => 
            ingredient.name.replace(simpleStringReplacementSchema, '')
        );
        const ingredients = recipe.extendedIngredients.map((ingredient) => 
            ingredient.name.replace(simpleStringReplacementSchema, '')
        );
        let instructions = [];
        if (recipe.analyzedInstructions.length > 0) {
            instructions = recipe.analyzedInstructions[0].steps.map((step) => {
                return {
                    number: step.number,
                    step: step.step.replace(complexStringReplacementSchema, '')
                };
            });
        }
        let nutrition = null;
        if (recipe.nutrition) {
            nutrition = {
                nutrients: recipe.nutrition.nutrients.map((nutrient) => {
                    return {
                        name: nutrient.name.replace(simpleStringReplacementSchema, ''),
                        amount: nutrient.amount,
                        unit: nutrient.unit.replace(simpleStringReplacementSchema, ''),
                        percentOfDailyNeeds: nutrient.percentOfDailyNeeds,
                    };
                }),
                caloricBreakdown: recipe.nutrition.caloricBreakdown
            };
        }
        const formattedRecipe = {
            recipeId: recipe.id,
            recipeName: recipe.title,
            missedIngredientCount: recipe.missedIngredientCount,
            missedIngredients,
            totalIngredientCount: ingredients.length,
            ingredients,
            instructions,
            sourceUrl: recipe.sourceUrl,
            nutrition
        };
        return formattedRecipe;
    });
}

export async function searchRecipesByKeyword(keyword, page=1, lim=10) {
    const url = `${spoonacularAPI}recipes/complexSearch?apiKey=${spoonacularKey}&query=${keyword}` +
        `&number=${lim}&offset=${(page-1) * lim}&instructionsRequired=true&sort=popularity` +
        `&addRecipeInformation=true&addRecipeInstructions=true&fillIngredients=true&ignorePantry=false` +
        `&addRecipeNutrition=true`;

    try {
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch recipes');
        }
        const data = await response.json();
        const recipes = formatRecipes(data);
        return recipes;
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return [];  
    }
}

export async function searchRecipesByMaxMatching(uid, page=1, lim=10) {
    const pantryIngredients = await getPantryIngredients(uid);
    const url = `${spoonacularAPI}recipes/complexSearch?apiKey=${spoonacularKey}&sort=max-used-ingredients` +
        `&number=${lim}&offset=${(page-1) * lim}&instructionsRequired=true&fillIngredients=true` +
        `&includeIngredients=${pantryIngredients.join(",")}&addRecipeInformation=true&addRecipeInstructions=true` +
        `&addRecipeNutrition=true&ignorePantry=false`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch recipes');
        }
        const data = await response.json();
        const recipes = formatRecipes(data);
        return recipes;
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return [];  
    }
}

export async function searchRecipesByMinMissing(uid, page=1, lim=10) {
    const pantryIngredients = await getPantryIngredients(uid);
    const url = `${spoonacularAPI}recipes/complexSearch?apiKey=${spoonacularKey}&sort=min-missing-ingredients` +
        `&number=${lim}&offset=${(page-1) * lim}&instructionsRequired=true&fillIngredients=true` +
        `&includeIngredients=${pantryIngredients.join(",")}&addRecipeInformation=true&addRecipeInstructions=true` +
        `&addRecipeNutrition=true&ignorePantry=false`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch recipes');
        }
        const data = await response.json();
        const recipes = formatRecipes(data);
        return recipes;
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return [];  
    }
}

export async function searchRecipesByMaxMatchingForGroup(uid, groupId, page=1, lim=10) {
    const pantryIngredients = await getPantryIngredientsForGroup(uid, groupId);
    const url = `${spoonacularAPI}recipes/complexSearch?apiKey=${spoonacularKey}&sort=max-used-ingredients` +
        `&number=${lim}&offset=${(page-1) * lim}&instructionsRequired=true&fillIngredients=true` +
        `&includeIngredients=${pantryIngredients.join(",")}&addRecipeInformation=true&addRecipeInstructions=true` +
        `&addRecipeNutrition=true&ignorePantry=false`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch recipes');
        }
        const data = await response.json();
        const recipes = formatRecipes(data);
        return recipes;
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return [];  
    }
}
