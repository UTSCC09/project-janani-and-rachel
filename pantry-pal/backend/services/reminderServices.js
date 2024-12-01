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

    // check if the meal (same name and time) exists in the task list
    // if it doesnt, create it
    let mealTaskList = await tasks.tasks.list({ tasklist: taskListId });
    let mealTaskExist = mealTaskList.data.items.some((task) => {
        // Convert the task's due date to 'YYYY-MM-DD' format
        const taskDueDate = new Date(task.due).toISOString().split("T")[0];  // Strip time part
        
        // Convert the input date to 'YYYY-MM-DD' format
        const inputDate = new Date(dateInMs).toISOString().split("T")[0];  // Strip time 
        
        const curDate = new Date().toISOString().split("T")[0];  // Strip time part

        console.log('taskDueDate:', taskDueDate);
        console.log('inputDate:', inputDate);
        
        // only create if the task does not exist and the date is in the future
        return task.title === `Prepare ${recipeName}` && taskDueDate === inputDate && inputDate >= curDate;
    });

    if (!mealTaskExist) {
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
        if (!frozenIngredients) {
            frozenIngredients = [];
        }
        await Promise.all(frozenIngredients.map(async (ingredient) => {            
            const task = {
                title: `Defrost ${ingredient}`,
                due: new Date(dateInMs - daysInAdvanceDefrost*oneDayInMs), // 1 day before meal date, 1 day = 86400000 ms
                notes: `Defrost ${ingredient} for "${recipeName}" in ${daysInAdvanceDefrost} day(s).`
            };
            await tasks.tasks.insert({ tasklist: taskListId, resource: task });
        }));

        if (!shoppingListIngredients) {
            shoppingListIngredients = [];
        }
        await Promise.all(shoppingListIngredients.map(async (ingredient) => {
            // if we are already buying the ingredient for the meal, 
                // update the reminder to be the earlier of the two
                // update the note to included the new meal name and update how far away from the two meals the reminder is
            
            // check if the ingredient is already in the task list
            let ingredientTaskList = await tasks.tasks.list({ tasklist: taskListId });
            let ingredientTaskExist = await ingredientTaskList.data.items.some((task) => {
                // cannot be in the past and need to have the same name
                const taskDueDate = new Date(task.due).getTime();
                let curDate = new Date().getTime() - 86400000;  // Strip time part
                return task.title == `Buy ${ingredient}` && taskDueDate >= curDate;
            });
            
            if (ingredientTaskExist) {
                // update the task
                const task = await ingredientTaskList.data.items.find((task) => task.title === `Buy ${ingredient}`);
                // if the new due date is earlier than the current due date, update the task
                const taskDueDate = new Date(task.due).getTime();
                const taskDueDateStr = new Date(task.due).toISOString().split("T")[0];
                const newDueDate = new Date(dateInMs - daysInAdvanceBuy*oneDayInMs).getTime();
                const newDueDateStr = new Date(dateInMs - daysInAdvanceBuy*oneDayInMs).toISOString().split("T")[0];
                const taskNotes = task.notes.split('"');
                const oldRecipeName = taskNotes[1];
                const oldDaysInAdvanceBuy = parseInt(taskNotes[2].split(' ')[2]);
                const restOfNote = task.notes.split('and')[1];
                if (newDueDate < taskDueDate) {
                    task.due = new Date(dateInMs - daysInAdvanceBuy*oneDayInMs);
                    task.notes = `Buy ${ingredient} for "${recipeName}" in ${daysInAdvanceBuy} day(s) and for "${oldRecipeName}" on ${taskDueDateStr}.`;
                    if (restOfNote) {
                        task.notes = task.notes.slice(0, -1) + ' and' + restOfNote;
                    }
                    await tasks.tasks.update({ tasklist: taskListId, task: task.id, resource: task });
                } else {
                    task.notes = `Buy ${ingredient} for "${oldRecipeName}" in ${oldDaysInAdvanceBuy} day(s) and for "${recipeName}" on ${newDueDateStr}.`;
                    if (restOfNote) {
                        task.notes = task.notes.slice(0, -1) + ' and' + restOfNote;
                    }
                    await tasks.tasks.update({ tasklist: taskListId, task: task.id, resource: task });
                }
                return;
            }
            else {
                // create a new task
                const task = {
                    title: `Buy ${ingredient}`,
                    due: new Date(dateInMs - daysInAdvanceBuy*oneDayInMs), // 3 days before meal date, 3 days = 259200000 ms
                    notes: `Buy ${ingredient} for "${recipeName}" in ${daysInAdvanceBuy} day(s).`
                };
                await tasks.tasks.insert({ tasklist: taskListId, resource: task });
            }
        }));
    }
    else {
        console.log(`Meal reminder for ${recipeName} on ${new Date(dateInMs).toISOString().split("T")[0]} already exists.`);
        throw { status: 409, message: `Meal reminder for ${recipeName} on ${new Date(dateInMs).toISOString().split("T")[0]} already exists.` };
    }

    
}

