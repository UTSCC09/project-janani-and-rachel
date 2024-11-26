import { db } from '../config/firebase.js';
import { google } from 'googleapis';

export async function addMealReminders(uid, mealId, googleAccessToken, daysInAdvanceDefrost=1, daysInAdvanceBuy=3) {
    if (!googleAccessToken) {
        throw { status: 401, message: "Google access token required." };
    }
    if (!mealId) {
        throw { status: 400, message: "Missing mealId." };
    }

    // get the frozen ingredients and shopping list ingredients in meal plan
    const mealPlanRef = db.collection('Users').doc(uid).collection('MealPlan').doc(mealId);
    const mealPlanDoc = await mealPlanRef.get();
    if (!mealPlanDoc.exists) {
        throw { status: 404, message: "Meal plan not found." };
    }
    const { frozenIngredients, shoppingListIngredients, date, recipe } = mealPlanDoc.data();

    // get name of recipe from recipe ref, recipe refers to recipe ref
    const recipeRef = db.doc(recipe.path);
    const recipeDoc = await recipeRef.get();
    if (!recipeDoc.exists) {
        throw { status: 404, message: "Recipe not found." };
    }
    const recipeData = recipeDoc.data();
    const recipeName = recipeData.recipeName;

    // get access to user's google tasks
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: googleAccessToken });
    const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
    const mealsTaskListName = 'Pantry Pal: Meal Plan';
    const remindersTaskListName = 'Pantry Pal: Meal Prep Reminders';

    const dateInMs = date._seconds*1000;
    const oneDayInMs = 86400000;

    // ADD MEAL

    // check if task list called pantry pal meal plan already exists
    let taskLists = await tasks.tasklists.list();
    let pantryPalTaskList = taskLists.data.items.find((list) => list.title === mealsTaskListName);
    // if it doenst exist, create it
    let taskListId;
    if (!pantryPalTaskList) {
        const taskList = {
            title: mealsTaskListName
        };
        const taskListRes = await tasks.tasklists.insert({ resource: taskList });
        taskListId = taskListRes.data.id;

    } else {
        taskListId = pantryPalTaskList.id;
    }

    // create an task for the meal
    const mealTask = {
        title: `Prepare ${recipeName}`,
        due: new Date(dateInMs)
    };
    await tasks.tasks.insert({ tasklist: taskListId, resource: mealTask });

    // ADD MEAL PREP REMINDERS

    // check if task list called pantry pal meal plan reminders already exists
    taskLists = await tasks.tasklists.list();
    pantryPalTaskList = taskLists.data.items.find((list) => list.title === remindersTaskListName);
    // if it doenst exist, create it
    if (!pantryPalTaskList) {
        const taskList = {
            title: remindersTaskListName
        };
        const taskListRes = await tasks.tasklists.insert({ resource: taskList });
        taskListId = taskListRes.data.id;

    } else {
        taskListId = pantryPalTaskList.id;
    }

    // create tasks for defrosting and buying ingredients
    await Promise.all(frozenIngredients.map(async (ingredient) => {
        const task = {
            title: `Defrost ${ingredient}`,
            due: new Date(dateInMs - daysInAdvanceDefrost*oneDayInMs), // 1 day before meal date, 1 day = 86400000 ms
            notes: `Defrost ${ingredient} for ${recipeName} in ${daysInAdvanceDefrost} day(s).`
        };
        await tasks.tasks.insert({ tasklist: taskListId, resource: task });
    }));

    await Promise.all(shoppingListIngredients.map(async (ingredient) => {
        const task = {
            title: `Buy ${ingredient}`,
            due: new Date(dateInMs - daysInAdvanceBuy*oneDayInMs), // 3 days before meal date, 3 days = 259200000 ms
            notes: `Buy ${ingredient} for ${recipeName} in ${daysInAdvanceBuy} day(s).`
        };
        await tasks.tasks.insert({ tasklist: taskListId, resource: task});
    }));
}

export async function addThisWeeksMealReminders(uid, googleAccessToken, daysInAdvanceDefrost=1, daysInAdvanceBuy=3) {
    if (!googleAccessToken) {
        throw { status: 401, message: "Google access token required." };
    }
    
    // get the meal plans for the week
    const mealPlansRef = db.collection('Users').doc(uid).collection('MealPlan')
        .where('date', '>=', new Date().getTime()).where('date', '<=', new Date().getTime() + 604800000); 
    const mealPlans = await mealPlansRef.get();

    // loop through each meal plan and add to tasks list using above function 
    await Promise.all(mealPlans.docs.map(async (mealPlan) => {
        await addMealReminders(uid, mealPlan.data().mealId, googleAccessToken, daysInAdvanceDefrost, daysInAdvanceBuy);
    }));
    
}
