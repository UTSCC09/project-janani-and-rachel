import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { createGroup, addMemberToGroup, getGroupInvites, acceptGroupInvite, declineGroupInvite, leaveGroup, 
    getUsersGroups, getGroupsICreated, getGroupMembers, getPantryForGroup, getRecipesForGroup, addRecipeToGroup, 
    removeRecipeFromGroup, getPantryOfGroupMember } 
    from '../services/groupServices.js';
import { searchRecipesByMaxMatchingForGroup } from '../services/searchRecipeServices.js';
import { sanitizeAndValidateRecipe } from '../validators/recipeValidator.js';
import { sanitizeAndValidateGroup, sanitizeAndValidateGroupMember, sanitizeAndValidateGroupParams } 
    from '../validators/groupValidator.js';

export const router = express.Router();

router.use(verifyToken);

// get all pantry ingredients for group
router.get('/:groupId/pantry', sanitizeAndValidateGroupParams, (req, res, next) => {
    const uid = req.uid;
    const groupId = req.params.groupId;
    getPantryForGroup(uid, groupId).then((ingredients) => {
        res.json(ingredients);
    }).catch((error) => {
        console.error("Error fetching pantry ingredients for group:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while fetching pantry ingredients for group." });
    });
});

// get all recipes for group
router.get('/:groupId/recipes', sanitizeAndValidateGroupParams, (req, res, next) => {
    const uid = req.uid;
    const groupId = req.params.groupId;
    const limit = parseInt(req.query.limit) || 10;
    const lastVisibleRecipeId = req.query.lastVisibleRecipeId;
    getRecipesForGroup(uid, groupId, limit, lastVisibleRecipeId).then((recipes) => {
        res.json(recipes);
    }).catch((error) => {
        console.error("Error fetching recipes for group:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while fetching recipes for group." });
    });
});

// search recipes by most matching for group
router.get('/:groupId/search-most-matching', sanitizeAndValidateGroupParams, (req, res, next) => {
    const uid = req.uid;
    const groupId = req.params.groupId;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        searchRecipesByMaxMatchingForGroup(uid, groupId, page, limit).then((recipes) => {
            res.json(recipes);
        }).catch((error) => {
            console.error("Error searching recipes by most matching for group:", error);
            res.status(error.status || 500)
                .json({ error: error.message || "An error occurred while fetching recipes." });
        });
    } catch (error) {
        console.error("Error parsing query parameters:", error);
        res.status(400).json({ error: "Invalid query parameters." });
    }
    
});

// create a group
router.post('/', sanitizeAndValidateGroup, (req, res, next) => {
    const uid = req.uid;
    const { groupName } = req.body;
    createGroup(uid, groupName).then((group) => {
        res.json(group);
    }).catch((error) => {
        console.error("Error creating group:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while creating group." });
    });
});

// get pantry of group member
router.get('/:groupId/members/:memberId/pantry', sanitizeAndValidateGroupParams, (req, res, next) => {
    const uid = req.uid;
    const groupId = req.params.groupId;
    const memberId = req.params.memberId;
    const limit = parseInt(req.query.limit) || 10;
    const lastVisibleIngredient = req.query.lastVisibleIngredient || null;
    getPantryOfGroupMember(uid, groupId, memberId, limit, lastVisibleIngredient).then((ingredients) => {
        res.json(ingredients);
    }).catch((error) => {
        console.error("Error fetching pantry ingredients for group member:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while fetching pantry ingredients for group member." });
    });
});

// add a member to a group
router.post('/:groupId/members', sanitizeAndValidateGroupParams, sanitizeAndValidateGroupMember, (req, res, next) => {
    const uid = req.uid;
    const groupId = req.params.groupId;
    const { memberEmail } = req.body;
    addMemberToGroup(uid, groupId, memberEmail).then((group) => {
        res.json(group);
    }).catch((error) => {
        console.error("Error adding member to group:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while adding member to group." });
    });
});

// get all group invites
router.get('/invites', (req, res, next) => {
    const uid = req.uid;
    const limit = parseInt(req.query.limit) || 10;
    const lastVisibleGroupId = req.query.lastVisibleGroupId;
    getGroupInvites(uid, limit, lastVisibleGroupId).then((invites) => {
        res.json(invites);
    }).catch((error) => {
        console.error("Error fetching group invites:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while fetching group invites." });
    });
});

// accept a group invite
router.post('/:groupId/accept', sanitizeAndValidateGroupParams, (req, res, next) => {
    const uid = req.uid;
    const groupId = req.params.groupId;
    acceptGroupInvite(uid, groupId).then((group) => {
        res.json(group);
    }).catch((error) => {
        console.error("Error accepting group invite:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while accepting group invite." });
    });
});

// decline a group invite
router.post('/:groupId/decline', sanitizeAndValidateGroupParams, (req, res, next) => {
    const uid = req.uid;
    const groupId = req.params.groupId;
    declineGroupInvite(uid, groupId).then((group) => {
        res.json(group);
    }).catch((error) => {
        console.error("Error declining group invite:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while declining group invite." });
    });
});

// leave a group
router.delete('/:groupId', sanitizeAndValidateGroupParams, (req, res, next) => {
    const uid = req.uid;
    const groupId = req.params.groupId;
    leaveGroup(uid, groupId).then((group) => {
        res.json(group);
    }).catch((error) => {
        console.error("Error leaving group:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while leaving group." });
    });
});

// get all members of a group
router.get('/:groupId/members', sanitizeAndValidateGroupParams, (req, res, next) => {
    const uid = req.uid;
    const groupId = req.params.groupId;
    getGroupMembers(uid, groupId).then((members) => {
        res.json(members);
    }).catch((error) => {
        console.error("Error fetching group members:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while fetching group members." });
    });
});

// get all groups created by user
router.get('/created-by-me', (req, res, next) => {
    const uid = req.uid;
    const limit = parseInt(req.query.limit) || 10;
    const lastVisibleGroupId = req.query.lastVisibleGroupId;
    getGroupsICreated(uid, limit, lastVisibleGroupId).then((groups) => {
        res.json(groups);
    }).catch((error) => {
        console.error("Error fetching groups created by user:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while fetching groups created by user." });
    });
});

// add a recipe to a group
router.post('/:groupId/recipes', sanitizeAndValidateGroupParams, sanitizeAndValidateRecipe, (req, res, next) => {
    const uid = req.uid;
    const groupId = req.params.groupId;
    const recipe = req.body;
    addRecipeToGroup(uid, groupId, recipe).then((group) => {
        res.json(group);
    }).catch((error) => {
        console.error("Error adding recipe to group:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while adding recipe to group." });
    });
});

// remove a recipe from a group
router.delete('/:groupId/recipes/:recipeId', sanitizeAndValidateGroupParams, (req, res, next) => {
    const uid = req.uid;
    const groupId = req.params.groupId;
    const recipeId = req.params.recipeId;
    removeRecipeFromGroup(uid, groupId, recipeId).then((group) => {
        res.json(group);
    }).catch((error) => {
        console.error("Error removing recipe from group:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while removing recipe from group." });
    });
});

// get all groups for user
router.get('/', (req, res, next) => {
    const uid = req.uid;
    const limit = parseInt(req.query.limit) || 10;
    const lastVisibleGroupId = req.query.lastVisibleGroupId;
    getUsersGroups(uid, limit, lastVisibleGroupId).then((groups) => {
        res.json(groups);
    }).catch((error) => {
        console.error("Error fetching user's groups:", error);
        res.status(error.status || 500)
            .json({ error: error.message || "An error occurred while fetching user's groups." });
    });
});

