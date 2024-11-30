import { auth } from '../config/firebase.js';

export const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];

    if (!idToken) {
        console.log("no token");
        return res.status(401).json({ error: 'Unauthorized, no token' });
    }

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        // attach the uid to the request so we can see who is making the request
        req.uid = decodedToken.uid;  
        next();
    } catch (error) {
        console.error("Error verifying token:", error);
        return res.status(401).json({ error: 'Unauthorized, invalid or expired token' });
    }
};

