import { db } from '../config/firebase.js';
import { collection, doc, where, setDoc, getDocs, getDoc, deleteDoc, limit, orderBy, query, startAfter } from 'firebase/firestore';


async function getFavRecipes(uid, lim = 10, lastVisibleId = null) {    
    try {
        const recipesRef = collection(db, "Users", uid, "FavRecipes");
        let q = query(recipesRef, orderBy('recipeName'), limit(lim));

        if (lastVisibleId) {
            // Retrieve the lastVisible document snapshot using its ID
            const lastVisibleDoc = await getDoc(doc(recipesRef, lastVisibleId));
            if (lastVisibleDoc.exists()) {
                q = query(recipesRef, orderBy('recipeName'), startAfter(lastVisibleDoc), limit(lim));
            } else {
                console.warn("No document found for lastVisibleId:", lastVisibleId);
            }
        }

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("No more recipes in favorites for the specified page.");
            return {
                recipes: [],
                lastVisible: null
            };
        } else {
            const newLastVisible = snapshot.docs[snapshot.docs.length - 1];
            const recipes = snapshot.docs.map(doc => doc.data());
            return {
                recipes: recipes,
                lastVisible: newLastVisible.id
            };
        }
    } catch (error) {
        console.error("Error fetching paginated favorite recipes:", error);
        throw error;
    }
}

function getPlannedFavRecipes(uid, lim=10, lastVisibleRecipe=null) {

    return new Promise((resolve, reject) => {
        const recipesRef = collection(db, 'Users', uid, 'FavRecipes');
        
        // return is planned = true
        const plannedQuery = query(recipesRef, where('planned', '==', true), limit(lim));
        
        if (lastVisibleRecipe) {
            // Retrieve the lastVisible document snapshot using its ID
            const lastVisibleDoc = getDoc(doc(recipesRef, lastVisibleRecipe));
            if (lastVisibleDoc.exists()) {
                plannedQuery = query(recipesRef, where('planned', '==', true), startAfter(lastVisibleDoc), limit(lim));
            }
        }

        const get = getDocs(plannedQuery).then((snapshot) => {
            if (snapshot.empty) {
                console.log("No more planned recipes in favorites for the specified page.");
                resolve([]);
            } else {
                const newLastVisible = snapshot.docs[snapshot.docs.length - 1];
                const recipes = snapshot.docs.map(doc => (doc.data()));
                resolve({
                    recipes: recipes,
                    lastVisible: newLastVisible.id
                });
            }
        }).catch((error) => {
            console.error("Error fetching paginated planned favorite recipes:", error);
            reject(error);
        });
    });
}

function getUnPlannedFavRecipes(uid, lim=10, lastVisibleRecipe=null) {
    return new Promise((resolve, reject) => {
        const recipesRef = collection(db, 'Users', uid, 'FavRecipes');
        
        // return is planned = false
        const unplannedQuery = query(recipesRef, where('planned', '==', false), limit(lim));
        
        if (lastVisibleRecipe) {
            // Retrieve the lastVisible document snapshot using its ID
            const lastVisibleDoc = getDoc(doc(recipesRef, lastVisibleRecipe));
            if (lastVisibleDoc.exists()) {
                unplannedQuery = query(recipesRef, where('planned', '==', false), startAfter(lastVisibleDoc), limit(lim));
            }
        }

        const get = getDocs(unplannedQuery).then((snapshot) => {
            if (snapshot.empty) {
                console.log("No more unplanned recipes in favorites for the specified page.");
                resolve([]);
            } else {
                const newLastVisible = snapshot.docs[snapshot.docs.length - 1];
                const recipes = snapshot.docs.map(doc => (doc.data()));
                resolve({
                    recipes: recipes,
                    lastVisible: newLastVisible.id
                });
            }
        }).catch((error) => {
            console.error("Error fetching paginated unplanned favorite recipes:", error);
            reject(error);
        });
    });
};

async function getFavRecipeById(uid, recipeId) {
    try {
        const favRecipeRef = doc(db, 'Users', uid, 'FavRecipes', recipeId);
        const favRecipeDoc = await getDoc(favRecipeRef);

        if (!favRecipeDoc.exists()) {
            console.log("No such recipe in favorites!");
            return null;
        }

        const recipeRef = doc(db, 'Recipes', recipeId);
        const recipeDoc = await getDoc(recipeRef);

        if (!recipeDoc.exists()) {
            console.log("No such recipe found!");
            return null;
        }

        console.log("Recipe found in favorites!");
        return recipeDoc.data();

    } catch (error) {
        console.error("Error fetching favorite recipe by ID:", error);
        throw error;
    }
}

function addFavRecipe(uid, recipe) {
    return new Promise((resolve, reject) => {
        const favRecipeRef = doc(db, 'Users', uid, 'FavRecipes', String(recipe.recipeId));
        const recipeRef = doc(db, 'Recipes', String(recipe.recipeId)); // Updated line
        const favRecipeData = {
            recipeId: recipe.recipeId,
            recipeName: recipe.recipeName,
            planned: false,
            recipe: recipeRef
        };
        const recipeData = {
            recipeId: recipe.recipeId,
            recipeName: recipe.recipeName,
            totalIngredientCount: recipe.totalIngredientCount,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            sourceUrl: recipe.sourceUrl
        };

        setDoc(recipeRef, recipeData).then(() => {
            setDoc(favRecipeRef, favRecipeData).then(() => {
                console.log("Recipe added to favorites!");
                resolve(recipeData);
            }).catch((error) => {
                console.error("Error adding recipe to favorites:", error);
                reject(error);
            });
        }).catch((error) => {
            console.error("Error adding recipe to favorites:", error);
            reject(error);
        });
    });
}

function removeFavRecipe(uid, recipeId) {
    return new Promise((resolve, reject) => {
        const favRecipeRef = doc(db, 'Users', uid, 'FavRecipes', recipeId);
        deleteDoc(favRecipeRef).then(() => {
            console.log("Recipe removed from favorites!");
            resolve();
        }).catch((error) => {
            console.error("Error removing recipe from favorites:", error);
            reject(error);
        });
    });
}

export { getFavRecipes, getPlannedFavRecipes, getUnPlannedFavRecipes, getFavRecipeById, addFavRecipe, removeFavRecipe };