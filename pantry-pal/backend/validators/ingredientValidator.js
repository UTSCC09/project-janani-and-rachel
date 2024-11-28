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

const getIngredientQuerySchema = Joi.object({
    limit: Joi.number().allow(null).allow(''),
    lastVisibleIngredient: Joi.string().allow(null).allow('')
});

export const sanitizeAndValidateIngredient = sanitizeAndValidateData(ingredientSchema);
export const sanitizeAndValidateGetIngredientQuery = sanitizeAndValidateData(getIngredientQuerySchema, 'query');
