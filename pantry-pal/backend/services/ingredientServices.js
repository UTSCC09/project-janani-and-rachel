import { google } from 'googleapis';
import { db } from '../config/firebase.js';
import { markDefrostTaskComplete, markDefrostTaskIncomplete, renameFrozenIngredient, deleteDefrostTask,
    renameShoppingListIngredient, markBuyTaskComplete, deleteBuyTask } 
    from './reminderServices.js';

export async function getPantry(uid, lim=10, lastVisibleIngredient=null) {
    const pantryRef = db.collection('Users').doc(uid).collection('Pantry');
    lim = parseInt(lim);
    let q = pantryRef.orderBy('ingredientName').limit(lim);

    if (lastVisibleIngredient) {
        // retrieve the last visible ingredient if it exists
        const lastVisibleDoc = await pantryRef.doc(lastVisibleIngredient).get();
        if (lastVisibleDoc.exists) {
            q = pantryRef.orderBy('ingredientName').startAfter(lastVisibleDoc).limit(lim);
        }
    }

    const snapshot = await q.get();

    if (snapshot.empty) {
        console.log("No more ingredients in pantry for the specified page.");
        return [];
    }

    // new last visible ingredient on this page
    const newLastVisible = snapshot.docs[snapshot.docs.length - 1];

    return {
        ingredients: snapshot.docs.map(doc => doc.data()),
        lastVisible: newLastVisible.id,  // return the new last visible ingredient to use for the next page
        numIngredients: snapshot.docs.length
    };
}

// add pantry ingredient pantry section of meal plan if it doesnt exist
async function addPantryIngredientToMealPlan(uid, mealPlanId, ingredientName) {
    const mealPlanRef = db.collection('Users').doc(uid).collection('MealPlan').doc(mealPlanId);
    const mealPlanData = await mealPlanRef.get();
    if (!mealPlanData.exists) {
        return;
    }

    const mealPlanIngredients = mealPlanData.data().pantryIngredients;
    if (!mealPlanIngredients.includes(ingredientName)) {
        const newMealPlanIngredients = [ ...mealPlanIngredients, ingredientName ];
        await mealPlanRef.update({
            pantryIngredients: newMealPlanIngredients
        });
    }
}

export async function addToPantry(uid, ingredientName, purchaseDate=new Date(), expirationDate=null, frozen=false, mealPlans=[]) {
    const pantryRef = db.collection('Users').doc(uid).collection('Pantry').doc(ingredientName);
    const ingredientData = {
        ingredientName,
        purchaseDate,
        expirationDate,
        frozen,
        mealPlans
    };
    await pantryRef.set(ingredientData);

    if (mealPlans.length === 0) {
        return ingredientData;
    }


    // add ingredient to pantry section of meal plan if it doesn't exist
    await Promise.all(mealPlans.map(async (mealPlanId) => {
        await addPantryIngredientToMealPlan(uid, mealPlanId, ingredientName);
    }));

    return ingredientData;
}

// helper function to change the name of a pantry ingredient in a meal plan
async function changePantryIngredientNameInMealPlan(uid, mealPlanId, ingredientName, newIngredientName) {
    const mealPlansRef = db.collection('Users').doc(uid).collection('MealPlan').doc(mealPlanId);
    const mealPlanData = await mealPlansRef.get();
    if (!mealPlanData.exists) {
        return;
    }

    // change the name of the ingredient in the ingredients list and frozen ingredients list
    const mealPlanIngredients = mealPlanData.data().pantryIngredients || [];
    const mealPlanFrozenIngredients = mealPlanData.data().frozenIngredients || [];
    let newMealPlanIngredients = [];
    newMealPlanIngredients = mealPlanIngredients.map((ingredient) => {
        if (ingredient === ingredientName) {
            return newIngredientName;
        }
        return ingredient;
    });
    const newFrozenIngredients = mealPlanFrozenIngredients.map((ingredient) => {
        if (ingredient === ingredientName) {
            return newIngredientName;
        }
        return ingredient;
    });

    await mealPlansRef.update({
        pantryIngredients: newMealPlanIngredients,
        frozenIngredients: newFrozenIngredients
    });
}

