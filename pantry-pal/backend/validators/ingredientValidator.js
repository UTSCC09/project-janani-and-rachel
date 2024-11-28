import Joi from 'joi';
import { simpleStringSchema, sanitizeAndValidateData } from './generalValidator.js';

const ingredientSchema = Joi.object({
    ingredientName: simpleStringSchema.required(),
    newIngredientName: simpleStringSchema,
    purchaseDate: Joi.date().allow(null).allow(''),
    expirationDate: Joi.date().allow(null).allow(''),
    frozen: Joi.boolean(),
    mealPlans: Joi.array().items(simpleStringSchema)
});

export const sanitizeAndValidateIngredient = sanitizeAndValidateData(ingredientSchema);
