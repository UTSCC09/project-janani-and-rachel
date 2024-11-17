// for cross domain requests
const corsConfig = {
    origin: [process.env.FRONTEND_URL],  
    // Allow requests from this origin (frontend)
    // second origin is the internal ip of our vm
    credentials: true, // Allow cookies to be sent from the frontend
}

export default corsConfig;