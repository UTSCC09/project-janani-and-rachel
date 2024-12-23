import React, { useEffect, useState } from "react";
import {
  Collapse,
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  TextField,
  Checkbox,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  ListItemText,
} from "@mui/material";
import { MdEvent } from "react-icons/md";
import DeleteButton from "./DeleteButton";
import InfoIcon from "@mui/icons-material/Info";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;
const PURPLE = "#7e91ff";
const LIGHT_GRAY = "#d3d3d3";

const RecipeCard = ({ recipe, lastRecipeElementRef, handleDelete }) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [open, setOpen] = useState(false);
  const [aiSplit, setAiSplit] = useState(null);
  const [manualSplit, setManualSplit] = useState(false);
  const [ingredients, setIngredients] = useState(
    recipe.ingredients.map((ingredient) => ({
      name: ingredient,
      inPantry: false,
    }))
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showNutrients, setShowNutrients] = useState(false);

  const toggleNutrients = () => {
    setShowNutrients(!showNutrients);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handlePantryComparison = () => {
    setLoading(true);
    setErrorMessage("");

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), 5000)
    );

    Promise.race([
      fetch(
        `${domain}/api/recipes/favorites/${recipe.recipeId}/pantry-comparison`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("idToken")}`,
            GoogleAccessToken: localStorage.getItem("accessToken"),
          },
        }
      ),
      timeout,
    ])
      .then((response) => {
        if (!response.ok) {
          if (response.status === 500) {
            // Handle 500 error by opening the popup for manual split
            setErrorMessage("Automatic split failed.");
            setAiSplit(null);
            setManualSplit(true);
            setOpen(true);
            setLoading(false);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.matchingIngredients && data.missingIngredients) {
          setAiSplit({
            inPantry: data.matchingIngredients,
            notInPantry: data.missingIngredients,
          });
          setManualSplit(false);
        } else {
          setAiSplit(null);
          setManualSplit(true);
        }
        setOpen(true);
      })
      .catch((error) => {
        if (error.message === "Request timed out") {
          console.log("Request timed out, proceeding with manual split");
        } else {
          console.error("Error planning recipe:", error);
        }
        setErrorMessage("Automatic split failed.");
        setAiSplit(null);
        setManualSplit(true);
        setOpen(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleAddToMealPlan = (e, useManualSplit) => {
    e.preventDefault();
    const mealPlanData = useManualSplit
      ? {
          recipeId: recipe.recipeId,
          ingredients: ingredients.map((ingredient) => ({
            ingredientName: ingredient.name,
            inPantry: ingredient.inPantry,
          })),
          date: selectedDate,
        }
      : {
          recipeId: recipe.recipeId,
          ingredients: aiSplit.inPantry
            .map((ingredient) => ({
              ingredientName: ingredient,
              inPantry: true,
            }))
            .concat(
              aiSplit.notInPantry.map((ingredient) => ({
                ingredientName: ingredient,
                inPantry: false,
              }))
            ),
          date: selectedDate,
        };

    fetch(`${domain}/api/recipes/meal-plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("idToken")}`,
        GoogleAccessToken: localStorage.getItem("accessToken"),
      },
      body: JSON.stringify(mealPlanData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setOpen(false);
      })
      .catch((error) => {
        console.error("Error adding recipe to meal plan:", error);
      });
  };

  const handleManualSplit = () => {
    setManualSplit(true);
  };

  const handleCheckboxChange = (index) => {
    setIngredients((prev) =>
      prev.map((ingredient, i) =>
        i === index
          ? { ...ingredient, inPantry: !ingredient.inPantry }
          : ingredient
      )
    );
  };

  const handleClose = () => {
    setOpen(false);
    setManualSplit(false);
    setAiSplit(null);
    setErrorMessage("");
  };

  useEffect(() => {
    const mainElement = document.getElementById("__next");
    if (mainElement) {
      if (open) {
        mainElement.setAttribute("inert", "true");
      } else {
        mainElement.removeAttribute("inert");
      }
    }
  }, [open]);

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
          transform: "scale(1.02)", // Zoom out effect on hover
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
            dangerouslySetInnerHTML={{ __html: recipe.recipeName }}
          />
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

        {/* Ingredients Section */}
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
              color: "#7e91ff", // Soft purple for ingredients
              marginBottom: "0.5rem",
            }}
          >
            <strong>Ingredients:</strong>
          </Typography>
          {Array.isArray(recipe.ingredients) ? (
            recipe.ingredients.map((ingredient, idx) => (
              <Typography key={idx} variant="body2" sx={{ color: "#000000" }}>
                {ingredient}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" sx={{ color: "#7e91ff" }}>
              {recipe.ingredients || "No ingredients available"}
            </Typography>
          )}
        </Box>

        <Button
          onClick={toggleNutrients}
          endIcon={showNutrients ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{
            color: PURPLE,
            textTransform: "none",
            "&:hover": {
              backgroundColor: LIGHT_GRAY,
            },
          }}
        >
          {showNutrients ? "Hide Nutrients" : "Show Nutrients"}
        </Button>
        <Collapse in={showNutrients}>
          <Box
            sx={{
              backgroundColor: "white",
              padding: 2,
              borderRadius: 1,
              marginTop: 2,
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
            <strong>Nutrients:</strong>
          </Typography>
            <List>
              {recipe.nutrition.nutrients.map((nutrient, index) => (
                <ListItem key={index} sx={{ padding: "2px 0" }}>
                <ListItemText
                  primaryTypographyProps={{ variant: "body2" }}
                  secondaryTypographyProps={{ variant: "body2" }}
                  primary={`${nutrient.name}: ${nutrient.amount} ${nutrient.unit}`}
                  secondary={`% of Daily Needs: ${nutrient.percentOfDailyNeeds}`}
                />
              </ListItem>
              ))}
            </List>
          </Box>
        </Collapse>
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
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#7e91ff" }} />
            ) : (
              <MdEvent />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Meal Plan Modal */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingRight: 2,
          }}
        >
          <DialogTitle>Plan Recipe</DialogTitle>
        </Box>
        <DialogContent>
          {errorMessage && (
            <Typography
              variant="body2"
              color="error"
              sx={{ marginBottom: "1rem" }}
            >
              {errorMessage}
            </Typography>
          )}
          {/* Meal Plan Date Picker */}
          <Box
            component="form"
            onSubmit={(e) => handleAddToMealPlan(e, manualSplit)}
            sx={{ marginBottom: "1.5rem" }}
          >
            <TextField
              type="date"
              label="Meal Date"
              value={selectedDate}
              onChange={handleDateChange}
              fullWidth
              margin="normal"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              required
            />
          </Box>

          {/* AI Split Section */}
          {aiSplit && (
            <Box sx={{ marginBottom: "1.5rem" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "600", color: "#7e91ff" }}
                >
                  Recipe Ingredients
                </Typography>
                <Tooltip
                  title="The ingredients you need to buy will be automatically added to your shopping list when you plan this meal. If you don't like this autogenerated split, you can create this list manually."
                  arrow
                >
                  <IconButton sx={{ color: "textSecondary" }}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              {aiSplit.inPantry && (
                <>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: "600",
                      color: "#7e91ff",
                      marginBottom: "-0.5rem",
                    }}
                  >
                    Ingredients in your Pantry
                  </Typography>
                  <List>
                    {aiSplit.inPantry.map((ingredient, index) => (
                      <ListItem key={index} sx={{ padding: "0.25rem 0" }}>
                        {" "}
                        {/* Adjusted padding */}
                        <Typography variant="body2" sx={{ color: "#000000" }}>
                          {ingredient}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
              {aiSplit.notInPantry && (
                <>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: "600",
                      color: "#7e91ff",
                      marginBottom: "-0.5rem",
                    }}
                  >
                    Ingredients not in your Pantry
                  </Typography>
                  <List>
                    {aiSplit.notInPantry.map((ingredient, index) => (
                      <ListItem key={index} sx={{ padding: "0.25rem 0" }}>
                        {" "}
                        {/* Adjusted padding */}
                        <Typography variant="body2" sx={{ color: "#000000" }}>
                          {ingredient}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={(e) => handleAddToMealPlan(e, false)}
                sx={{
                  marginTop: "1rem",
                  backgroundColor: "#7e91ff",
                  "&:hover": {
                    backgroundColor: LIGHT_GRAY, // Light grey color
                  },
                }}
              >
                Add to Meal Plan
              </Button>

              <Button
                variant="outlined"
                color="primary"
                onClick={handleManualSplit}
                sx={{
                  marginTop: "1rem",
                  marginLeft: "1rem",
                  borderColor: "#7e91ff",
                  color: "#7e91ff",
                  "&:hover": {
                    backgroundColor: LIGHT_GRAY, // Light grey color
                  },
                }}
              >
                Add Manually
              </Button>
            </Box>
          )}

          {/* Manual Split Section */}
          {manualSplit && (
            <Box sx={{ marginBottom: "1.5rem" }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: "600", color: "#7e91ff" }}
              >
                Recipe Ingredients
              </Typography>
              <Typography
                variant="h7"
                sx={{ fontWeight: "300", color: "#7e91ff" }}
              >
                Check the ingredients that you have. They will be automatically
                be added to your pantry when you plan this recipe.
              </Typography>
              <List>
                {ingredients.map((ingredient, index) => (
                  <ListItem key={index} sx={{ padding: "0rem 0" }}>
                    {" "}
                    {/* Adjusted padding */}
                    <Checkbox
                      checked={ingredient.inPantry}
                      onChange={() => handleCheckboxChange(index)}
                      sx={{
                        color: PURPLE,
                        "&.Mui-checked": {
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
                onClick={(e) => handleAddToMealPlan(e, true)}
                sx={{
                  marginTop: "1rem",
                  backgroundColor: "#7e91ff",
                  "&:hover": {
                    backgroundColor: LIGHT_GRAY, // Light grey color
                  },
                }}
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
              "&:hover": {
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