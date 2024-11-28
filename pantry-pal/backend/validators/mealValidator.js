import Joi from 'joi';
import { simpleStringSchema, numberSchema, sanitizeAndValidateData } from './generalValidator.js';

const mealSchema = Joi.object({
    "recipeId": numberSchema.required(),
    "ingredients": Joi.array().items(Joi.object({
        "ingredientName": simpleStringSchema.required(),
        "inPantry": Joi.boolean().required()
    })),
    "date": Joi.date()
});

export const sanitizeAndValidateMeal = sanitizeAndValidateData(mealSchema);