export async function addAllMealReminders(uid, googleAccessToken, daysInAdvanceDefrost=1, daysInAdvanceBuy=3) {
    if (!googleAccessToken) {
        throw { status: 401, message: "Google access token required." };
    }

    // get the meal plans for the week
    // want to access _seconds of date field object
    const mealPlansRef = db.collection('Users').doc(uid).collection('MealPlan')
        //.where('date', '>=', today)//.where('date', '<=', oneWeekLater); 
    const mealPlans = await mealPlansRef.get();

    console.log('mealPlans:', mealPlans.docs);

    // add reminder for frist meal and then the rest to avoid race conditions
    if (mealPlans.docs.length > 0) {
        const firstMealPlan = mealPlans.docs[0];
        try {
            await addMealReminders(uid, firstMealPlan.data().mealId, googleAccessToken, daysInAdvanceDefrost, daysInAdvanceBuy);
        } catch (error) {
            console.error(`Failed to add reminders for meal ${firstMealPlan.id}:`, error);
        }
    } else {
        return;
    }

    if (mealPlans.docs.length === 1) {
        return;
    }

    // loop through each meal plan and add to tasks list using above function 
    await Promise.all(mealPlans.docs.slice(1).map(async (mealPlan) => {
        try {
            await addMealReminders(uid, mealPlan.data().mealId, googleAccessToken, daysInAdvanceDefrost, daysInAdvanceBuy);
        } catch (error) {
            console.error(`Failed to add reminders for meal ${mealPlan.id}:`, error);
        }
    }));
    
}

// the the ingredient exists, mark it as defrosted
export async function markDefrostTaskComplete(uid, ingredientName, googleAccessToken) {
    try {
        // look at google tasks for today and delete the task if it exists
        // doesnt need to happy today, just needs to exist
        if (!googleAccessToken) {
            return;
        }
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: googleAccessToken });
        const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
        const taskLists = await tasks.tasklists.list();
        const pantryPalTaskList = await taskLists.data.items.find((list) => list.title === 'Pantry Pal: Meal Prep Reminders');
        if (!pantryPalTaskList) {
            return;
        }
        const taskListId = pantryPalTaskList.id;
        const taskList = await tasks.tasks.list({ tasklist: taskListId });
        // mark all ingredient like this as complete if their date is after rn
        const defrostTasks = await taskList.data.items.filter((task) => task.title === `Defrost ${ingredientName}`);
        if (!defrostTasks) {
            return;
        }
        await Promise.all(defrostTasks.map(async (task) => {
            task.status = 'completed';
            await tasks.tasks.update({ tasklist: taskListId, task: task.id, resource: task });
        }));
    } catch (error) {
        return;
    }
}

export async function deleteDefrostTask(uid, ingredientName, googleAccessToken) {
    try {
        if (!googleAccessToken) {
            return;
        }
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: googleAccessToken });
        const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
        const taskLists = await tasks.tasklists.list();
        const pantryPalTaskList = await taskLists.data.items.find((list) => list.title === 'Pantry Pal: Meal Prep Reminders');
        if (!pantryPalTaskList) {
            return;
        }
        const taskListId = pantryPalTaskList.id;
        const taskList = await tasks.tasks.list({ tasklist: taskListId });
        // delete all ingredient like this if their date is after rn
        const defrostTasks = await taskList.data.items.filter((task) => task.title === `Defrost ${ingredientName}`);
        await Promise.all(defrostTasks.map(async (task) => {
            await tasks.tasks.delete({ tasklist: taskListId, task: task.id });
        }));
    } catch (error) {
        return;
    }
}

// the the ingredient exists, mark it as not defrosted
export async function markDefrostTaskIncomplete(uid, ingredientName, googleAccessToken) {
    try {
        if (!googleAccessToken) {
            return;
        }
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: googleAccessToken });
        const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
        const taskLists = await tasks.tasklists.list();
        const pantryPalTaskList = await taskLists.data.items.find((list) => list.title === 'Pantry Pal: Meal Prep Reminders');
        if (!pantryPalTaskList) {
            return;
        }
        const taskListId = pantryPalTaskList.id;
        const taskList = await tasks.tasks.list({ tasklist: taskListId });
        // mark all ingredient like this as incomplete if their date is after rn
        const defrostTasks = await taskList.data.items.filter((task) => task.title === `Defrost ${ingredientName}`);
        const today = new Date().toISOString().split("T")[0];
        const todayInMs = new Date(today).getTime();
        await Promise.all(defrostTasks.map(async (task) => {
            const taskDueDate = new Date(task.due).getTime();
            if (taskDueDate >= todayInMs) {
                task.status = 'needsAction';
                await tasks.tasks.update({ tasklist: taskListId, task: task.id, resource: task });
            }
        }));
    } catch (error) {
        return;
    }
}


