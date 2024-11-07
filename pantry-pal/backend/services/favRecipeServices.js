import { db } from '../config/firebase.js';

export function getFavRecipes(uid){
    return { 
        name: "Spagetti",
        ingredients: {
            pasta: {
                quantity: "10",
                units: "g",
                purchaseDate: Date(),
                expirationDate: Date(),
                frozen: false
            }
        },
        directions: "boil water, put pasta in, done!",
    };
};
// specify the properties to be returned for each recipe
export function getFavRecipesProperties(uid){};
export function getPlannedFavRecipes(uid){};
export function getUnPlannedFavRecipes(uid){};
export function getFavRecipeById(uid){};
