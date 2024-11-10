import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  InputAdornment,
} from "@mui/material";
import { FaSearch, FaExclamationCircle } from "react-icons/fa";

export default function RecipeSearch({ onSearch }) {
  const [ingredients, setIngredients] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!ingredients) return;

    setLoading(true);
    setError(null); // Reset any previous errors

    try {
      // Make a request to the backend API with the entered ingredients
      const res = await fetch(`/api/recipes?ingredients=${encodeURIComponent(ingredients)}`);
      if (!res.ok) {
        throw new Error("Failed to fetch recipes");
      }

      const data = await res.json();
      onSearch(data); // Pass the results back to the parent component
    } catch (err) {
      setError("There was an error searching for recipes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: "2rem", maxWidth: 600, margin: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Search Recipes by Ingredients
      </Typography>
      <Paper elevation={3} sx={{ padding: "1rem", marginBottom: "1rem" }}>
        <TextField
          label="Ingredients"
          variant="outlined"
          placeholder="Enter ingredients separated by commas"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <FaSearch />
              </InputAdornment>
            ),
          }}
        />
        <Box
          sx={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}
        >
          <Button
            onClick={handleSearch}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={24} /> : <FaSearch />}
          >
            {loading ? "Searching..." : "Search"}
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
    </Box>
  );
}
