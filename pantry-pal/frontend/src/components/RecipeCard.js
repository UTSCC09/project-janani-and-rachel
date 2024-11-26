import React, { useState } from 'react';
import { Card, CardContent, Box, Typography, IconButton, Tooltip, Button, TextField, Checkbox, List, ListItem } from '@mui/material';
import { MdEdit, MdEvent } from "react-icons/md";
import DeleteButton from './DeleteButton';
import EditButton from './EditButton';

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

const RecipeCard = ({ recipe, lastRecipeElementRef, handleDelete, handleEdit }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [aiSplit, setAiSplit] = useState(null);
  const [manualSplit, setManualSplit] = useState(false);
  const [ingredients, setIngredients] = useState(recipe.ingredients);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handlePantryComparison = () => {
    fetch(`${domain}/api/recipes/favorites/pantry-comparison`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("idToken")}`,
        "GoogleAccessToken": localStorage.getItem('accessToken')
      },
      body: JSON.stringify({ ingredients: recipe.ingredients })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setAiSplit({
          inPantry: data.inPantry,
          notInPantry: data.notInPantry,
        });
        setShowDatePicker(true);
      })
      .catch(error => {
        console.error('Error with pantry comparison:', error);
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
        setShowDatePicker(false);
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
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        marginBottom: "1.5rem", // Reduced margin for better spacing
        position: "relative", // Enables absolute positioning for children
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
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

        {/* Meal Plan Date Picker */}
        {showDatePicker && (
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
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ marginTop: "1rem", backgroundColor: "#7e91ff" }}
            >
              Add to Meal Plan
            </Button>
          </Box>
        )}

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
                <ListItem key={index}>{ingredient.ingredientName}</ListItem>
              ))}
            </List>
            <Typography variant="subtitle1" sx={{ fontWeight: "600", color: "#7e91ff" }}>
              Not in Pantry
            </Typography>
            <List>
              {aiSplit.notInPantry.map((ingredient, index) => (
                <ListItem key={index}>{ingredient.ingredientName}</ListItem>
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
            <List>
              {ingredients.map((ingredient, index) => (
                <ListItem key={index}>
                  <Checkbox
                    checked={ingredient.inPantry}
                    onChange={() => handleCheckboxChange(index)}
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
      </CardContent>

      {/* Edit, Delete, and Meal Plan Buttons */}
      <Box
        sx={{
          position: "absolute",
          bottom: "16px",
          right: "16px",
          display: "flex",
          gap: "8px",
        }}
      >
        <EditButton onClick={() => handleEdit(recipe.recipeId)} />
        <DeleteButton onClick={() => handleDelete(recipe.recipeId)} />
        <Tooltip title="Plan Recipe" arrow>
          <IconButton color="primary" onClick={handlePantryComparison}>
            <MdEvent />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default RecipeCard;