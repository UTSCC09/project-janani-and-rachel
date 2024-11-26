import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import StyledTitle from './StyledTitle';
import MealPlanCard from './MealPlanCard';

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

const PURPLE = "#7e91ff";

export default function CalendarSection() {
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = () => {
    setLoading(true);
    const url = `${domain}/api/recipes/meal-plan?lastVisibleMealId=${lastVisible || ''}`;
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("idToken")}`,
      "GoogleAccessToken": localStorage.getItem('accessToken')
    };

    fetch(url, {
      method: "GET",
      headers: headers
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (!data.mealPlan || data.mealPlan.length === 0) {
          setHasMore(false);
        } else {
          setMealPlans(prevMealPlans => {
            const newMealPlans = data.mealPlan.filter(
              newMealPlan => !prevMealPlans.some(
                existingMealPlan => existingMealPlan.recipe.recipeId === newMealPlan.recipe.recipeId
              )
            );
            return [...prevMealPlans, ...newMealPlans];
          });
          setLastVisible(data.lastVisible);
          setHasMore(data.mealPlan.length > 0);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching meal plans:', error);
        setLoading(false);
      });
  };

  const handleToggle = (index) => {
    setExpanded(prevExpanded => ({
      ...prevExpanded,
      [index]: !prevExpanded[index]
    }));
  };

  const handleDelete = async (mealId) => {
    setLoading(true);
    try {
      const response = await fetch(`${domain}/api/recipes/meal-plan/${mealId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("idToken")}`,
          "GoogleAccessToken": localStorage.getItem('accessToken')
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setMealPlans(prevMealPlans => prevMealPlans.filter(mealPlan => mealPlan.mealId !== mealId));
    } catch (error) {
      console.error('Error deleting meal plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ marginBottom: 6 }}>
        <StyledTitle>Meal Plans</StyledTitle>
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
    </Container>
  );
}