// for cross domain requests

const corsConfig = {
    origin: ['http://localhost:3000'],  // Allow requests from this origin (frontend)
    // todo: change the origin when this is deployed
    credentials: true, // Allow cookies to be sent from the frontend
}

export default corsConfig;