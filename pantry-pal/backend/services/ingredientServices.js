import { getPriority } from 'os';
import { db } from '../config/firebase.js';
import { ref, get, set, update } from 'firebase/database';

export function getIngredients(uid) {
    
    return new Promise((resolve, reject) => {
        const ingredientsRef = ref(db, `users/${uid}/ingredients`);

        get(ingredientsRef).then((snapshot) => {
            if (snapshot.exists()) {
                const ingredients = snapshot.val();
                resolve(ingredients);
            } else {
                console.log("No data available");
                resolve([]);
            }
        }).catch((error) => {
            console.error("Error reading data: ", error);
            reject(error);
        });
    });
};
export function getPantry(uid) {

    return new Promise((resolve, reject) => {
        const pantryRef = ref(db, `users/${uid}/pantry`);

        get(pantryRef).then((snapshot) => {
            if (snapshot.exists()) {
                const pantry = snapshot.val();
                resolve(pantry);
            } else {
                console.log("No data available");
                resolve([]);
            }
        }).catch((error) => {
            console.error("Error reading data: ", error);
            reject(error);
        });
    });
};
export function addToPantry(uid, ingredientName, purchaseDate = new Date(), expirationDate = null, quantity = null, unit = null, frozen = false) {
    return new Promise((resolve, reject) => {
        const pantryRef = ref(db, `users/${uid}/pantry/${ingredientName}`);
        const ingredientRef = ref(db, `users/${uid}/ingredients/${ingredientName}`);

        // Construct pantry data, excluding null values
        const pantryData = {
            purchaseDate: purchaseDate.toISOString(),  // Store date as ISO string
            frozen: frozen
        };
        if (expirationDate) pantryData.expirationDate = expirationDate.toISOString();
        if (quantity) pantryData.quantity = quantity;
        if (unit) pantryData.unit = unit;

        // Execute both `set` operations and resolve after both are complete
        const pantryPromise = set(pantryRef, pantryData);
        const ingredientPromise = update(ingredientRef, { inPantry: true });

        // Wait for both promises to resolve
        Promise.all([pantryPromise, ingredientPromise])
            .then(() => {
                resolve(`Added ${ingredientName} to pantry successfully.`);
            })
            .catch((error) => {
                console.error("Error adding data: ", error);
                reject(error);
            });
    });
}

export function modifyInPantry() {}
export function removeFromPantry(uid, ingredientName) {
    return new Promise((resolve, reject) => {
        const pantryRef = ref(db, `users/${uid}/pantry/${ingredientName}`);
        const ingredientRef = ref(db, `users/${uid}/ingredients/${ingredientName}`);

        // Execute both `set` operations and resolve after both are complete
        const pantryPromise = set(pantryRef, null);
        const ingredientPromise = update(ingredientRef, { inPantry: null });

        // Wait for both promises to resolve
        Promise.all([pantryPromise, ingredientPromise])
            .then(() => {
                resolve(`Removed ${ingredientName} from pantry successfully.`);
            })
            .catch((error) => {
                console.error("Error removing data: ", error);
                reject(error);
            });
    });
};
export function getShoppingList(uid) {
    return new Promise((resolve, reject) => {
        const shoppingListRef = ref(db, `users/${uid}/shoppingList`);

        get(shoppingListRef).then((snapshot) => {
            if (snapshot.exists()) {
                const shoppingList = snapshot.val();
                resolve(shoppingList);
            } else {
                console.log("No data available");
                resolve([]);
            }
        }).catch((error) => {
            console.error("Error reading data: ", error);
            reject(error);
        });
    });
};
export function addToShoppingCart(uid, ingredientName, quantity=null, units=null) {
    return new Promise((resolve, reject) => {
        const shoppingListRef = ref(db, `users/${uid}/shoppingList/${ingredientName}`);
        const ingredientRef = ref(db, `users/${uid}/ingredients/${ingredientName}`);

        // Construct shopping list data
        const shoppingListData = {
            priority: "medium",
            quantity: quantity,
            units: units // Changed to 'units' to match your schema
        };

        // Update only the inShoppingList field for the ingredient
        const shoppingListPromise = set(shoppingListRef, shoppingListData);
        const ingredientPromise = update(ingredientRef, { inShoppingList: true });

        // Wait for both promises to resolve
        Promise.all([shoppingListPromise, ingredientPromise])
            .then(() => {
                resolve(`Added ${quantity} ${units} of ${ingredientName} to shopping list successfully.`);
            })
            .catch((error) => {
                console.error("Error adding data: ", error);
                reject(error);
            });
    });
};

export function modifyInShoppingCart() {};
export function removeFromShoppingCart(uid, ingredientName) {
    return new Promise((resolve, reject) => {
        const shoppingListRef = ref(db, `users/${uid}/shoppingList/${ingredientName}`);
        const ingredientRef = ref(db, `users/${uid}/ingredients/${ingredientName}`);

        // Execute both `set` operations and resolve after both are complete
        const shoppingListPromise = set(shoppingListRef, null);
        const ingredientPromise = update(ingredientRef, { inShoppingList: null });

        // Wait for both promises to resolve
        Promise.all([shoppingListPromise, ingredientPromise])
            .then(() => {
                resolve(`Removed ${ingredientName} from shopping list successfully.`);
            })
            .catch((error) => {
                console.error("Error removing data: ", error);
                reject(error);
            });
    });
};

