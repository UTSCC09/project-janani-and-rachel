import { db } from '../config/firebase.js';
import { collection, doc, setDoc, getDocs, getDoc, deleteDoc, limit, orderBy, query, startAfter } from 'firebase/firestore';

export async function getPantry(uid, lim = 10, lastVisibleIngredient = null) {
    try {
        const pantryRef = collection(db, 'Users', uid, 'Pantry');
        let q = query(pantryRef, orderBy('ingredientName'), limit(lim)); 
  
        if (lastVisibleIngredient) {
            // Retrieve the lastVisible document snapshot using its ID
            const lastVisibleDoc = await getDoc(doc(pantryRef, lastVisibleIngredient));
            if (lastVisibleDoc.exists()) {
                q = query(pantryRef, orderBy('name'), startAfter(lastVisibleDoc), limit(limitNumber));
            }
        }

        // Retrieve the data
        const snapshot = await getDocs(q);
  
        if (snapshot.empty) {
            console.log("No more ingredients in pantry for the specified page.");
            return [];
        }
  
        // Set the last document in this page as the new lastVisible
        const newLastVisible = snapshot.docs[snapshot.docs.length - 1];

        return {
            ingredients: snapshot.docs.map(doc => (doc.data())),
            lastVisible: newLastVisible.id  // Return the new lastVisible ID for the next page
        };
    } 
    catch (error) {
        console.error("Error fetching paginated pantry ingredients:", error);
        throw error;
    }
}

export async function addToPantry(uid, ingredientName, purchaseDate = new Date(), expirationDate = null, frozen = false) {
    try {
        const pantryRef = doc(db, 'Users', uid, 'Pantry', ingredientName);
      
        const ingredientData = {
            ingredientName: ingredientName,
            purchaseDate: purchaseDate,
            expirationDate: expirationDate,
            frozen: frozen
        };
  
        await setDoc(pantryRef, ingredientData);
  
        console.log(`Ingredient '${ingredientName}' added to pantry for user ${uid}.`);
        return ingredientData; // return the data for confirmation if needed
    } 
    catch (error) {
        console.error("Error adding ingredient to pantry:", error);
        throw error;
    }
}

export function modifyInPantry() {}
export async function removeFromPantry(uid, ingredientId) {
    const ingredientRef = doc(db, 'Users', uid, 'Pantry', ingredientId);
    try {
        // Get the document before deleting
        const ingredientDoc = await getDoc(ingredientRef);
      
        if (!ingredientDoc.exists) {
            throw new Error(`Ingredient with ID ${ingredientId} not found in pantry.`);
        }
  
        // Store the data of the ingredient to return it after deletion
        const deletedIngredient = ingredientDoc.data();
  
        // Delete the document
        await deleteDoc(ingredientRef);
  
        console.log("Ingredient deleted from pantry with ID:", ingredientId);
        return deletedIngredient;
    } 
    catch (error) {
        console.error("Error deleting ingredient from pantry:", error);
        throw error;
    }
}

export async function getShoppingList(uid, lim=10, lastVisibleIngredient = null) {
    try {
        const shoppingListRef = collection(db, 'Users', uid, 'ShoppingList');
        let q = query(shoppingListRef, orderBy('ingredientName'), limit(lim)); // base query with limit
        
        if (lastVisibleIngredient) {
            // Retrieve the lastVisible document snapshot using its ID
            const lastVisibleDoc = await getDoc(doc(shoppingListRef, lastVisibleIngredient));
            if (lastVisibleDoc.exists()) {
                q = query(shoppingListRef, orderBy('name'), startAfter(lastVisibleDoc), limit(limitNumber));
            }
        }

        // Retrieve the data
        const snapshot = await getDocs(q);
  
        if (snapshot.empty) {
            console.log("No more ingredients in shopping list for the specified page.");
            return [];
        }
  
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error("Error fetching paginated shopping list ingredients:", error);
        throw error;
    }
};

export async function addToShoppingList(uid, ingredientName) {
    try {
        const shoppingListRef = doc(db, 'Users', uid, 'ShoppingList', ingredientName);
      
        const ingredientData = {
            ingredientName: ingredientName,
        };
  
        await setDoc(shoppingListRef, ingredientData);
  
        console.log(`Ingredient '${ingredientName}' added to shopping list for user ${uid}.`);
        return ingredientData; // return the data for confirmation if needed
    } 
    catch (error) {
        console.error("Error adding ingredient to shopping list:", error);
        throw error;
    }
};

export function modifyInShoppingCart() {};
export async function removeFromShoppingCart(uid, ingredientName) {
    try {
        const ingredientRef = doc(db, 'Users', uid, 'ShoppingList', ingredientName);
      
        // Get the document before deleting
        const ingredientDoc = await getDoc(ingredientRef);
      
        if (!ingredientDoc.exists) {
            throw new Error(`Ingredient with ID ${ingredientName} not found in shopping list.`);
        }
  
        // Store the data of the ingredient to return it after deletion
        const deletedIngredient = ingredientDoc.data();
  
        // Delete the document
        await deleteDoc(ingredientRef);
  
        console.log("Ingredient deleted from shopping list with ID:", ingredientName);
        return deletedIngredient;
    }
    catch (error) {
        console.error("Error deleting ingredient from shopping list:", error);
        throw error;
    }
};

