import Joi from 'joi';
import validator from "validator";

export const numberSchema = Joi.alternatives().try(
    Joi.string().pattern(/^[0-9]+$/), 
    Joi.number()
);

export const alphanumericStringSchema = Joi.string().pattern(/^[a-zA-Z0-9]+$/);
export const simpleStringSchema = Joi.string().pattern(/^[a-zA-Z0-9 &()'-,]+$/);
export const complexStringSchema = Joi.string().pattern(/^[a-zA-Z0-9 $*&()';:.,/!-]+$/);

const sanitizeStrings = (data) => {
    for (const key in data) {
        if (typeof data[key] === 'string') {
            data[key] = validator.escape(data[key]);
        }
    }
    return data;
}

export const sanitizeAndValidateData = (schema, property='body') => {
    return (req, res, next) => {
        // validate data is correct format
        const { error } = schema.validate(req[property]);
        if (error) {
            console.error("Validation error:", error);
            return res.status(400).json({ error: error.details[0].message });
        }
        // sanitize strings
        req[property] = sanitizeStrings(req[property]);
        next();
    };
}
