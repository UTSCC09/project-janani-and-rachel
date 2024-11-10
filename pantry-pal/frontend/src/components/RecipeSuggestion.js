import { useState } from "react";
import { Button, Typography, Box, Card, CardContent, Divider, Paper, CircularProgress, Chip } from "@mui/material";
import { FaSearch, FaUtensils, FaRegFrown, FaCheckCircle } from "react-icons/fa";

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

export default function RecipeSuggestion({ ingredients }) {
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRecipes, setShowRecipes] = useState(false);

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

  // Function to add missing ingredients to the shopping list
  const addMissingIngredientsToShoppingList = async (missedIngredients, recipeId) => {
    try {
      // Loop over the missed ingredients and send each to the backend
      const promises = missedIngredients.map((ingredient) =>
        fetch(`${domain}/api/ingredients/shoppingList`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ingredientName: ingredient }),
        })
      );

      // Wait for all promises to resolve
      await Promise.all(promises);

      // Update the specific recipe's success message
      setSuggestedRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe.recipeId === recipeId
            ? { ...recipe, successMessage: "All missing ingredients have been successfully added to the shopping list." }
            : recipe
        )
      );
    } catch (err) {
      console.error("Error adding missing ingredients to shopping list", err);
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
            backgroundPosition: "right center",
            backgroundImage: "linear-gradient(45deg, #1565c0, #0097a7)",
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
              <Card key={recipe.recipeId} sx={{ marginBottom: "1.5rem", borderRadius: "8px", boxShadow: 3 }}>
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
                <Box sx={{ padding: "1rem" }}>
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

                  {/* Success Message */}
                  {recipe.successMessage && (
                    <Typography
                      variant="body1"
                      color="success.main"
                      sx={{ marginTop: "1rem", textAlign: "center", fontWeight: "bold" }}
                    >
                      {recipe.successMessage}
                    </Typography>
                  )}
                </Box>
              </Card>
            ))
          ) : (
            <Box sx={{ textAlign: "center", padding: 3 }}>
              <FaRegFrown size={40} color="gray" />
              <Typography variant="body1" sx={{ fontStyle: "italic", color: "gray", marginTop: 2 }}>
                No recipes found for the given ingredients.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
