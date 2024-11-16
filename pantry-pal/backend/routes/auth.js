import express from 'express';
import { signUpWithEmail, signInWithEmail, signOutWithEmail, isAuth } from '../services/authServices.js';

export const router = express.Router();

router.post('/signup', (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ error: "Email and password are required." });
    }
    const { email, password } = req.body;
    signUpWithEmail(email, password)
        .then((uid) => {
            return res.status(200).json({ message: "Successfully signed up." });
        }).catch((error) => {
            //console.error("Error signing up user:", error);
            res.status(500).json({ error: "An error occurred while signing up user. " + error });
        });
});

router.post('/signin', (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ error: "Email and password are required."});
    }
    const { email, password } = req.body;
    signInWithEmail(email, password)
        .then((user) => {
            return res.status(200).json({ message: "User signed in successfully." });
        }).catch((error) => {
            //console.error("Error signing in user:", error);
            res.status(500).json({ error: "An error occurred while signing in user." + error});
        });
});

router.post('/signout', (req, res, next) => {
    signOutWithEmail()
        .then(() => {
            return res.status(200).json({ message: "User signed out successfully." });
        }).catch((error) => {
            //console.error("Error signing out user:", error);
            res.status(500).json({ error: "An error occurred while signing out user." });
        });
});
