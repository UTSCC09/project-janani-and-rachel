import { db } from '../config/firebase.js';
import { collection, doc, where, setDoc, getDocs, getDoc, deleteDoc, limit, orderBy, query, startAfter } from 'firebase/firestore';


function getFavRecipes(uid, lim=10, lastVisibleRecipe=null) {    
    // resolve used to send successful result to the then() function
    // reject used to send error to the catch() function
    return new Promise((resolve, reject) => {
        
        const recipesRef = collection(db, "Users", uid, "FavRecipes");
        let q = query(recipesRef, orderBy('recipeName'), limit(lim));

        if (lastVisibleRecipe) {
            // Retrieve the lastVisible document snapshot using its ID
            const lastVisibleDoc = getDoc(doc(recipesRef, lastVisibleRecipe));
            if (lastVisibleDoc.exists()) {
                q = query(recipesRef, orderBy('recipeName'), startAfter(lastVisibleDoc), limit(lim));
            }
        }

        getDocs(q).then((snapshot) => {
            if (snapshot.empty) {
                console.log("No more recipes in favorites for the specified page.");
                resolve([]);
            } else {
                const newLastVisible = snapshot.docs[snapshot.docs.length - 1];
                const recipes = snapshot.docs.map(doc => (doc.data()));
                resolve({
                    recipes: recipes,
                    lastVisible: newLastVisible.id
                });
            }
        }
        ).catch((error) => {
            console.error("Error fetching paginated favorite recipes:", error);
            reject(error);
        });
    });
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

function getFavRecipeById(uid, recipeId) {
    return new Promise((resolve, reject) => {
        const recipeRef = doc(db, 'Users', uid, 'FavRecipes', recipeId);
        getDoc(recipeRef).then((doc) => {
            if (doc.exists()) {
                resolve(doc.data());
            } else {
                console.log("No such recipe in favorites!");
                resolve(null);
            }
        }).catch((error) => {
            console.error("Error fetching favorite recipe by ID:", error);
            reject(error);
        });
    });
};

export { getFavRecipes, getPlannedFavRecipes, getUnPlannedFavRecipes };