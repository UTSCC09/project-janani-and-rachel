// for cross domain requests
const corsConfig = {
    origin: ['http://localhost:3000', 'http://35.208.68.213'],  
    // Allow requests from this origin (frontend)
    // second origin is the internal ip of our vm
    credentials: true, // Allow cookies to be sent from the frontend
}

export default corsConfig;