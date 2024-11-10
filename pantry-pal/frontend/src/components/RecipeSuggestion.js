import { useState } from "react";
import { Button, Typography, Box, List, ListItem, ListItemText, Card, CardContent, Divider, Paper } from "@mui/material";
import { FaSearch, FaUtensils, FaRegFrown } from "react-icons/fa"; // Additional React Icons

export default function RecipeSuggestion({ ingredients }) {
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [showRecipes, setShowRecipes] = useState(false);

  // Sample list of recipes
  const allRecipes = [
    { id: 1, name: "Tomato Soup", ingredients: ["Tomatoes", "Onions", "Salt"] },
    { id: 2, name: "Chicken Salad", ingredients: ["Chicken", "Lettuce", "Tomatoes"] },
    { id: 3, name: "Chicken Soup", ingredients: ["Chicken", "Onions", "Salt"] },
    { id: 4, name: "Grilled Chicken", ingredients: ["Chicken", "Garlic", "Olive Oil"] },
  ];

  // Function to check if the recipe can be made with the available ingredients
  const canMakeRecipe = (recipeIngredients) => {
    return recipeIngredients.every((ingredient) =>
      ingredients.some((ing) => ing.name === ingredient && ing.available)
    );
  };

  const findSuggestedRecipes = () => {
    const filteredRecipes = allRecipes.filter((recipe) =>
      canMakeRecipe(recipe.ingredients)
    );
    setSuggestedRecipes(filteredRecipes);
    setShowRecipes(true);
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
          backgroundImage: "linear-gradient(45deg, #2196f3, #21cbf3)", // Gradient background
          color: "white",
          transition: "all 0.3s ease", // Smooth transition
          "&:hover": {
            backgroundPosition: "right center", // Change position on hover
            backgroundImage: "linear-gradient(45deg, #1565c0, #0097a7)", // Darker gradient on hover
            transform: "scale(1.05)", // Slight scale-up effect
          },
          "&:active": {
            transform: "scale(1)", // Reset scale on click
          },
        }}
        startIcon={<FaSearch />} // React Icon added here (FaSearch)
      >
        Find Suggested Recipes
      </Button>

      {/* Display suggested recipes */}
      {showRecipes && (
        <Paper sx={{ width: "100%", maxWidth: "600px", padding: 3, boxShadow: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 600 }}>
            Suggested Recipes
          </Typography>
          <Divider sx={{ marginBottom: 2 }} />
          {suggestedRecipes.length > 0 ? (
            <List>
              {suggestedRecipes.map((recipe) => (
                <Card key={recipe.id} sx={{ marginBottom: 2, borderRadius: 2, boxShadow: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      {recipe.name}
                    </Typography>
                    <Divider sx={{ marginY: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Ingredients: {recipe.ingredients.join(", ")}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: "center", padding: 3 }}>
              <FaRegFrown size={40} color="gray" />
              <Typography variant="body1" sx={{ fontStyle: "italic", color: "gray", marginTop: 2 }}>
                No recipes can be made with the available ingredients.
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}