// another helper for managing frozen ingredients in meal plans
async function updateFrozenIngredientsInMealPlan(uid, mealPlanId, ingredientName, frozen) {
    const mealPlansRef = db.collection('Users').doc(uid).collection('MealPlan').doc(mealPlanId);
    const mealPlanData = await mealPlansRef.get();
    if (!mealPlanData.exists) {
        return;
    }

    const mealPlanFrozenIngredients = mealPlanData.data().frozenIngredients;
    let newFrozenIngredients = mealPlanFrozenIngredients;
    if (frozen && !mealPlanFrozenIngredients.includes(ingredientName)) {
        newFrozenIngredients = [ ...mealPlanFrozenIngredients, ingredientName ];
    } else if (!frozen && mealPlanFrozenIngredients.includes(ingredientName)) {
        newFrozenIngredients = mealPlanFrozenIngredients.filter((ingredient) => ingredient !== ingredientName);
    }

    await mealPlansRef.update({
        frozenIngredients: newFrozenIngredients
    });
}


export async function modifyInPantry(uid, ingredient, googleAccessToken) {
    // check if ingredient exists in pantry
    const pantryRef = db.collection('Users').doc(uid).collection('Pantry').doc(ingredient.ingredientName);
    const ingredientData = await pantryRef.get();
    if (!ingredientData.exists) {
        throw { status: 404, message: "Ingredient does not exist in pantry." };
    }

    let { newIngredientName, ...updatedIngredientData } = ingredient;
    
    // use new ingredient name in updated data if it exists
    if (newIngredientName) {
        updatedIngredientData.ingredientName = newIngredientName;
    }
    // update the data in the pantry
    await pantryRef.update(updatedIngredientData);
    const newIngredientData = (await pantryRef.get()).data();
    // if they specific a new ingredient name, we need to delete the old one and create a new one
    if (newIngredientName) {
        await pantryRef.delete();
        const newPantryRef = db.collection('Users').doc(uid).collection('Pantry').doc(newIngredientName);
        await newPantryRef.set(newIngredientData);
    }

    // update each entry in the meal plans that reference this ingredient
    if (newIngredientData.mealPlans) {
        await Promise.all(newIngredientData.mealPlans.map(async (mealPlanId) => {
            // change name in meal plan
            if (newIngredientName) {
                await changePantryIngredientNameInMealPlan(uid, mealPlanId, ingredient.ingredientName, newIngredientName);
            }
            // update frozen
            if (ingredient.frozen !== undefined) {
                await updateFrozenIngredientsInMealPlan(uid, mealPlanId, newIngredientData.ingredientName, ingredient.frozen);
            }
        }));
        // if we renamed the ingredient, we need to rename the reminders
        if (newIngredientName && googleAccessToken) {
            await renameFrozenIngredient(uid, ingredient.ingredientName, newIngredientName, googleAccessToken);
        }

        // if the ingredient is no longer frozen, delete the defrost task
        // it would only have a task if you have a google access token and its on a meal plan
        if (ingredient.frozen != undefined && ingredient.frozen == false && googleAccessToken) { 
            await markDefrostTaskComplete(uid, newIngredientData.ingredientName, googleAccessToken);
        } 
        else if (ingredient.frozen && ingredient.frozen == true && googleAccessToken) {
            await markDefrostTaskIncomplete(uid, newIngredientData.ingredientName, googleAccessToken);
        }
    }
    return newIngredientData;
}

