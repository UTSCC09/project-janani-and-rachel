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
  Divider,
  Chip,
  IconButton,
} from "@mui/material";
import {
  FaSearch,
  FaExclamationCircle,
  FaStar,
  FaRegStar,
} from "react-icons/fa";

import FavoriteButton from "./FavouriteButton";

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

export default function RecipeSearch({ onSearch }) {
  const [ingredients, setIngredients] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState(new Set());

  const handleSearch = async () => {
    if (!ingredients) return;

    setLoading(true);
    setError(null); // Reset any previous errors
    setRecipes([]); // Clear previous recipes

    try {
      const res = await fetch(
        `${domain}/api/recipes/search-keyword?keyword=${encodeURIComponent(ingredients)}`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("idToken")}`,
            'GoogleAccessToken': localStorage.getItem('accessToken')
          },
        }
      );
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

  const handleFavoriteClick = async (recipe) => {
    try {
      const res = await fetch(`${domain}/api/recipes/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("idToken")}`,
          'GoogleAccessToken': localStorage.getItem('accessToken')
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

      if (res.ok) {
        setFavorites(new Set(favorites.add(recipe.recipeId))); // Add to favorites set
      } else {
        console.error("Failed to add recipe to favorites");
      }
    } catch (err) {
      console.error("Error while adding to favorites", err);
    }
  };

  return (
    <Box sx={{ padding: "2rem", maxWidth: 1000, margin: "auto" }}>
      <Typography variant="h4" gutterBottom textAlign="center" sx={{ fontWeight: "bold", color: "#7e91ff" }}>
        Search Recipes by Keyword
      </Typography>
      <Paper elevation={6} sx={{ padding: "2rem", borderRadius: "8px", backgroundColor: "#fffae1" }}>
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
                <FaSearch color="#7e91ff" />
              </InputAdornment>
            ),
          }}
          sx={{ marginBottom: "1.5rem", backgroundColor: "#fff", borderRadius: 1 }}
        />
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            onClick={handleSearch}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={24} /> : <FaSearch />}
            sx={{ padding: "0.8rem 2rem", fontWeight: "bold", backgroundColor: "#7e91ff", "&:hover": { backgroundColor: "#6b82e0" } }}
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
            <Card
              key={recipe.recipeId}
              sx={{ marginBottom: "1.5rem", borderRadius: "8px", boxShadow: 3, backgroundColor: "#fffae1" }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#7e91ff" }} gutterBottom>
                  {recipe.recipeName}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                </Box>
                <Typography variant="body2" color="text.secondary">
                  <strong>Ingredients:</strong> {recipe.ingredients.join(", ")}
                </Typography>
                <Divider sx={{ marginY: "1rem" }} />
                <Paper elevation={3} sx={{ padding: "1rem", backgroundColor: "#fff", borderRadius: "8px" }}>
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
                </Paper>
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ marginTop: "1rem" }}
                >
                  <a
                    href={recipe.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Full Recipe Source
                  </a>
                </Typography>
                
                {/* <IconButton
                  onClick={() => handleFavoriteClick(recipe)}
                  onMouseLeave={(e) => (e.target.style.color = "")}
                  sx={{
                    color: favorites.has(recipe.recipeId) ? "#e4e642" : "gray",
                    marginLeft: "auto",
                  }}
                >
                  {favorites.has(recipe.recipeId) ? <FaStar /> : <FaRegStar />}
                </IconButton> */}

                                {/* <FavoriteButton isFavorite={favorites.has(recipe.recipeId)} onClick={() => handleFavoriteClick(recipe)} /> */}
                  <FavoriteButton
                  isFavorite={favorites.has(recipe.recipeId)}
                  onClick={() => handleFavoriteClick(recipe)}
                />
              </CardContent>
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