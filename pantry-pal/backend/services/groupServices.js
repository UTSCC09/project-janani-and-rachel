import { db, auth } from '../config/firebase.js';

export async function createGroup(uid, groupName) {
    try {
        if (!groupName) {
            throw { status: 400, message: "Group name is required." };
        }

        // create a group
        const groupRef = db.collection('Groups').doc();
        const groupData = {
            groupId: groupRef.id,
            groupName,
            groupMembers: [uid],
            pendingGroupMembers: [],
            createdBy: uid,
        };
        console.log("groupData:", groupData);
        await groupRef.set(groupData);

        // add group to creator's groups
        const userRef = db.collection('Users').doc(uid).collection('Groups').doc(groupRef.id);
        await userRef.set({ 
            groupId: groupRef.id, 
            groupName,
            createdBy: uid,
            pending: false 
        });

        return { groupId: groupRef.id, ...groupData };
    } catch (error) {
        console.error("Error creating group:", error);
        throw error;
    }
}

export async function addMemberToGroup(uid, groupId, memberEmail) {
    // add memeber to pending section of group
    try {
        const groupRef = db.collection('Groups').doc(groupId);
        const groupDoc = await groupRef.get();
        if (!groupDoc.exists) {
            throw { status: 404, message: "Group not found." };
        }
        const groupData = groupDoc.data();

        // checker user is part of the group
        if (!groupData.groupMembers.includes(uid)) {
            throw { status: 400, message: "User is not a member of this group." };
        }


        // find uid of group member
        const user = await auth.getUserByEmail(memberEmail);
        if (!user) {
            throw { status: 404, message: "Group member not found." };
        }
        const memberUid = user.uid;

        // check if user is already a member of the group or pending
        if (groupData.groupMembers.includes(memberUid)) {
            throw { status: 400, message: "User is already a member of this group." };
        }
        if (groupData.pendingGroupMembers.includes(memberUid)) {
            throw { status: 400, message: "User is was already invited join this group." };
        }

        // add member to pending group members
        groupData.pendingGroupMembers.push(memberUid);
        await groupRef.update({ pendingGroupMembers: groupData.pendingGroupMembers });

        // add group to user's pending groups
        const userRef = db.collection('Users').doc(memberUid).collection('Groups').doc(groupId);
        await userRef.set({ 
            groupId, 
            groupName: groupData.groupName, 
            createdBy: groupData.createdBy,
            pending: true });

        return { groupId, ...groupData };
    } catch (error) {
        console.error("Error adding member to group:", error);
        throw error;
    }
}

export async function getGroupInvites(uid) {
    const groups = [];
    const userGroupsRef = db.collection('Users').doc(uid).collection('Groups');
    const userGroupsDoc = await userGroupsRef.where('pending', '==', true).get();
    await Promise.all(userGroupsDoc.docs.map(async (doc) => {
        // get the creators email
        const creator = await auth.getUser(doc.data().createdBy);
        groups.push({ ...doc.data(), creatorEmail: creator.email });
    }));

    return groups;
}

export async function getGroupsICreated(uid) {
    const groups = [];
    const groupsRef = db.collection('Groups');
    const groupsDoc = await groupsRef.where('createdBy', '==', uid).get();
    await Promise.all(groupsDoc.docs.map(async (doc) => {
        groups.push({ ...doc.data() });
    }));
    return groups;
}

export async function acceptGroupInvite(uid, groupId) {
    const groupRef = db.collection('Groups').doc(groupId);
    const groupDoc = await groupRef.get();
    if (!groupDoc.exists) {
        throw { status: 404, message: "Group not found." };
    }
    const groupData = groupDoc.data();

    // move user from pending to group members
    const pendingIndex = groupData.pendingGroupMembers.indexOf(uid);
    if (pendingIndex === -1) {
        throw { status: 400, message: "User is not pending to join this group." };
    }
    groupData.pendingGroupMembers.splice(pendingIndex, 1);
    groupData.groupMembers.push(uid);
    await groupRef.update({ groupMembers: groupData.groupMembers, pendingGroupMembers: groupData.pendingGroupMembers });

    // add group to user's groups
    const userRef = db.collection('Users').doc(uid).collection('Groups').doc(groupId);
    // check if this group already exists in user's groups
    const userGroupDoc = await userRef.get();
    if (userGroupDoc.exists) {
        await userRef.update({ pending: false });
    } else {
        await userRef.set({ 
            groupId, groupName: 
            groupData.groupName, 
            createdBy: groupData.createdBy, 
            pending: false 
        });
    }

    return groupData;
}

export async function declineGroupInvite(uid, groupId) {
    const groupRef = db.collection('Groups').doc(groupId);
    const groupDoc = await groupRef.get();
    if (!groupDoc.exists) {
        throw { status: 404, message: "Group not found." };
    }
    const groupData = groupDoc.data();

    // remove user from pending group members
    const pendingIndex = groupData.pendingGroupMembers.indexOf(uid);
    if (pendingIndex === -1) {
        throw { status: 400, message: "User is not pending to join this group." };
    }
    groupData.pendingGroupMembers.splice(pendingIndex, 1);
    await groupRef.update({ pendingGroupMembers: groupData.pendingGroupMembers });

    // remove group from user's pending groups
    const userRef = db.collection('Users').doc(uid).collection('Groups').doc(groupId);
    await userRef.delete();

    return { message: "Group invite declined." };
}

