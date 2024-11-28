import Joi from 'joi';
import { numberSchema, simpleStringSchema, complexStringSchema, sanitizeAndValidateData } from './generalValidator.js';

const recipeSchema = Joi.object({
    recipeId: numberSchema.required(),
    recipeName: simpleStringSchema.max(255).required(),
    ingredients: Joi.array().items(simpleStringSchema.max(100)),
    totalIngredientCount: numberSchema,
    sourceUrl: Joi.string().uri(),
    missedIngredients: Joi.array().items(simpleStringSchema),
    missedIngredientCount: numberSchema,
    instructions: Joi.array().items(Joi.object({
        number: numberSchema,
        step: complexStringSchema
    }))
});

export const sanitizeAndValidateRecipe = sanitizeAndValidateData(recipeSchema);
