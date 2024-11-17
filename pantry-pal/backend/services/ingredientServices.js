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

export async function addToPantry(uid, ingredientName, purchaseDate=new Date(), expirationDate=null, frozen=false) {
    const pantryRef = db.collection('Users').doc(uid).collection('Pantry').doc(ingredientName);
    const ingredientData = {
        ingredientName,
        purchaseDate,
        expirationDate,
        frozen
    };
    await pantryRef.set(ingredientData);
    return ingredientData;
}

export async function modifyInPantry(uid, ingredient) {
    const pantryRef = db.collection('Users').doc(uid).collection('Pantry').doc(ingredient.ingredientName);
    const ingredientData = await pantryRef.get();
    if (!ingredientData.exists) {
        throw { status: 404, message: "Ingredient does not exist in pantry." };
    }
    await pantryRef.update(ingredient);
    const newIngredientData = await pantryRef.get();
    return newIngredientData.data();
}

export async function removeFromPantry(uid, ingredientName) {
    const pantryRef = db.collection('Users').doc(uid).collection('Pantry').doc(ingredientName);
    const ingredientData = await pantryRef.get();
    if (!ingredientData.exists) {
        throw { status: 404, message: "Ingredient does not exist in pantry." };
    }
    await pantryRef.delete();
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

export async function addToShoppingList(uid, ingredientName) {
    const shoppingListRef = db.collection('Users').doc(uid).collection('ShoppingList').doc(ingredientName);
    const ingredientData = { 
        ingredientName: ingredientName 
    };
    await shoppingListRef.set(ingredientData);
    return ingredientData;
}

export async function modifyInShoppingCart(uid, ingredient) {
    const shoppingListRef = db.collection('Users').doc(uid).collection('ShoppingList').doc(ingredient.ingredientName);
    const ingredientData = shoppingListRef.get();
    if (!ingredientData.exists) {
        throw { status: 404, message: "Ingredient does not exist in shopping list."};
    }
    await shoppingListRef.update(ingredient);
    const newIngredientData = shoppingListRef.get();
    return newIngredientData.data();
}

export async function removeFromShoppingCart(uid, ingredientName) {
    const shoppingListRef = db.collection('Users').doc(uid).collection('ShoppingList').doc(ingredientName);
    const ingredientData = await shoppingListRef.get();
    if (!ingredientData.exists) {
        throw { status: 404, message: "Ingredient does not exist in shopping list."};
    }
    await shoppingListRef.delete();
    return ingredientData.data();
}
