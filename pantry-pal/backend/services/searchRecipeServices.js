const spoonacularAPI = "https://api.spoonacular.com/";
const spoonacularKey = process.env.SPOONACULAR_API_KEY;

import { getPantry } from './ingredientServices.js';

const pantryIngredients = await getPantryIngredients("Janani");

async function getPantryIngredients(uid) {
    try {
      const pantry = await getPantry(uid);
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
        const missedIngredients = recipe.missedIngredients.map((ingredient) => ingredient.name);
        const ingredients = recipe.extendedIngredients.map((ingredient) => ingredient.name);
        let instructions = [];
        if (recipe.analyzedInstructions.length > 0) {
            instructions = recipe.analyzedInstructions[0].steps.map((step) => {
                return {
                    number: step.number,
                    step: step.step
                };
            });
        }
        const formattedRecipe = {
            recipeId: recipe.id,
            recipeName: recipe.title,
            missedIngredientCount: recipe.missedIngredientCount,
            missedIngredients: missedIngredients,
            totalIngredientCount: ingredients.length,
            ingredients: ingredients,
            instructions: instructions,
            sourceUrl: recipe.sourceUrl
        };
        return formattedRecipe;
    });
}


export async function searchRecipesByKeyword(keyword, page=0, lim=10) {
    const url = `${spoonacularAPI}recipes/complexSearch?apiKey=${spoonacularKey}&query=${keyword}` +
        `&number=${lim}&offset=${page * lim}&instructionsRequired=true&fillIngredients=true` +
        `&includeIngredients=${pantryIngredients.join(",")}&addRecipeInformation=true&addRecipeInstructions=true`;
    
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

export async function searchRecipesByMaxMatching(page=0, lim=10) {
    const url = `${spoonacularAPI}recipes/complexSearch?apiKey=${spoonacularKey}&sort=max-used-ingredients` +
        `&number=${lim}&offset=${page * lim}&instructionsRequired=true&fillIngredients=true` +
        `&includeIngredients=${pantryIngredients.join(",")}&addRecipeInformation=true&addRecipeInstructions=true`;
    console.log(url);
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

export async function searchRecipesByMinMissing(page=0, lim=10) {
    const url = `${spoonacularAPI}recipes/complexSearch?apiKey=${spoonacularKey}&sort=min-missing-ingredients` +
        `&number=${lim}&offset=${page * lim}&instructionsRequired=true&fillIngredients=true` +
        `&includeIngredients=${pantryIngredients.join(",")}&addRecipeInformation=true&addRecipeInstructions=true`;
    console.log(url);
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

