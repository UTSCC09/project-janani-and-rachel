import Joi from 'joi';
import { simpleStringSchema, numberSchema, sanitizeAndValidateData } from './generalValidator.js';

const mealSchema = Joi.object({
    "recipeId": numberSchema.required(),
    "ingredients": Joi.array().items(Joi.object({
        "ingredientName": simpleStringSchema.required(),
        "inPantry": Joi.boolean().required()
    })).allow(null).allow(''),
    "date": Joi.date().allow(null).allow(''),
});

const getMealQuerySchema = Joi.object({
    "limit": numberSchema.allow(null).allow(''),
    "lastVisibleMealId": simpleStringSchema.allow(null).allow('')
});

export const sanitizeAndValidateMeal = sanitizeAndValidateData(mealSchema);
export const sanitizeAndValidateGetMealQuery = sanitizeAndValidateData(getMealQuerySchema, 'query');

