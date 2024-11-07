import express from 'express';
import { getPantry }  from '../services/ingredientServices';

export const router = express.Router();

router.get('/pantry', (req, res, next) => {
    // Get the pantry for the username Janani
    // in acc, would put the session id or smth
    const pantry = getPantry("Janani");

});

