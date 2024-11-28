import React, { useState } from 'react';
import { Card, CardContent, Box, Typography, IconButton, Tooltip, Button, TextField, Checkbox, List, ListItem, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { MdEvent } from "react-icons/md";
import DeleteButton from './DeleteButton';
import InfoIcon from '@mui/icons-material/Info';


const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;
const PURPLE = "#7e91ff";
const LIGHT_GRAY = "#d3d3d3";

const RecipeCard = ({ recipe, lastRecipeElementRef, handleDelete }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [open, setOpen] = useState(false);
  const [aiSplit, setAiSplit] = useState(null);
  const [manualSplit, setManualSplit] = useState(false);
  const [ingredients, setIngredients] = useState(recipe.ingredients.map(ingredient => ({
    name: ingredient,
    inPantry: false,
  })));
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handlePantryComparison = () => {
    setLoading(true);
    setErrorMessage('');
    fetch(`${domain}/api/recipes/favorites/${recipe.recipeId}/pantry-comparison`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("idToken")}`,
        "GoogleAccessToken": localStorage.getItem('accessToken')
      }
    })
      .then(response => {
        if (!response.ok) {
          if (response.status === 500) {
            // Handle 500 error by opening the popup for manual split
            setAiSplit(null);
            setManualSplit(true);
            setErrorMessage('AI split failed');
            setOpen(true);
            setLoading(false);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('AI Pantry split:', data);
        if (data && data.matchingIngredients && data.missingIngredients) {
          setAiSplit({
            inPantry: data.matchingIngredients,
            notInPantry: data.missingIngredients,
          });
          setManualSplit(false);
        } else {
          setAiSplit(null);
          setManualSplit(true);
          setErrorMessage('AI split failed');
        }
        setOpen(true);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error with pantry comparison:', error);
        setAiSplit(null);
        setManualSplit(true);
        setErrorMessage('AI split failed');
        setOpen(true);
        setLoading(false);
      });
  };

  const handleAddToMealPlan = (e) => {
    e.preventDefault();
    const mealPlanData = {
      recipeId: recipe.recipeId,
      ingredients: ingredients.map(ingredient => ({
        ingredientName: ingredient.name,
        inPantry: ingredient.inPantry,
      })),
      date: selectedDate,
    };

    fetch(`${domain}/api/recipes/meal-plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("idToken")}`,
        "GoogleAccessToken": localStorage.getItem('accessToken')
      },
      body: JSON.stringify(mealPlanData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Recipe added to meal plan:', data);
        setOpen(false);
      })
      .catch(error => {
        console.error('Error adding recipe to meal plan:', error);
      });
  };

  const handleManualSplit = () => {
    setManualSplit(true);
  };

  const handleCheckboxChange = (index) => {
    setIngredients(prev =>
      prev.map((ingredient, i) =>
        i === index ? { ...ingredient, inPantry: !ingredient.inPantry } : ingredient
      )
    );
  };

  const handleClose = () => {
    setOpen(false);
    setManualSplit(false);
    setAiSplit(null);
    setErrorMessage('');
  };

  return (
    <Card
      ref={lastRecipeElementRef}
      sx={{
        borderRadius: "16px",
        boxShadow: 3,
        backgroundColor: "#fffae1", // Light pastel background for cards
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        marginBottom: "1.5rem", // Reduced margin for better spacing
        position: "relative", // Enables absolute positioning for children
        transition: "transform 0.3s ease-in-out", // Smooth transition for hover effect
        "&:hover": {
          transform: "scale(1.05)", // Zoom out effect on hover
        },
      }}
    >
      <CardContent>
        {/* Recipe Title Spanning the Card */}
        <Box
          sx={{
            backgroundColor: "#7e91ff", // Background color for the recipe name
            padding: "8px 16px", // Adjust padding for better visual balance
            borderRadius: "8px", // Rounded corners
            width: "95%", // Ensure full width
            marginBottom: "1.5rem", // Spacing below title
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "600", color: "#fff", textAlign: "center" }}
          >
            {recipe.recipeName}
          </Typography>
        </Box>

        {/* Instructions Section */}
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
            sx={{
              fontWeight: "500",
              color: "#7e91ff", // Soft purple for instructions
              marginBottom: "0.5rem",
            }}
          >
            <strong>Instructions:</strong>
          </Typography>
          {Array.isArray(recipe.instructions) ? (
            recipe.instructions.map((instruction, idx) => (
              <Typography key={idx} variant="body2" sx={{ color: "#000000" }}>
                {instruction.number}. {instruction.step}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" sx={{ color: "#7e91ff" }}>
              {recipe.instructions || "No instructions available"}
            </Typography>
          )}
        </Box>

        {/* Notes Section */}
        <Box sx={{ marginBottom: "1rem" }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: "500",
              color: "#7e91ff", // Soft purple for notes
              marginBottom: "0.5rem",
            }}
          >
            <strong>Notes:</strong>
          </Typography>
          <Typography variant="body2">
            {recipe.notes || "No notes available"}
          </Typography>
        </Box>

        {/* Date Section */}
        <Box sx={{ marginBottom: "1.5rem" }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: "500",
              color: "#7e91ff", // Soft purple for date
              marginBottom: "0.5rem",
            }}
          >
            <strong>Date:</strong> {recipe.date || "N/A"}
          </Typography>
        </Box>
      </CardContent>

      {/* Edit, Delete, and Meal Plan Buttons */}
      <Box
        sx={{
          position: "absolute",
          bottom: "16px",
          right: "16px",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap", // Allow wrapping of buttons
          justifyContent: "flex-end", // Align buttons to the right
        }}
      >
          <DeleteButton onClick={() => handleDelete(recipe.recipeId)} />
          <Tooltip title="Plan Recipe" arrow>
    <IconButton
      onClick={handlePantryComparison}
      sx={{ color: "#7e91ff" }}
    >
      {loading ? <CircularProgress size={24} sx={{ color: "#7e91ff" }} /> : <MdEvent />}
    </IconButton>
  </Tooltip>
      </Box>

      {/* Meal Plan Modal */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 2 }}>
            <DialogTitle>Plan Recipe</DialogTitle>
            <Tooltip title="Ingredients will be put into your pantry or shopping list." arrow>
              <IconButton sx={{ color: 'textSecondary' }}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Box>
        <DialogContent>
          {errorMessage && (
            <Typography variant="body2" color="error" sx={{ marginBottom: "1rem" }}>
              {errorMessage}
            </Typography>
          )}
          {/* Meal Plan Date Picker */}
          <Box component="form" onSubmit={handleAddToMealPlan} sx={{ marginBottom: "1.5rem" }}>
            <TextField
              type="date"
              label="Meal Plan Date"
              value={selectedDate}
              onChange={handleDateChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
          </Box>

          {/* AI Split Section */}
          {aiSplit && (
            <Box sx={{ marginBottom: "1.5rem" }}>
              <Typography variant="h6" sx={{ fontWeight: "600", color: "#7e91ff" }}>
                AI Split
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: "600", color: "#7e91ff" }}>
                In Pantry
              </Typography>
              <List>
                {aiSplit.inPantry.map((ingredient, index) => (
                  <ListItem key={index}>{ingredient}</ListItem>
                ))}
              </List>
              <Typography variant="subtitle1" sx={{ fontWeight: "600", color: "#7e91ff" }}>
                Not in Pantry
              </Typography>
              <List>
                {aiSplit.notInPantry.map((ingredient, index) => (
                  <ListItem key={index}>{ingredient}</ListItem>
                ))}
              </List>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddToMealPlan}
                sx={{ marginTop: "1rem", backgroundColor: "#7e91ff" }}
              >
                Add to Meal Plan
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleManualSplit}
                sx={{ marginTop: "1rem", marginLeft: "1rem", borderColor: "#7e91ff", color: "#7e91ff" }}
              >
                Add Manually
              </Button>
            </Box>
          )}

          {/* Manual Split Section */}
          {manualSplit && (
            <Box sx={{ marginBottom: "1.5rem" }}>
              <Typography variant="h6" sx={{ fontWeight: "600", color: "#7e91ff" }}>
                Manual Split
              </Typography>
              <Typography variant="h7" sx={{ fontWeight: "300", color: "#7e91ff" }}>
                Check the ingredients that you have
              </Typography>
              <List>
                {ingredients.map((ingredient, index) => (
                  <ListItem key={index}>
                    <Checkbox
                      checked={ingredient.inPantry}
                      onChange={() => handleCheckboxChange(index)}
                      sx={{
                        color: PURPLE,
                        '&.Mui-checked': {
                          color: PURPLE,
                        },
                      }}
                    />
                    {ingredient.name}
                  </ListItem>
                ))}
              </List>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddToMealPlan}
                sx={{ marginTop: "1rem", backgroundColor: "#7e91ff" }}
                
              >
                Add to Meal Plan
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
            <Button
              onClick={handleClose}
              sx={{
                color: PURPLE,
                '&:hover': {
                  backgroundColor: LIGHT_GRAY,
                },
              }}
            >
              Close
            </Button>
          </DialogActions>
      </Dialog>
    </Card>
  );
};

export default RecipeCard;