import { auth } from '../config/firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut }
    from 'firebase/auth';

export async function isAuth() {
    // to check signed user's uid, do auth.currentUser.uid
    // to check signed user's email, do auth.currentUser.email
    // use output as a boolean to check if someone in general is logged in
    return auth.currentUser;
}

export async function signUpWithEmail(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User signed up successfully:");
        return userCredential.user.uid;
    } 
    catch (error) {
        //console.error("Error signing up: ", error.message);
        throw error.message;
    }
}

export async function signInWithEmail(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User signed in successfully:");
        return userCredential.user.uid;
    }
    catch (error) {
        //console.error("Error signing in:", error);
        throw error.message;
    }
}

export async function signOutWithEmail() {
    try {
        await signOut(auth);
        //console.log("User signed out successfully.");
    }
    catch (error) {
        //console.error("Error signing out:", error);
        throw error.message;
    }
}

