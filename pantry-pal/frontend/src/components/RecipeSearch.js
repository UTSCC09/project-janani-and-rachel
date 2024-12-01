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
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import {
  FaSearch,
  FaExclamationCircle,
} from "react-icons/fa";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

import FavoriteButton from "./FavouriteButton";
import StyledTitle from "./StyledTitle";

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

export default function RecipeSearch({ onSearch }) {
  const [ingredients, setIngredients] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [expandedNutrition, setExpandedNutrition] = useState({});

  const toggleNutrition = (recipeId) => {
    setExpandedNutrition((prevState) => ({
      ...prevState,
      [recipeId]: !prevState[recipeId],
    }));
  };

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
            Authorization: `Bearer ${localStorage.getItem("idToken")}`,
            GoogleAccessToken: localStorage.getItem("accessToken"),
          },
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch recipes");
      }
      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteClick = async (recipe) => {
    // console.log("recipe from search: ", recipe);
    try {
      const res = await fetch(`${domain}/api/recipes/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("idToken")}`,
          GoogleAccessToken: localStorage.getItem("accessToken"),
        },
        body: JSON.stringify(recipe),
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
      <StyledTitle>Search For Recipes by Keyword</StyledTitle>
      <Paper
        elevation={6}
        sx={{
          padding: "2rem",
          borderRadius: "8px",
          backgroundColor: "#fffae1",
        }}
      >
      <TextField
          label="Enter a keyword (e.g., chicken)"
          variant="outlined"
          placeholder="e.g., chicken"
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
          sx={{
            marginBottom: "1.5rem",
            backgroundColor: "#fff",
            borderRadius: 1,
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "grey",
              },
              "&:hover fieldset": {
                borderColor: "#7e91ff",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#7e91ff",
              },
            },
          }}
        />
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            onClick={handleSearch}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={24} /> : <FaSearch />}
            sx={{
              padding: "0.8rem 2rem",
              fontWeight: "bold",
              backgroundColor: "#7e91ff",
              "&:hover": { backgroundColor: "#6b82e0" },
            }}
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

      <Box sx={{ marginTop: "3rem" }}>
        {recipes.length > 0 ? (
          recipes.map((recipe) => (
            <Card
              key={recipe.recipeId}
              sx={{
                marginBottom: "1.5rem",
                borderRadius: "8px",
                boxShadow: 3,
                backgroundColor: "#fffae1",
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
                    sx={{ fontWeight: "bold", color: "#7e91ff" }}
                    gutterBottom
                  >
                    {recipe.recipeName}
                  </Typography>
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
                <Typography variant="body2" color="text.secondary">
                  <strong>Ingredients:</strong> {recipe.ingredients.join(", ")}
                </Typography>
                <Divider sx={{ marginY: "1rem" }} />
                <Paper
                  elevation={3}
                  sx={{
                    padding: "1rem",
                    backgroundColor: "#fff",
                    borderRadius: "8px",
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
                </Paper>
                <Box sx={{ marginTop: "1rem" }}>
                <Button
                size="small"
                startIcon={
                  expandedNutrition[recipe.recipeId] ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  )
                }
                onClick={() => toggleNutrition(recipe.recipeId)}
                sx={{
                  color: "#b39ddb", // Light purple text color
                  "&:hover": {
                    backgroundColor: "#e0e0e0", // Grey hover background
                  },
                }}
              >
                {expandedNutrition[recipe.recipeId]
                  ? "Hide Nutrition Info"
                  : "Show Nutrition Info"}
              </Button>

                  <Collapse
                    in={expandedNutrition[recipe.recipeId]}
                    timeout="auto"
                    unmountOnExit
                  >
                    <TableContainer>
                      <Table>
                        <TableBody>
                          {recipe.nutrition.nutrients.map((nutrient, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <strong>{nutrient.name}</strong>
                              </TableCell>
                              <TableCell>
                                {nutrient.amount} {nutrient.unit}
                              </TableCell>
                              <TableCell>
                                {nutrient.percentOfDailyNeeds}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Collapse>
                </Box>
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
