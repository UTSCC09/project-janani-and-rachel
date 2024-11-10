import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  InputAdornment,
  Card,
  CardContent,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import { FaSearch, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

export default function RecipeSearch({ onSearch }) {
  const [ingredients, setIngredients] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recipes, setRecipes] = useState([]);

  const handleSearch = async () => {
    if (!ingredients) return;

    setLoading(true);
    setError(null); // Reset any previous errors
    setRecipes([]); // Clear previous recipes

    try {
      // Make a request to the backend API with the entered keyword
      const res = await fetch(`${domain}/api/recipes/search-keyword?keyword=${encodeURIComponent(ingredients)}`);
      if (!res.ok) {
        throw new Error("Failed to fetch recipes");
      }
      const data = await res.json();
      setRecipes(data); // Update the recipes state
      onSearch(data); // Pass the results back to the parent component (optional)
    } catch (err) {
      setError("There was an error searching for recipes.");
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
      setRecipes((prevRecipes) =>
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
    <Box sx={{ padding: "2rem", maxWidth: 1000, margin: "auto" }}>
      <Typography variant="h4" gutterBottom textAlign="center" color="primary">
        Search Recipes by Keyword
      </Typography>
      <Paper elevation={6} sx={{ padding: "2rem", borderRadius: "8px" }}>
        <TextField
          label="Enter a keyword (e.g., strawberry)"
          variant="outlined"
          placeholder="e.g., strawberry"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <FaSearch color="#1976d2" />
              </InputAdornment>
            ),
          }}
          sx={{ marginBottom: "1.5rem" }}
        />
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            onClick={handleSearch}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={24} /> : <FaSearch />}
            sx={{ padding: "0.8rem 2rem", fontWeight: "bold" }}
          >
            {loading ? "Searching..." : "Search Recipes"}
          </Button>
        </Box>

        {error && (
          <Typography
            color="error"
            sx={{
              display: "flex",
              alignItems: "center",
              marginTop: "1rem",
              gap: 1,
            }}
          >
            <FaExclamationCircle />
            {error}
          </Typography>
        )}
      </Paper>

      {/* Display the list of recipes */}
      <Box sx={{ marginTop: "3rem" }}>
        {recipes.length > 0 ? (
          recipes.map((recipe) => (
            <Card key={recipe.recipeId} sx={{ marginBottom: "1.5rem", borderRadius: "8px", boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  {recipe.recipeName}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
                  <Chip label={`Missing Ingredients: ${recipe.missedIngredientCount}`} color="secondary" />
                  <Chip label={`Ingredients: ${recipe.ingredients.length}`} color="info" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  <strong>Ingredients:</strong> {recipe.ingredients.join(", ")}
                </Typography>
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
          <Typography variant="body1" color="text.secondary" align="center">
            No recipes found.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