async function deletePantryIngredientFromMealPlan(uid, mealPlanId, ingredientName) {
    const mealPlanRef = db.collection('Users').doc(uid).collection('MealPlan').doc(mealPlanId);
    const mealPlanData = await mealPlanRef.get();
    if (!mealPlanData.exists) {
        return;
    }

    const mealPlanIngredients = mealPlanData.data().pantryIngredients;
    const mealPlanFrozenIngredients = mealPlanData.data().frozenIngredients;
    const newMealPlanIngredients = mealPlanIngredients.filter((ingredient) => ingredient !== ingredientName);
    const newFrozenIngredients = mealPlanFrozenIngredients.filter((ingredient) => ingredient !== ingredientName);

    await mealPlanRef.update({
        pantryIngredients: newMealPlanIngredients,
        frozenIngredients: newFrozenIngredients
    });
}

export async function removeFromPantry(uid, ingredientName, googleAccessToken) {
    const pantryRef = db.collection('Users').doc(uid).collection('Pantry').doc(ingredientName);
    const ingredientData = await pantryRef.get();
    if (!ingredientData.exists) {
        throw { status: 404, message: "Ingredient does not exist in pantry." };
    }
    // remove from pantry
    await pantryRef.delete();

    // remove ingredient from associated meal plans
    if (ingredientData.data().mealPlans) {
        await Promise.all(ingredientData.data().mealPlans.map(async (mealPlanId) => {
            await deletePantryIngredientFromMealPlan(uid, mealPlanId, ingredientName);
        }));
        // if the ingredient is frozen, delete the defrost task
        if (ingredientData.data().frozen && googleAccessToken) {
            await deleteDefrostTask(uid, ingredientName, googleAccessToken);
        }
    }

    return ingredientData.data();
}

export async function getShoppingList(uid, lim=10, lastVisibleIngredient = null) {
    const shoppingListRef = db.collection('Users').doc(uid).collection('ShoppingList');
    lim = parseInt(lim);
    let q = shoppingListRef.orderBy('ingredientName').limit(lim);

    if (lastVisibleIngredient) {
        const lastVisibleDoc = await shoppingListRef.doc(lastVisibleIngredient).get();
        if (lastVisibleDoc.exists) {
            q = shoppingListRef.orderBy('ingredientName').startAfter(lastVisibleDoc).limit(lim);
        }
    }

    const snapshot = await q.get();

    if (snapshot.empty) {
        console.log("No more ingredients in shopping list for the specified page.");
        return [];
    }

    const newLastVisible = snapshot.docs[snapshot.docs.length - 1];
    return {
        ingredients: snapshot.docs.map(doc => doc.data()),
        lastVisible: newLastVisible.id,
        numIngredients: snapshot.docs.length
    };
}

// add shopping list ingredient to meal plan shoppingList ingredient if it doesn't exist
async function addShoppingListIngredientToMealPlan(uid, mealPlanId, ingredientName) {
    const mealPlanRef = db.collection('Users').doc(uid).collection('MealPlan').doc(mealPlanId);
    const mealPlanData = await mealPlanRef.get();
    if (!mealPlanData.exists) {
        return;
    }
    
    const mealPlanIngredients = mealPlanData.data().shoppingListIngredients;
    if (!mealPlanIngredients.includes(ingredientName)) {
        const newMealPlanIngredients = [ ...mealPlanIngredients, ingredientName ];
        await mealPlanRef.update({
            shoppingListIngredients: newMealPlanIngredients
        });
    }
}

export async function addToShoppingList(uid, ingredientName, mealPlans=[]) {
    const shoppingListRef = db.collection('Users').doc(uid).collection('ShoppingList').doc(ingredientName);
    const ingredientData = { 
        ingredientName: ingredientName,
        mealPlans: mealPlans
    };
    await shoppingListRef.set(ingredientData);

    // add ingredient to shopping list section of meal plan if it doesn't exist
    await Promise.all(mealPlans.map(async (mealPlanId) => {
        await addShoppingListIngredientToMealPlan(uid, mealPlanId, ingredientName);
    }));

    return ingredientData;
}

