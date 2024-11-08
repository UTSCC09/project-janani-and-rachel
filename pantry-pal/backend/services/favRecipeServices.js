import { db } from '../config/firebase.js';
import { ref, get, query, orderByChild, equalTo, orderByKey } from 'firebase/database';

function getFavRecipes(uid, page, limit) {
    uid = "janani_gurram"; // for testing purposes
    
    // resolve used to send successful result to the then() function
    // reject used to send error to the catch() function
    return new Promise((resolve, reject) => {
        
        // using firebase realtime database
        const recipesRef = ref(db, 'users/' + uid + '/favRecipes');
        get(recipesRef).then((snapshot) => {
            if (snapshot.exists()) {
                const recipes = snapshot.val();
                resolve(recipes);
            } else {
                console.log("No data available");
                resolve([]);
            }
        }).catch((error) => {
            console.error("Error reading data: ", error);
            reject(error);
        });
        
    });
}

function getPlannedFavRecipes(uid) {
    uid = "janani_gurram"; // for testing purposes

    return new Promise((resolve, reject) => {
        const recipesRef = ref(db, 'users/' + uid + '/favRecipes');
        
        // Use orderByChild('planned') and equalTo(true) correctly in query
        const plannedQuery = query(recipesRef, orderByChild('planned'), equalTo(true));
        
        get(plannedQuery).then((snapshot) => {
            if (snapshot.exists()) {
                const recipes = snapshot.val();
                resolve(recipes);
            } else {
                console.log("No data available");
                resolve([]);
            }
        }).catch((error) => {
            console.error("Error reading data: ", error);
            reject(error);
        });
    });
}
function getUnPlannedFavRecipes(uid) {
    uid = "janani_gurram"; // for testing purposes

    return new Promise((resolve, reject) => {
        const recipesRef = ref(db, 'users/' + uid + '/favRecipes');
        
        // Use orderByChild('planned') and equalTo(false) correctly in query
        const unPlannedQuery = query(recipesRef, orderByChild('planned'), equalTo(false));
        
        get(unPlannedQuery).then((snapshot) => {
            if (snapshot.exists()) {
                const recipes = snapshot.val();
                resolve(recipes);
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
function getFavRecipeById(uid, recipeId) {
    uid = "janani_gurram"; // for testing purposes

    return new Promise((resolve, reject) => {
        const recipesRef = ref(db, 'users/' + uid + '/favRecipes');
        
        const idQuery = query(recipesRef, orderByKey(), equalTo(recipeId));

        get(idQuery).then((snapshot) => {
            if (snapshot.exists()) {
                const recipe = snapshot.val();
                resolve(recipe);
            } else {
                console.log("No data available");
                resolve({});
            }
        }).catch((error) => {
            console.error("Error reading data: ", error);
            reject(error);
        });
    });
};

export { getFavRecipes, getPlannedFavRecipes, getUnPlannedFavRecipes, getFavRecipeById };