import { auth } from '../config/firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getIdToken } from 'firebase/auth';

export async function isAuth() {
    // to check signed user's uid, do auth.currentUser.uid
    // to check signed user's email, do auth.currentUser.email
    // use output as a boolean to check if someone in general is logged in
    return auth.currentUser;
}


export async function signUpWithEmail(email, password) {
}

export async function signInWithEmail(email, password) {
}

export async function signOutUser() {
}
