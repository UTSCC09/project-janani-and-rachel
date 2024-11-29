import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, List, ListItem, IconButton, Tooltip, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteButton from './DeleteButton';
import ReminderForm from './ReminderForm';

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

const PURPLE = "#7e91ff";
const YELLOW = "#fffae1";

const MealPlanCard = ({ mealPlan, index, expanded, handleToggle, handleDelete }) => {
  const [reminderFormOpen, setReminderFormOpen] = useState(false);
  const [notificationState, setNotificationState] = useState('default'); // 'default', 'loading', 'success'

  // Parse the date string
  const date = new Date(mealPlan.date);
  const formattedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString();

  const handleNotification = () => {
    setReminderFormOpen(true);
  };

  const handleReminderSubmit = (reminders) => {
    const { daysInAdvanceDefrost, daysInAdvanceBuy } = reminders;
    setNotificationState('loading');
    fetch(`${domain}/api/recipes/meal-plan/${mealPlan.mealId}/reminders?daysInAdvanceDefrost=${daysInAdvanceDefrost}&daysInAdvanceBuy=${daysInAdvanceBuy}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("idToken")}`,
        "GoogleAccessToken": localStorage.getItem('accessToken')
      }
    }).then(response => {
      if (response.ok) {
        setNotificationState('success');
      } else {
        console.error('Failed to set reminders');
        setNotificationState('default');
      }
    }).catch(error => {
      console.error('Error setting reminders:', error);
      setNotificationState('default');
    });
  };

  return (
    <Card
      sx={{
        borderRadius: "16px",
        boxShadow: 3,
        backgroundColor: YELLOW,
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        marginBottom: "1.5rem",
        position: "relative",
        width: "90%",
        left: "2%",
        transition: "transform 0.3s ease-in-out", // Smooth transition for hover effect
        "&:hover": {
          transform: "scale(1.02)", // Zoom out effect on hover
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            backgroundColor: PURPLE,
            padding: "8px 16px",
            borderRadius: "8px",
            width: "95%",
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "600", color: "#fff", textAlign: "center" }}
          >
            {mealPlan.recipe.recipeName}
          </Typography>
          <Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexBasis: "15%", // Take up 15% of the width of the parent container
    flexShrink: 0, // Prevent the children from wrapping
  }}
>
  <IconButton onClick={() => handleToggle(index)} sx={{ color: "#fff" }}>
    {expanded[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
  </IconButton>
  <Tooltip title="Add Google Calendar Reminders to defrost and buy ingredients for this meal" arrow>
    <IconButton onClick={handleNotification} sx={{ color: "#fff" }}>
      {notificationState === 'default' && <NotificationsIcon />}
      {notificationState === 'loading' && <CircularProgress size={24} sx={{ color: "#fff" }} />}
      {notificationState === 'success' && <NotificationsActiveIcon />}
    </IconButton>
  </Tooltip>
  <ReminderForm
    open={reminderFormOpen}
    onClose={() => setReminderFormOpen(false)}
    onSubmit={handleReminderSubmit}
  />
  <Tooltip title="Delete Meal Plan" arrow>
    <DeleteButton onClick={() => handleDelete(mealPlan.mealId)} />
  </Tooltip>
</Box>
        </Box>

        <Box sx={{ marginBottom: "1.5rem", display: "flex", alignItems: "center" }}>
          <CalendarTodayIcon sx={{ color: PURPLE, marginRight: "0.5rem" }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: "500", color: PURPLE }}
          >
            <strong>Planned On:</strong> {formattedDate}
          </Typography>
        </Box>

        {expanded[index] && (
          <>
            <Box
              sx={{
                marginBottom: "1rem",
                backgroundColor: "#fff", // White background for the box
                padding: "1rem",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "500", color: PURPLE, marginBottom: "0.5rem" }}
              >
                <strong>Instructions:</strong>
              </Typography>
              {mealPlan.recipe.instructions.map((instruction, idx) => (
                <Typography key={idx} variant="body2" sx={{ color: "#000000" }}>
                  {instruction.number}. {instruction.step}
                </Typography>
              ))}
            </Box>

            <Box
              sx={{
                marginBottom: "1rem",
                backgroundColor: "#fff", // White background for the box
                padding: "1rem",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "500", color: PURPLE, marginBottom: "0.5rem" }}
              >
                <strong>Pantry Ingredients:</strong>
              </Typography>
              <List>
                {mealPlan.pantryIngredients.map((ingredient, idx) => (
                  <ListItem key={idx} sx={{ padding: "0.25rem 0" }}>
                    <Typography variant="body2" sx={{ color: "#000000" }}>
                      {ingredient}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box
              sx={{
                marginBottom: "1rem",
                backgroundColor: "#fff", // White background for the box
                padding: "1rem",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "500", color: PURPLE, marginBottom: "0.5rem" }}
              >
                <strong>Shopping List Ingredients:</strong>
              </Typography>
              <List>
                {mealPlan.shoppingListIngredients.map((ingredient, idx) => (
                  <ListItem key={idx} sx={{ padding: "0.25rem 0" }}>
                    <Typography variant="body2" sx={{ color: "#000000" }}>
                      {ingredient}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MealPlanCard;