import { db } from '../config/firebase.js';
import { getPantry } from './ingredientServices.js';
import { genAI } from '../config/gemini.js';

async function getFormattedRecipe(favRecipeDocData) {
    const recipeRef = favRecipeDocData.recipe;
    
    if (!recipeRef) {
        throw { status: 404, message: "Favorite recipe not found." };
    }

    const recipeDoc = await db.doc(recipeRef.path).get();
    if (!recipeDoc.exists) {
        throw { status: 404, message: "Recipe not found." };
    }
    const recipeData = recipeDoc.data();
    return {
        recipeId: favRecipeDocData.recipeId,
        recipeName: favRecipeDocData.recipeName,
        planned: favRecipeDocData.planned,
        ingredients: recipeData.ingredients,
        sourceUrl: recipeData.sourceUrl,
        instructions: recipeData.instructions,
        totalIngredientCount: recipeData.totalIngredientCount
    };
}

async function getFavRecipes(uid, lim=10, lastVisibleId=null) {    
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
        return { recipes: [], lastVisible: null, numRecipes: 0 };
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
}

async function getPlannedFavRecipes(uid, lim=10, lastVisibleId=null) {
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
    const snapshot = await q.get();
    // no more planned recipes on this page
    if (snapshot.empty) {
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
}

async function getUnPlannedFavRecipes(uid, lim = 10, lastVisibleId = null) {
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
}

async function getFavRecipeById(uid, recipeId) {
    const favRecipeRef = db.collection('Users').doc(uid).collection('FavRecipes').doc(recipeId); 
    const favRecipeDoc = await favRecipeRef.get();

    if (!favRecipeDoc.exists) {
        throw { status: 404, message: "Recipe not found in favorites." };
    }

    return getFormattedRecipe(favRecipeDoc.data());
}

async function addFavRecipe(uid, recipe) {
    // check I was given the main arguments
    if (!recipe.recipeId || !recipe.recipeName) {
        throw { status: 400, message: "Recipe data is incomplete. Missing recipe id or name." };
    }

    const favRecipeRef = db.collection('Users').doc(uid).collection('FavRecipes').doc(String(recipe.recipeId));
    const recipeRef = db.collection('Recipes').doc(String(recipe.recipeId));
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

    recipeRef.set(recipeData).then(() => {
        favRecipeRef.set(favRecipeData).then(() => {
            return recipeData;
        }).catch((error) => {
            throw error;
        });
    }).catch((error) => {
        throw error;
    });
}

async function removeFavRecipe(uid, recipeId) {
    const favRecipeRef = db.collection('Users').doc(uid).collection('FavRecipes').doc(String(recipeId));
    const favRecipeDoc = await favRecipeRef.get();
    if (!favRecipeDoc.exists) {
        throw { status: 404, message: "Recipe not found in favorites." };
    }
    await favRecipeRef.delete()
    const { recipe, ...favRecipeData } = favRecipeDoc.data();
    return favRecipeData; 
}

async function pantryComparison(uid, recipeId) {
    const recipe = await getFavRecipeById(uid, recipeId);
    const recipeIngredients = recipe.ingredients;
    const pantry = await getPantry(uid, 1000);
    const pantryIngredients = pantry.ingredients.map(ingredient => ingredient.ingredientName);
    const schema = {
        "type": "object",
        "properties": {
        "ingredients": {
            "type": "array",
            "items": {
            "type": "string"
            }
        }
        },
        "description": "Return a list of the ingredients"
    };
    
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    const missingIngredientsPrompt = `Given a list of the ingredients in the pantry and a list of the ingredients in the recipe,
        determine a list of the ingredients in the recipe missing from the pantry.
        If there is an ingredient in the recipe that is similar to an ingredient in the pantry, do not consider that ingredient as missing.
        For example, if the recipe contains the ingredient called caster sugar and we have the ingredient called sugar in the pantry, then caster sugar is not missing. Do not include it in the list of missing ingredients.
        Recipe Ingredients: ${recipeIngredients}
        Pantry Ingredients: ${pantryIngredients}`;

    const matchingIngredientsPrompt = `Given a list of the ingredients in the pantry and a list of the ingredients in the recipe,
        determine a list of the ingredients in the pantry that are either the same or really similar to an ingredient in the recipe.
        For example, steak and beef are not very similar. If I have steak and the recipe calls for beef, do not include steak. But, ground beef and beef are very similar. If we have ground beef in the pantry, and the recipe asks for beef, then we include ground beef in the list of matching ingredients.
        Likewise, if the recipe contains the ingredient called caster sugar and we have the ingredient called sugar in the pantry, then sugar is similar to caster sugar.
        Recipe Ingredients: ${recipeIngredients}
        Pantry Ingredients: ${pantryIngredients}`;
    
    
    try {
        let matchingIngredientsResult = [];
        let missingIngredientsResult = [];
        [missingIngredientsResult, matchingIngredientsResult] = await Promise.all([
            model.generateContent(missingIngredientsPrompt),
            model.generateContent(matchingIngredientsPrompt)
        ]);
        
        console.log(missingIngredientsResult.response.text());
        console.log(matchingIngredientsResult.response.text());
        return { 
            missingIngredients: JSON.parse(missingIngredientsResult.response.text()).ingredients, 
            matchingIngredients: JSON.parse(matchingIngredientsResult.response.text()).ingredients 
        };
    }
    catch (error) {
        console.error("Error comparing pantry to recipe ingredients:", error);
        throw { error: "An error occurred while comparing pantry to recipe ingredients.", ingredients: recipeIngredients };
    }    
}


export { getFavRecipes, getPlannedFavRecipes, getUnPlannedFavRecipes, getFavRecipeById, addFavRecipe, removeFavRecipe, pantryComparison };