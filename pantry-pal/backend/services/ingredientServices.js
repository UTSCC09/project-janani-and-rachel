import { db } from '../config/firebase.js';

export async function getPantry(uid, lim=10, lastVisibleIngredient=null) {
    const pantryRef = db.collection('Users').doc(uid).collection('Pantry');
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
    const mealPlanIngredients = mealPlanData.data().pantryIngredients;
    const mealPlanFrozenIngredients = mealPlanData.data().frozenIngredients;
    const newMealPlanIngredients = mealPlanIngredients.map((ingredient) => {
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

export async function modifyInPantry(uid, ingredient) {
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

export async function removeFromPantry(uid, ingredientName) {
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
    }

    return ingredientData.data();
}

export async function getShoppingList(uid, lim=10, lastVisibleIngredient = null) {
    const shoppingListRef = db.collection('Users').doc(uid).collection('ShoppingList');
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


export async function addToShoppingList(uid, ingredientName, mealPlans=[]) {
    const shoppingListRef = db.collection('Users').doc(uid).collection('ShoppingList').doc(ingredientName);
    const ingredientData = { 
        ingredientName: ingredientName,
        mealPlans: mealPlans
    };
    await shoppingListRef.set(ingredientData);
    return ingredientData;
}

async function changeShoppingListIngredientNameInMealPlan(uid, mealPlanId, ingredientName, newIngredientName) {
    const mealPlansRef = db.collection('Users').doc(uid).collection('MealPlan').doc(mealPlanId);
    const mealPlanData = await mealPlansRef.get();
    if (!mealPlanData.exists) {
        return;
    }

    const mealPlanIngredients = mealPlanData.data().shoppingListIngredients;
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

export async function modifyInShoppingList(uid, ingredient) {
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
            }
        }));
    }

    return newIngredientData.data();
}

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

export async function removeFromShoppingList(uid, ingredientName) {
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
    }

    return ingredientData.data();
}