// if delete the creator of the group, this would delete the group and remove it from all members
export async function leaveGroup(uid, groupId) {
    const groupRef = db.collection('Groups').doc(groupId);
    const groupDoc = await groupRef.get();
    if (!groupDoc.exists) {
        throw { status: 404, message: "Group not found." };
    }
    const groupData = groupDoc.data();

    // check if user is a member of the group
    const memberIndex = groupData.groupMembers.indexOf(uid);
    if (memberIndex === -1) {
        throw { status: 400, message: "User is not a member of this group." };
    }
    groupData.groupMembers.splice(memberIndex, 1);
    
    await groupRef.update({ groupMembers: groupData.groupMembers });

    // remove group from user's groups
    const userRef = db.collection('Users').doc(uid).collection('Groups').doc(groupId);
    await userRef.delete();

    // if the groupMembers and pendingGroupMembers array is empty, delete the group
    if (groupData.groupMembers.length === 0 && groupData.pendingGroupMembers.length === 0) {
        await groupRef.delete();
    }

    // if the owner is removed, delete the group and remove from all members and pending members
    if (groupData.createdBy === uid) {
        await groupRef.delete();
        groupData.groupMembers.forEach(async (member) => {
            const userRef = db.collection('Users').doc(member).collection('Groups').doc(groupId);
            await userRef.delete();
        });
        groupData.pendingGroupMembers.forEach(async (member) => {
            const userRef = db.collection('Users').doc(member).collection('Groups').doc(groupId);
            await userRef.delete();
        });
        return { message: "Group deleted." };
    }

    return { message: `User left group '${groupData.groupName}' successfully` };
}

export async function getUsersGroups(uid) {
    const groups = [];
    const userGroupsRef = db.collection('Users').doc(uid).collection('Groups');
    const userGroupsDoc = await userGroupsRef.where('pending', '==', false).get();
    await Promise.all(userGroupsDoc.docs.map(async (doc) => {
        // get the creators email
        const creator = await auth.getUser(doc.data().createdBy);
        groups.push({ groupId: doc.id, ...doc.data(), creatorEmail: creator.email });
    }));

    return groups;
}

export async function getGroupMembers(uid, groupId) {
    const groupRef = db.collection('Groups').doc(groupId);
    const groupDoc = await groupRef.get();
    if (!groupDoc.exists) {
        throw { status: 404, message: "Group not found." };
    }
    const groupData = groupDoc.data();

    // check if user is a member of the group
    if (!groupData.groupMembers.includes(uid)) {
        throw { status: 400, message: "User is not a member of this group." };
    }

    return groupData.groupMembers;
}

export async function getPantryForGroup(uid, groupId) {
    // get all members of the group and their pantries
    const groupRef = db.collection('Groups').doc(groupId);
    const groupDoc = await groupRef.get();
    if (!groupDoc.exists) {
        throw { status: 404, message: "Group not found." };
    }
    const groupData = groupDoc.data();

    // check if user is a member of the group
    if (!groupData.groupMembers.includes(uid)) {
        throw { status: 400, message: "User is not a member of this group." };
    }

    // get { uid: pantry: } ingredients for all members
    const pantry = [];
    await Promise.all(groupData.groupMembers.map(async (member) => {
        const pantryRef = db.collection('Users').doc(member).collection('Pantry');
        const pantryDoc = await pantryRef.get();
        // get list of ingredient in this member's pantry
        const ingredients = pantryDoc.docs.map((doc) => doc.data());
        pantry.push({uid: member, pantry: ingredients});
    }));

    return pantry;
}

export async function getRecipesForGroup(uid, groupId, limit=10, lastVisibleRecipeId=null) {
    const groupRef = db.collection('Groups').doc(groupId);
    const groupDoc = await groupRef.get();
    if (!groupDoc.exists) {
        throw { status: 404, message: "Group not found." };
    }
    const groupData = groupDoc.data();

    // check if user is a member of the group
    if (!groupData.groupMembers.includes(uid)) {
        throw { status: 400, message: "User is not a member of this group." };
    }

    const recipes = [];
    const recipesRef = db.collection('Groups').doc(groupId).collection('Recipes');
    let query = recipesRef.orderBy('recipeId').limit(limit);
    if (lastVisibleRecipeId) {
        const lastRecipe = await recipesRef.doc(lastVisibleRecipeId).get();
        query = query.startAfter(lastRecipe);
    }
    const recipeDocs = await query.get();
    recipeDocs.forEach((doc) => {
        recipes.push({ recipeId: doc.id, ...doc.data() });
    });

    return recipes;
}

export async function addRecipeToGroup(uid, groupId, recipe) {
    const groupRef = db.collection('Groups').doc(groupId);
    const groupDoc = await groupRef.get();
    if (!groupDoc.exists) {
        throw { status: 404, message: "Group not found." };
    }
    const groupData = groupDoc.data();

    // check if user is a member of the group
    if (!groupData.groupMembers.includes(uid)) {
        throw { status: 400, message: "User is not a member of this group." };
    }
    console.log("recipe:", );

    recipe.recipeId = String(recipe.recipeId);

    // add recipe to group's recipes
    const recipeRef = db.collection('Groups').doc(groupId).collection('Recipes').doc(recipe.recipeId);
    await recipeRef.set(recipe);

    return { recipeId: recipe.recipeId, ...recipe };
}

export async function removeRecipeFromGroup(uid, groupId, recipeId) {
    const groupRef = db.collection('Groups').doc(groupId);
    const groupDoc = await groupRef.get();
    if (!groupDoc.exists) {
        throw { status: 404, message: "Group not found." };
    }
    const groupData = groupDoc.data();

    // check if user is a member of the group
    if (!groupData.groupMembers.includes(uid)) {
        throw { status: 400, message: "User is not a member of this group." };
    }

    // remove recipe from group's recipes
    const recipeRef = db.collection('Groups').doc(groupId).collection('Recipes').doc(recipeId);
    const recipeData = (await recipeRef.get()).data();
    await recipeRef.delete();

    // return deleted recipe data
    return recipeData;
}
