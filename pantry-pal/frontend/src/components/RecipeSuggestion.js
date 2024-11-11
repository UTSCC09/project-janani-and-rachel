import { useState } from "react";
import { Button, Typography, Box, Card, CardContent, Divider, Paper, CircularProgress, Chip, IconButton } from "@mui/material";
import { FaSearch, FaUtensils, FaRegFrown, FaCheckCircle, FaStar, FaRegStar } from "react-icons/fa";

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

export default function RecipeSuggestion({ ingredients }) {
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRecipes, setShowRecipes] = useState(false);

  const [favorites, setFavorites] = useState(new Set());

  // Function to fetch suggested recipes from the backend
  const findSuggestedRecipes = async () => {
    setLoading(true);
    setError(null); // Reset any previous errors
    setSuggestedRecipes([]); // Clear previous suggestions

    try {
      const response = await fetch(`${domain}/api/recipes/search-most-matching`);
      if (!response.ok) {
        throw new Error("Failed to fetch suggested recipes");
      }

      const data = await response.json();
      setSuggestedRecipes(data);
      setShowRecipes(true);
    } catch (err) {
      setError("There was an error fetching the suggested recipes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteClick = async (recipe) => {
    try {
      // POST request to add recipe to favorites
      const response = await fetch(`${domain}/api/recipes/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

      // Add recipe to favorites set
      setFavorites((prevFavorites) => new Set(prevFavorites.add(recipe.recipeId)));
    } catch (err) {
      console.error("Error adding to favorites", err);
    }
  };

  // Function to add missing ingredients to shopping list
  const addMissingIngredientsToShoppingList = async (missedIngredients, recipeId) => {
    try {
      for (let ingredient of missedIngredients) {
        const response = await fetch(`${domain}/api/ingredients/shoppingList`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ingredientName: ingredient }),
        });

        if (!response.ok) {
          throw new Error("Failed to add ingredient to shopping list");
        }
      }

      // After adding, show success message for this recipe
      setSuggestedRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe.recipeId === recipeId
            ? { ...recipe, successMessage: "Missing ingredients added to shopping list!" }
            : recipe
        )
      );
    } catch (err) {
      console.error("Error adding ingredients to shopping list", err);
    }
  };

  return (
    <Box sx={{ marginTop: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Button to find suggested recipes */}
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
          backgroundImage: "linear-gradient(45deg, #2196f3, #21cbf3)",
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
        startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <FaSearch />}
        disabled={loading}
      >
        {loading ? "Finding Recipes..." : "Find Suggested Recipes"}
      </Button>

      {/* Display error if there is any */}
      {error && (
        <Typography color="error" sx={{ marginTop: 2, textAlign: "center", fontWeight: "bold" }}>
          {error}
        </Typography>
      )}

      {/* Display suggested recipes */}
      {showRecipes && (
        <Box sx={{ marginTop: 3, width: "100%" }}>
          {suggestedRecipes.length > 0 ? (
            suggestedRecipes.map((recipe) => (
              <Card key={recipe.recipeId} sx={{ marginBottom: "1.5rem", borderRadius: "8px", boxShadow: 3, position: "relative" }}>
                {/* Star Button positioned at top-right */}
                <IconButton
                  onClick={() => handleFavoriteClick(recipe)}
                  onMouseLeave={(e) => e.target.style.color = ""}
                  sx={{
                    color: favorites.has(recipe.recipeId) ? "yellow" : "gray",
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    padding: "8px",
                    transition: "color 0.3s ease",
                  }}
                >
                  {favorites.has(recipe.recipeId) ? <FaStar /> : <FaRegStar />}
                </IconButton>

                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {recipe.recipeName}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
                    <Chip label={`Missing Ingredients: ${recipe.missedIngredientCount}`} color="secondary" />
                    <Chip label={`Ingredients: ${recipe.ingredients.length}`} color="info" />
                  </Box>

                  {/* Display all ingredients and missed ingredients */}
                  <Typography variant="body2" color="text.secondary">
                    <strong>Ingredients:</strong> {recipe.ingredients.join(", ")}
                  </Typography>
                  {recipe.missedIngredients.length > 0 && (
                    <Box sx={{ marginTop: "1rem" }}>
                      <Typography variant="body2" color="error" sx={{ fontWeight: "bold" }}>
                        Missing Ingredients:
                      </Typography>
                      <ul style={{ margin: 0, padding: 0, listStyleType: "none" }}>
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
                  <Typography variant="body2" color="text.secondary">
                    <strong>Instructions:</strong>
                  </Typography>
                  <ul>
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index}>
                        <Typography variant="body2">{instruction.step}</Typography>
                      </li>
                    ))}
                  </ul>
                  <Typography variant="body2" color="primary" sx={{ marginTop: "1rem" }}>
                    <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
                      Full Recipe Source
                    </a>
                  </Typography>
                </CardContent>

                <Box sx={{ padding: "1rem", display: "flex", justifyContent: "flex-end", alignItems: "center", flexDirection: "column", gap: 2 }}>
                {/* Success Message */}
                {recipe.successMessage && (
                  <Typography
                    variant="body1"
                    color="success.main"
                    sx={{ textAlign: "center", fontWeight: "bold" }}
                  >
                    {recipe.successMessage}
                  </Typography>
                )}

                {/* Button to add missing ingredients to shopping list */}
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => addMissingIngredientsToShoppingList(recipe.missedIngredients, recipe.recipeId)}
                  disabled={recipe.missedIngredients.length === 0}
                  fullWidth
                  sx={{ padding: "1rem", textTransform: "none" }}
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
              <Typography variant="body1" sx={{ fontStyle: "italic", color: "gray" }}>
                No recipes found.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
