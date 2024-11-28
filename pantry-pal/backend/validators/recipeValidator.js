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
    })),
    nutrition: Joi.object({
        nutrients: Joi.array().items(Joi.object({
            name: simpleStringSchema,
            amount: numberSchema,
            unit: simpleStringSchema,
            percentOfDailyNeeds: numberSchema
        })),
        caloricBreakdown: Joi.object({
            percentProtein: numberSchema,
            percentFat: numberSchema,
            percentCarbs: numberSchema
        })
    })
});

const getRecipeQuerySchema = Joi.object({
    limit: numberSchema.allow(null).allow(''),
    lastVisible: numberSchema.allow(null).allow('')
});

export const sanitizeAndValidateRecipe = sanitizeAndValidateData(recipeSchema);
export const sanitizeAndValidateGetRecipeQuery = sanitizeAndValidateData(getRecipeQuerySchema, 'query');