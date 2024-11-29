import Joi from 'joi';
import validator from "validator";
import { Timestamp } from '@google-cloud/firestore';

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
        const { error } = schema.validate(req[property]);
        if (error) {
            console.error("Validation error:", error);
            return res.status(400).json({ error: error.details[0].message });
        }
        // sanitize strings
        req[property] = sanitizeStrings(req[property]);

        // if body param date, make it a date object and convert to Firestore Timestamp
        for (const key in req[property]) {
            if (key.includes('date') || key.includes('Date')) {
                const dateValue = new Date(req[property][key]);
                if (!isNaN(dateValue.getTime())) {
                    req[property][key] = Timestamp.fromDate(dateValue);
                } else {
                    req[property][key] = null; // or handle invalid date appropriately
                }
            }
        }
        next();
    };
}
