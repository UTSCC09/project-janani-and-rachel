import { db } from '../config/firebase.js';

export function getFavRecipes(uid) {
    return new Promise((resolve, reject) => {
        // Simulate fetching data from Firebase
        const recipes = { 
            name: "Spaghetti",
            ingredients: {
                pasta: {
                    quantity: "10",
                    units: "g",
                    purchaseDate: new Date(),
                    expirationDate: new Date(),
                    frozen: false
                }
            },
            directions: "boil water, put pasta in, done!",
        };
        resolve(recipes);
    });
}

// specify the properties to be returned for each recipe
function getFavRecipesProperties(uid) {};
function getPlannedFavRecipes(uid) {};
function getUnPlannedFavRecipes(uid) {};
function getFavRecipeById(uid) {};

export { getFavRecipesProperties, getPlannedFavRecipes, getUnPlannedFavRecipes, getFavRecipeById };