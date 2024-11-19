import { GoogleGenerativeAI } from 'google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
export const model = genAI.GoogleGenerativeModel({model: "gemini-1.5-flash"})
