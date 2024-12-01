import { useState, useRef } from "react";
import {
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Chip,
} from "@mui/material";
import { FaSearch, FaRegFrown, FaCheckCircle } from "react-icons/fa";
import FavoriteButton from "./FavouriteButton";

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

export default function RecipeSuggestion({ ingredients }) {
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRecipes, setShowRecipes] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  const resultsRef = useRef(null); // Reference to the results container

  // Function to fetch suggested recipes from the backend
  const findSuggestedRecipes = async () => {
    setLoading(true);
    setError(null); // Reset any previous errors
    setSuggestedRecipes([]); // Clear previous suggestions

    try {
      const response = await fetch(
        `${domain}/api/recipes/search-most-matching`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("idToken")}`,
            GoogleAccessToken: localStorage.getItem("accessToken"),
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch suggested recipes");
      }

      const data = await response.json();
      setSuggestedRecipes(data);
      setShowRecipes(true);
      // Scroll to the results section
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    } catch (err) {
      setError("There was an error fetching the suggested recipes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteClick = async (recipe) => {
    try {
      const response = await fetch(`${domain}/api/recipes/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("idToken")}`,
          GoogleAccessToken: localStorage.getItem("accessToken"),
        },
        body: JSON.stringify({
          recipeId: recipe.recipeId,
          recipeName: recipe.recipeName,
          missedIngredientCount: recipe.missedIngredientCount,
          missedIngredients: recipe.missedIngredients,
          totalIngredientCount: recipe.totalIngredientCount,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          sourceUrl: recipe.sourceUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to favorites");
      }

      setFavorites(
        (prevFavorites) => new Set(prevFavorites.add(recipe.recipeId))
      );
    } catch (err) {
      console.error("Error adding to favorites", err);
    }
  };

  const addMissingIngredientsToShoppingList = async (
    missedIngredients,
    recipeId
  ) => {
    try {
      for (let ingredient of missedIngredients) {
        const response = await fetch(
          `${domain}/api/ingredients/shopping-list`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("idToken")}`,
              GoogleAccessToken: localStorage.getItem("accessToken"),
            },
            body: JSON.stringify({ ingredientName: ingredient }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to add ingredient to shopping list");
        }
      }

      setSuggestedRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe.recipeId === recipeId
            ? {
                ...recipe,
                successMessage: "Missing ingredients added to shopping list!",
              }
            : recipe
        )
      );
    } catch (err) {
      console.error("Error adding ingredients to shopping list", err);
    }
  };

  return (
    <Box
      sx={{
        marginTop: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={findSuggestedRecipes}
        sx={{
          marginBottom: 3,
          padding: "12px 24px",
          fontSize: "16px",
          fontWeight: 600,
          borderRadius: "8px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
          backgroundImage: "linear-gradient(45deg, #7e91ff, #FFF7CB)",
          color: "white",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "transparent",
            transform: "scale(1.05)",
          },
          "&:active": {
            transform: "scale(1)",
          },
        }}
        startIcon={
          loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <FaSearch />
          )
        }
        disabled={loading}
      >
        {loading ? "Finding Recipes..." : "Find Suggested Recipes"}
      </Button>

      {error && (
        <Typography
          color="error"
          sx={{ marginTop: 2, textAlign: "center", fontWeight: "bold" }}
        >
          {error}
        </Typography>
      )}

      {showRecipes && (
        <Box sx={{ marginTop: 3, width: "100%" }} ref={resultsRef}>
          {suggestedRecipes.length > 0 ? (
            suggestedRecipes.map((recipe) => (
              <Card
                key={recipe.recipeId}
                sx={{
                  marginBottom: "1.5rem",
                  borderRadius: "8px",
                  boxShadow: 3,
                  backgroundColor: "#fffae1",
                  position: "relative",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#ffffff",
                        backgroundColor: "#7e91ff",
                        maxWidth: "88%",
                        padding: "8px",
                        borderRadius: "4px",
                        marginBottom: "1rem",
                        flexGrow: 1, // Allow the title to take up available space
                      }}
                      gutterBottom
                    >
                      {recipe.recipeName}
                    </Typography>
                    <Box
                      sx={{ position: "absolute", top: "8px", right: "16px" }}
                    >
                      <FavoriteButton
                        isFavorite={favorites.has(recipe.recipeId)}
                        onClick={() => handleFavoriteClick(recipe)}
                        sx={{
                          color: favorites.has(recipe.recipeId)
                            ? "#ff4081"
                            : "#7e91ff",
                        }}
                      />
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <Chip
                      label={`Missing Ingredients: ${recipe.missedIngredientCount}`}
                      sx={{ backgroundColor: "#7e91ff", color: "#ffffff" }}
                    />
                    <Chip
                      label={`Ingredients: ${recipe.ingredients.length}`}
                      sx={{ backgroundColor: "#7e91ff", color: "#ffffff" }}
                      color="info"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Ingredients:</strong>{" "}
                    {recipe.ingredients.join(", ")}
                  </Typography>
                  {recipe.missedIngredients.length > 0 && (
                    <Box sx={{ marginTop: "1rem" }}>
                      <Typography
                        variant="body2"
                        color="error"
                        sx={{ fontWeight: "bold" }}
                      >
                        Missing Ingredients:
                      </Typography>
                      <ul
                        style={{ margin: 0, padding: 0, listStyleType: "none" }}
                      >
                        {recipe.missedIngredients.map((ingredient, index) => (
                          <li key={index}>
                            <Typography variant="body2" color="text.secondary">
                              {ingredient}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    </Box>
                  )}

                  <Divider sx={{ marginY: "1rem" }} />
                  <Box
                    sx={{
                      backgroundColor: "white",
                      padding: "16px",
                      borderRadius: "8px",
                      boxShadow: 1,
                      marginBottom: "1rem",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      <strong>Instructions:</strong>
                    </Typography>
                    <ul>
                      {recipe.instructions.map((instruction, index) => (
                        <li key={index}>
                          <Typography variant="body2">
                            {instruction.step}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </Box>
                </CardContent>

                <Box
                  sx={{
                    padding: "1rem",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {recipe.successMessage && (
                    <Typography
                      variant="body1"
                      color="success.main"
                      sx={{ textAlign: "center", fontWeight: "bold" }}
                    >
                      {recipe.successMessage}
                    </Typography>
                  )}

                  <Button
                    variant="contained"
                    onClick={() =>
                      addMissingIngredientsToShoppingList(
                        recipe.missedIngredients,
                        recipe.recipeId
                      )
                    }
                    disabled={recipe.missedIngredients.length === 0}
                    fullWidth
                    sx={{
                      padding: "1rem",
                      textTransform: "none",
                      color: "#7e91ff", // Button text color
                      color: "#ffffff", // Button text color
                      backgroundColor: "#7e91ff", // Button background color
                      "&:hover": {
                        backgroundColor: "#fffae1", // Button background color on hover
                      },
                    }}
                    startIcon={<FaCheckCircle />}
                  >
                    Add Missing Ingredients to Shopping List
                  </Button>
                </Box>
              </Card>
            ))
          ) : (
            <Box sx={{ textAlign: "center", padding: 3 }}>
              <FaRegFrown size={40} color="gray" />
              <Typography
                variant="body1"
                sx={{ fontStyle: "italic", color: "gray" }}
              >
                No recipes found.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
