import Joi from 'joi';
import { simpleStringSchema, sanitizeAndValidateData, alphanumericStringSchema } from './generalValidator.js';

const groupSchema = Joi.object({
    groupName: simpleStringSchema.required(),
    groupMembers: Joi.array().items(simpleStringSchema).allow(null).allow(''),
    groupId: alphanumericStringSchema.allow(null).allow(''),
    pendingGroupMembers: Joi.array().items(simpleStringSchema).allow(null).allow(''),
    createdBy: alphanumericStringSchema.allow(null).allow('')
});

const groupMemberSchema = Joi.object({
    memberEmail: Joi.string().email().required()
});

const groupParamsSchema = Joi.object({
    groupId: alphanumericStringSchema.required(),
    recipeId: alphanumericStringSchema.allow(null).allow(''),
    memberId: alphanumericStringSchema.allow(null).allow('')
});

export const sanitizeAndValidateGroup = sanitizeAndValidateData(groupSchema);
export const sanitizeAndValidateGroupMember = sanitizeAndValidateData(groupMemberSchema);
export const sanitizeAndValidateGroupParams = sanitizeAndValidateData(groupParamsSchema, 'params');