// if you delete an ingredient from you shopping list, check if you have a google task buying it ever
// if you do, delete it
export async function deleteBuyTask(uid, ingredientName, googleAccessToken) {
    try {
        if (!googleAccessToken) {
            return;
        }
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: googleAccessToken });
        const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
        const taskLists = await tasks.tasklists.list();
        const pantryPalTaskList = await taskLists.data.items.find((list) => list.title === 'Pantry Pal: Meal Prep Reminders');
        if (!pantryPalTaskList) {
            return;
        }
        const taskListId = pantryPalTaskList.id;
        const taskList = await tasks.tasks.list({ tasklist: taskListId });
        // delete all buy tasks
        const buyTasks = await taskList.data.items.filter((task) => task.title === `Buy ${ingredientName}`);
        await Promise.all(buyTasks.map(async (task) => {
            await tasks.tasks.delete({ tasklist: taskListId, task: task.id });
        }));
    } catch (error) {
        return;
    }
}

export async function markBuyTaskComplete(uid, ingredientName, googleAccessToken) {
    try {
        if (!googleAccessToken) {
            return;
        }
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: googleAccessToken });
        const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
        const taskLists = await tasks.tasklists.list();
        const pantryPalTaskList = await taskLists.data.items.find((list) => list.title === 'Pantry Pal: Meal Prep Reminders');
        if (!pantryPalTaskList) {
            return;
        }
        const taskListId = pantryPalTaskList.id;
        const taskList = await tasks.tasks.list({ tasklist: taskListId });
        // mark all ingredient like this as complete
        const buyTasks = await taskList.data.items.filter((task) => task.title === `Buy ${ingredientName}`);
        await Promise.all(buyTasks.map(async (task) => {
            task.status = 'completed';
            await tasks.tasks.update({ tasklist: taskListId, task: task.id, resource: task });
        }));
    } catch (error) {
        return;
    }
}

export async function renameFrozenIngredient(uid, oldIngredientName, newIngredientName, googleAccessToken) {
    try {
        if (!googleAccessToken) {
            return;
        }
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: googleAccessToken });
        const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
        const taskLists = await tasks.tasklists.list();
        const pantryPalTaskList = await taskLists.data.items.find((list) => list.title === 'Pantry Pal: Meal Prep Reminders');
        if (!pantryPalTaskList) {
            return;
        }
        const taskListId = pantryPalTaskList.id;
        const taskList = await tasks.tasks.list({ tasklist: taskListId });
        // rename all tasks with the old ingredient name to the new ingredient name and after today
        const defrostTasks = await taskList.data.items.filter((task) => task.title === `Defrost ${oldIngredientName}`);
        const today = new Date().toISOString().split("T")[0];
        const todayInMs = new Date(today).getTime();
        await Promise.all(defrostTasks.map(async (task) => {
            const taskDueDate = new Date(task.due).getTime();
            if (taskDueDate >= todayInMs) {
                task.title = `Defrost ${newIngredientName}`;
                task.notes = task.notes.replace(oldIngredientName, newIngredientName);
                await tasks.tasks.update({ tasklist: taskListId, task: task.id, resource: task });
            }
        }));
    } catch (error) {
        return;
    }
}

export async function renameShoppingListIngredient(uid, oldIngredientName, newIngredientName, googleAccessToken) {
    try {
        if (!googleAccessToken) {
            return;
        }
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: googleAccessToken });
        const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
        const taskLists = await tasks.tasklists.list();
        const pantryPalTaskList = await taskLists.data.items.find((list) => list.title === 'Pantry Pal: Meal Prep Reminders');
        const taskListId = pantryPalTaskList.id;
        const taskList = await tasks.tasks.list({ tasklist: taskListId });
        // rename all tasks with the old ingredient name to the new ingredient name and after today
        const buyTasks = await taskList.data.items.filter((task) => task.title === `Buy ${oldIngredientName}`);
        const today = new Date().toISOString().split("T")[0];
        const todayInMs = new Date(today).getTime();
        await Promise.all(buyTasks.map(async (task) => {
            const taskDueDate = new Date(task.due).getTime();
            if (taskDueDate >= todayInMs) {
                task.title = `Buy ${newIngredientName}`;
                task.notes = task.notes.replace(oldIngredientName, newIngredientName);
                await tasks.tasks.update({ tasklist: taskListId, task: task.id, resource: task });
            }
        }));
    } catch (error) {
        return;
    }
}


