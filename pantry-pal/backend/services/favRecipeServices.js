import { db } from '../config/firebase.js';
import { collection, doc, where, setDoc, getDocs, getDoc, deleteDoc, limit, orderBy, query, startAfter } from 'firebase/firestore';

async function getFormattedRecipe(docData) {
    const recipeRef = docData.recipe;
    
    if (!recipeRef) {
        console.warn("Invalid recipe reference.");
        return null;
    }

    const recipeDoc = await getDoc(recipeRef);
    if (!recipeDoc.exists()) {
        console.warn("Recipe document does not exist.");
        return null;
    }

    const recipeData = recipeDoc.data();
    return {
        recipeId: docData.recipeId,
        recipeName: docData.recipeName,
        planned: docData.planned,
        ingredients: recipeData.ingredients,
        sourceUrl: recipeData.sourceUrl,
        instructions: recipeData.instructions,
        totalIngredientCount: recipeData.totalIngredientCount
    };
}

async function getFavRecipes(uid, lim = 10, lastVisibleId = null) {    
    try {
        const recipesRef = collection(db, "Users", uid, "FavRecipes");
        let q = query(recipesRef, orderBy('recipeName'), limit(lim));

        if (lastVisibleId) {
            const lastVisibleDoc = await getDoc(doc(recipesRef, lastVisibleId));
            if (lastVisibleDoc.exists()) {
                q = query(recipesRef, orderBy('recipeName'), startAfter(lastVisibleDoc), limit(lim));
            } else {
                console.warn("No document found for lastVisibleId:", lastVisibleId);
            }
        }

        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            console.log("No more favorite recipes found.");
            return { recipes: [], lastVisible: null };
        }

        const recipes = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const data = doc.data();
                return await getFormattedRecipe(data);
            })
        );

        // Filter out null values
        const filteredRecipes = recipes.filter(recipe => recipe !== null);
        const newLastVisible = snapshot.docs[snapshot.docs.length - 1];

        return {
            recipes: filteredRecipes,
            lastVisible: newLastVisible.id
        };
    } catch (error) {
        console.error("Error fetching paginated favorite recipes:", error);
        throw error;
    }
}

async function getPlannedFavRecipes(uid, lim = 10, lastVisibleRecipe = null) {
    try {
        const recipesRef = collection(db, 'Users', uid, 'FavRecipes');
        let plannedQuery = query(recipesRef, where('planned', '==', true), limit(lim));

        if (lastVisibleRecipe) {
            const lastVisibleDocRef = doc(recipesRef, lastVisibleRecipe);
            const lastVisibleDoc = await getDoc(lastVisibleDocRef);
            if (lastVisibleDoc.exists()) {
                plannedQuery = query(recipesRef, where('planned', '==', true), startAfter(lastVisibleDoc), limit(lim));
            }
        }

        const snapshot = await getDocs(plannedQuery);
        if (snapshot.empty) {
            console.log("No more planned recipes in favorites for the specified page.");
            return { recipes: [], lastVisible: null };
        }

        const recipes = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const data = doc.data();
                return await getFormattedRecipe(data);
            })
        );

        // Filter out null values
        const filteredRecipes = recipes.filter(recipe => recipe !== null);
        const newLastVisible = snapshot.docs[snapshot.docs.length - 1];

        return {
            recipes: filteredRecipes,
            lastVisible: newLastVisible.id
        };
    } catch (error) {
        console.error("Error fetching paginated planned favorite recipes:", error);
        throw error;
    }
}


async function getUnPlannedFavRecipes(uid, lim = 10, lastVisibleRecipe = null) {
    try {
        const recipesRef = collection(db, 'Users', uid, 'FavRecipes');
        let plannedQuery = query(recipesRef, where('planned', '==', false), limit(lim));

        if (lastVisibleRecipe) {
            const lastVisibleDocRef = doc(recipesRef, lastVisibleRecipe);
            const lastVisibleDoc = await getDoc(lastVisibleDocRef);
            if (lastVisibleDoc.exists()) {
                plannedQuery = query(recipesRef, where('planned', '==', true), startAfter(lastVisibleDoc), limit(lim));
            }
        }

        const snapshot = await getDocs(plannedQuery);
        if (snapshot.empty) {
            console.log("No more planned recipes in favorites for the specified page.");
            return { recipes: [], lastVisible: null };
        }

        const recipes = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const data = doc.data();
                return await getFormattedRecipe(data);
            })
        );

        // Filter out null values
        const filteredRecipes = recipes.filter(recipe => recipe !== null);
        const newLastVisible = snapshot.docs[snapshot.docs.length - 1];

        return {
            recipes: filteredRecipes,
            lastVisible: newLastVisible.id
        };
    } catch (error) {
        console.error("Error fetching paginated planned favorite recipes:", error);
        throw error;
    }
}

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