import { db } from '../config/firebase.js';
import { google } from 'googleapis';

export async function addReminders(uid, mealId, googleAccessToken) {
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
    const { frozenIngredients, shoppingListIngredients, date } = mealPlanDoc.data();

    // get access to user's google tasks and calendar
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: googleAccessToken });
    //const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
    const taskListName = 'Pantry Pal Meal Plans';

    const dateInMs = date._seconds*1000;
    const oneDayInMs = 86400000;

    // check if task list called "Pantry Pal Meal Plans" already exists
    const taskLists = await tasks.tasklists.list();
    const pantryPalTaskList = taskLists.data.items.find((list) => list.title === taskListName);
    // if it doenst exist, create it
    let taskListId;
    if (!pantryPalTaskList) {
        const taskList = {
            title: taskListName
        };
        const taskListRes = await tasks.tasklists.insert({ resource: taskList });
        taskListId = taskListRes.data.id;
        
    } else {
        taskListId = pantryPalTaskList.id;
    }

    // add reminders for frozen ingredients in google tasks
    await Promise.all(frozenIngredients.map(async (ingredient) => {
        const task = {
            title: `Defrost ${ingredient}`,
            due: new Date(dateInMs - oneDayInMs), // 1 day before meal date, 1 day = 86400000 ms
            notes: `Defrost ${ingredient} for tomorrow's meal.`
        };
        await tasks.tasks.insert({ tasklist: taskListId, resource: task });
    }));

    // add reminders for shopping list ingredients in google tasks
    await Promise.all(shoppingListIngredients.map(async (ingredient) => {
        const task = {
            title: `Buy ${ingredient}`,
            due: new Date(dateInMs - 3*oneDayInMs), // 3 days before meal date, 3 days = 259200000 ms
            notes: `Buy ${ingredient} for upcoming meal.`
        };
        await tasks.tasks.insert({ tasklist: taskListId, resource: task });
    }));
}

export async function addMealsToCalendar(uid, googleAccessToken) {
    if (!googleAccessToken) {
        throw { status: 401, message: "Google access token required." };
    }
    
    // get the meal plans for the week
    const mealPlansRef = db.collection('Users').doc(uid).collection('MealPlan')
        .where('date', '>=', new Date().getTime()).where('date', '<=', new Date().getTime() + 604800000); 
    const mealPlans = await mealPlansRef.get();
}
