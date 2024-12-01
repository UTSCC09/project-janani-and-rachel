import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  CircularProgress,
  Typography,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import StyledTitle from "./StyledTitle";
import MealPlanCard from "./MealPlanCard";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ReminderForm from "./ReminderForm";

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

const PURPLE = "#7e91ff";

export default function CalendarSection() {
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = () => {
    setLoading(true);
    const url = `${domain}/api/recipes/meal-plan?lastVisibleMealId=${lastVisible}`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("idToken")}`,
      GoogleAccessToken: localStorage.getItem("accessToken"),
    };

    fetch(url, {
      method: "GET",
      headers: headers,
    })
      .then((response) => {
        // Check if the response is not OK (status code is not in the range 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Parse the response as JSON
        return response.json();
      })
      .then((data) => {
        // Check if there are no more meal plans to load
        if (!data.mealPlan || data.mealPlan.length === 0) {
          setHasMore(false);
        } else {
          // Update the meal plans state with the new data
          setMealPlans((prevMealPlans) => {
            // Filter out any duplicate meal plans
            const newMealPlans = data.mealPlan.filter(
              (newMealPlan) =>
                !prevMealPlans.some(
                  (existingMealPlan) =>
                    existingMealPlan.recipe.recipeId === newMealPlan.recipe.recipeId
                )
            );
            // Return the updated meal plans array
            return [...prevMealPlans, ...newMealPlans];
          });
          // Update the last visible document for pagination
          setLastVisible(data.lastVisible);
          // Set hasMore to true if there are more meal plans to load
          setHasMore(data.mealPlan.length > 0);
        }
        // Set loading to false after data is loaded
        setLoading(false);
      })
      .catch((error) => {
        // Log any errors that occur during the fetch
        console.error("Error fetching meal plans:", error);
        // Set loading to false if an error occurs
        setLoading(false);
      });
    };

  // copilot did this  
  const handleToggle = (index) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [index]: !prevExpanded[index],
    }));
  };

  const handleDelete = async (mealId) => {
    // loading state to indicate that we are deleting
    setLoading(true);
    try {
      const response = await fetch(
        `${domain}/api/recipes/meal-plan/${mealId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("idToken")}`,
            GoogleAccessToken: localStorage.getItem("accessToken"),
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // update the mealPlans state by filtering out the deleted meal plan
      setMealPlans((prevMealPlans) =>
        prevMealPlans.filter((mealPlan) => mealPlan.mealId !== mealId)
      );
    } catch (error) {
      console.error("Error deleting meal plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWeeklyReminder = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDialogSubmit = () => {
    fetch(
      `${domain}/api/recipes/meal-plan/reminders?daysInAdvanceDefrost=${daysInAdvanceDefrost}&daysInAdvanceBuy=${daysInAdvanceBuy}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("idToken")}`,
          GoogleAccessToken: localStorage.getItem("accessToken"),
        },
      }
    ).then((response) => {
      if (response.ok) {
        setSnackbarOpen(true);
      } else {
        console.error("Failed to set weekly reminder");
      }
    });
    setDialogOpen(false);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ marginBottom: 6, textAlign: "center" }}>
        <StyledTitle>Meal Plans</StyledTitle>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          marginTop: "-2rem",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<NotificationsActiveIcon sx={{ color: PURPLE }} />}
          onClick={handleWeeklyReminder}
          sx={{
            borderColor: PURPLE,
            color: PURPLE,
            "&:hover": {
              borderColor: PURPLE,
              backgroundColor: "rgba(126, 145, 255, 0.1)",
            },
          }}
        >
          Add Google Calendar reminders for all recipes
        </Button>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          marginTop: "1rem",
          marginBottom: "1rem",
        }}
      >
        <ErrorOutlineIcon sx={{ color: PURPLE, marginRight: "0.5rem" }} />
        <Typography variant="body2" sx={{ color: PURPLE }}>
          You can only get reminders if you are signed in with Google.
        </Typography>
      </Box>
      <InfiniteScroll
        dataLength={mealPlans.length}
        next={fetchMealPlans}
        hasMore={hasMore}
        loader={<CircularProgress sx={{ color: PURPLE }} />}
        endMessage={
          <Typography variant="body2" color="textSecondary" align="center">
            No more meal plans
          </Typography>
        }
      >
        {mealPlans.map((mealPlan, index) => (
          <MealPlanCard
            key={index}
            mealPlan={mealPlan}
            index={index}
            expanded={expanded}
            handleToggle={handleToggle}
            handleDelete={handleDelete}
          />
        ))}
      </InfiniteScroll>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Set Weekly Reminder</DialogTitle>
        <DialogContent>
          <ReminderForm
            open={dialogOpen}
            onClose={handleDialogClose}
            onSubmit={handleDialogSubmit}
          />
        </DialogContent>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Reminder set successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
}