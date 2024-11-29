import Joi from 'joi';
import { numberSchema, simpleStringSchema, complexStringSchema, sanitizeAndValidateData } from './generalValidator.js';

const recipeSchema = Joi.object({
    recipeId: numberSchema.required(),
    recipeName: simpleStringSchema.max(255).required(),
    ingredients: Joi.array().items(simpleStringSchema.max(100)).allow(null).allow(''),
    totalIngredientCount: numberSchema.allow(null).allow(''),
    sourceUrl: Joi.string().uri().allow(null).allow(''),
    missedIngredients: Joi.array().items().allow(null).allow(''),
    missedIngredientCount: numberSchema.allow(null).allow(''),
    instructions: Joi.array().items(Joi.object({
        number: numberSchema,
        step: complexStringSchema
    })).allow(null).allow(''),
    nutrition: Joi.object({
        nutrients: Joi.array().items(Joi.object({
            name: simpleStringSchema.allow(null).allow(''),
            amount: numberSchema.allow(null).allow(''),
            unit: simpleStringSchema.allow(null).allow(''),
            percentOfDailyNeeds: numberSchema.allow(null).allow('')
        })),
        caloricBreakdown: Joi.object({
            percentProtein: numberSchema.allow(null).allow(''),
            percentFat: numberSchema.allow(null).allow(''),
            percentCarbs: numberSchema.allow(null).allow('')
        })
    })
});

const getRecipeQuerySchema = Joi.object({
    limit: numberSchema.allow(null).allow(''),
    lastVisible: numberSchema.allow(null).allow('')
});

export const sanitizeAndValidateRecipe = sanitizeAndValidateData(recipeSchema);
export const sanitizeAndValidateGetRecipeQuery = sanitizeAndValidateData(getRecipeQuerySchema, 'query');