// helper function to change the name of a shopping list ingredient in a meal plan
async function changeShoppingListIngredientNameInMealPlan(uid, mealPlanId, ingredientName, newIngredientName) {
    const mealPlansRef = db.collection('Users').doc(uid).collection('MealPlan').doc(mealPlanId);
    const mealPlanData = await mealPlansRef.get();
    if (!mealPlanData.exists) {
        return;
    }

    const mealPlanIngredients = mealPlanData.data().shoppingListIngredients || [];
    const newShoppingListIngredients = mealPlanIngredients.map((ingredient) => {
        if (ingredient === ingredientName) {
            return newIngredientName;
        }
        return ingredient;
    });

    await mealPlansRef.update({
        shoppingListIngredients: newShoppingListIngredients
    });
}

export async function modifyInShoppingList(uid, ingredient, googleAccessToken) {
    // check if ingredient exists in shopping list
    const shoppingListRef = db.collection('Users').doc(uid).collection('ShoppingList').doc(ingredient.ingredientName);
    const ingredientData = await shoppingListRef.get();
    if (!ingredientData.exists) {
        throw { status: 404, message: "Ingredient does not exist in shopping list."};
    }

    // use new ingredient name in updated data if it exists
    let { newIngredientName, ...updatedIngredientData } = ingredient; 
    if (newIngredientName) {
        updatedIngredientData.ingredientName = newIngredientName;
    }
    
    // update the data in the shopping list
    await shoppingListRef.update(updatedIngredientData);
    const newIngredientData = await shoppingListRef.get();
    // if they specific a new ingredient name, we need to delete the old one and create a new one
    if (newIngredientName) {
        await shoppingListRef.delete();
        const newShoppingListRef = db.collection('Users').doc(uid).collection('ShoppingList').doc(newIngredientName);
        await newShoppingListRef.set(newIngredientData.data());
    }

    // update each entry in the meal plans that reference this ingredient
    if (newIngredientData.data().mealPlans) {
        await Promise.all(newIngredientData.data().mealPlans.map(async (mealPlanId) => {
            // if they specified a new ingredient name, we need to update the name in the meal plan
            if (newIngredientName) {
                await changeShoppingListIngredientNameInMealPlan(uid, mealPlanId, ingredient.ingredientName, newIngredientName);
                // also update in the reminders
                if (googleAccessToken) {
                    await renameShoppingListIngredient(uid, ingredient.ingredientName, newIngredientName, googleAccessToken);
                }
            }
        }));
    }

    return newIngredientData.data();
}

// helper function to delete a shopping list ingredient from a meal plan
async function deleteShoppingListIngredientFromMealPlan(uid, mealPlanId, ingredientName) {
    const mealPlanRef = db.collection('Users').doc(uid).collection('MealPlan').doc(mealPlanId);
    const mealPlanData = await mealPlanRef.get();
    if (!mealPlanData.exists) {
        return;
    }

    const mealPlanIngredients = mealPlanData.data().shoppingListIngredients;
    const newMealPlanIngredients = mealPlanIngredients.filter((ingredient) => ingredient !== ingredientName);

    await mealPlanRef.update({
        shoppingListIngredients: newMealPlanIngredients
    });
}

export async function removeFromShoppingList(uid, ingredientName, move, googleAccessToken) {
    const shoppingListRef = db.collection('Users').doc(uid).collection('ShoppingList').doc(ingredientName);
    const ingredientData = await shoppingListRef.get();
    if (!ingredientData.exists) {
        throw { status: 404, message: "Ingredient does not exist in shopping list."};
    }
    await shoppingListRef.delete();

    // remove ingredient from associated meal plans
    if (ingredientData.data().mealPlans) {
        await Promise.all(ingredientData.data().mealPlans.map(async (mealPlanId) => {
            await deleteShoppingListIngredientFromMealPlan(uid, mealPlanId, ingredientName);
        }));
        // also delete the buy task or mark it as complete depending whether we just move or deleted
        if (googleAccessToken) {
            if (move) {
                await markBuyTaskComplete(uid, ingredientName, googleAccessToken);
            } else {
                await deleteBuyTask(uid, ingredientName, googleAccessToken);
            }
        }
    }

    return ingredientData.data();
}
