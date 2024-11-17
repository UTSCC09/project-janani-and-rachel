import { db } from '../config/firebase.js';
import { collection, doc, where, setDoc, getDocs, getDoc, deleteDoc, limit, orderBy, query, startAfter } from 'firebase/firestore';

async function getFormattedRecipe(docData) {
    const recipeRef = docData.recipe;
    
    if (!recipeRef) {
        console.warn("Invalid recipe reference.");
        throw null;
    }

    const recipeDoc = await getDoc(recipeRef);
    if (!recipeDoc.exists()) {
        console.warn("Recipe document does not exist.");
        throw null;
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

async function getFavRecipes(uid, lim=10, lastVisibleId=null) {    
    try {
        const recipesRef = db.collection("Users").doc(uid).collection("FavRecipes");
        let q = recipesRef.orderBy('recipeName').limit(lim);

        // if lastVisibleId is provided, get the last visible document and start query after that
        if (lastVisibleId) {
            const lastVisibleDoc = await recipesRef.doc(lastVisibleId).get();
            if (lastVisibleDoc.exists) {
                q = recipesRef.orderBy('recipeName').startAfter(lastVisibleDoc).limit(lim);
            }
        }

        // get the fav recipes
        const snapshot = await q.get();
        if (snapshot.empty) {
            console.log("No more favorite recipes found.");
            return { recipes: [], lastVisible: null };
        }

        // promise.all takes an array of promises and waits for them all to resolve
            // return an array of the resolved promises
            // snapshot.docs.map() returns an array of promises 
                //async getFormattedRecipe returns a promise
            // concurrently resolve all promises in the array
        // await promise all so everything in recipes array to be resolved befor proceeding
        const recipes = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const data = doc.data();
                return await getFormattedRecipe(data);
            })
        );

        // get new last visible document
        const newLastVisible = snapshot.docs[snapshot.docs.length - 1];

        return {
            recipes: recipes,
            lastVisible: newLastVisible.id,
            numRecipes: snapshot.docs.length
        };
    } catch (error) {
        console.error("Error fetching paginated favorite recipes:", error);
        throw error;
    }
}

async function getPlannedFavRecipes(uid, lim=10, lastVisibleRecipe=null) {
    try {
        const recipesRef = db.collection("Users").doc(uid).collection("FavRecipes");
        let q = recipesRef.where('planned', '==', true).limit(lim);

        // if lastVisibleId is provided, get the last visible document and start query after that
        if (lastVisibleId) {
            const lastVisibleDoc = await recipesRef.doc(lastVisibleId).get();
            if (lastVisibleDoc.exists) {
                q = recipesRef.where('planned', '==', true).startAfter(lastVisibleDoc).limit(lim);
            }
        }

        // get the planned fav recipes
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

        const newLastVisible = snapshot.docs[snapshot.docs.length - 1];

        return {
            recipes: recipes,
            lastVisible: newLastVisible.id,
            numRecipes: snapshot.docs.length
        };
    } catch (error) {
        console.error("Error fetching paginated planned favorite recipes:", error);
        throw error;
    }
}

async function getUnPlannedFavRecipes(uid, lim = 10, lastVisibleId = null) {
    try {
        const recipesRef = db.collection("Users").doc(uid).collection("FavRecipes");
        let q = recipesRef.where('planned', '==', false).limit(lim);

        // if lastVisibleId is provided, get the last visible document and start query after that
        if (lastVisibleId) {
            const lastVisibleDoc = await recipesRef.doc(lastVisibleId).get();
            if (lastVisibleDoc.exists) {
                q = recipesRef.where('planned', '==', false).startAfter(lastVisibleDoc).limit(lim);
            }
        }

        // get the unplanned fav recipes
        const snapshot = await q.get();
        if (snapshot.empty) {
            console.log("No planned recipes in favorites for the specified page.");
            return { recipes: [], lastVisible: null, numRecipes: 0 };
        }

        const recipes = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const data = doc.data();
                return await getFormattedRecipe(data);
            })
        );

        const newLastVisible = snapshot.docs[snapshot.docs.length - 1];

        return {
            recipes: recipes,
            lastVisible: newLastVisible.id,
            numRecipes: snapshot.docs.length
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
            throw null;
        }

        const recipeRef = doc(db, 'Recipes', recipeId);
        const recipeDoc = await getDoc(recipeRef);

        if (!recipeDoc.exists()) {
            console.log("No such recipe found!");
            throw null;
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
        const recipeRef = doc(db, 'Recipes', String(recipe.recipeId)); 
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