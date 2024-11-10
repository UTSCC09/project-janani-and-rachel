import { useState, useEffect } from "react";
import RecipeSuggestion from "@/components/RecipeSuggestion";
import { Box, TextField, Button, Checkbox, FormControlLabel, Typography, CircularProgress, List, ListItem, ListItemText, Card, CardContent, CardActions } from "@mui/material";

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

export default function IngredientsSection() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newIngredient, setNewIngredient] = useState({
    ingredientName: "",
    purchaseDate: "",
    expirationDate: "",
    frozen: false,
  });
  const [showForm, setShowForm] = useState(false); // State to manage form visibility

  useEffect(() => {
    fetch(`${domain}/api/ingredients/pantry`)
      .then((response) => response.json())
      .then((data) => {
        const processedData = data.ingredients.map((item) => ({
          ...item,
          purchaseDate: item.purchaseDate
            ? new Date(item.purchaseDate.seconds * 1000).toLocaleDateString()
            : "N/A",
          expirationDate: item.expirationDate
            ? new Date(item.expirationDate.seconds * 1000).toLocaleDateString()
            : "N/A",
        }));
        setIngredients(processedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching ingredients:", error);
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewIngredient((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddIngredient = (e) => {
    e.preventDefault();

    fetch(`${domain}/api/ingredients/pantry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newIngredient),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to add or update ingredient.");
        }
      })
      .then(() => {
        setIngredients((prev) => [...prev, newIngredient]);
        setNewIngredient({
          ingredientName: "",
          purchaseDate: "",
          expirationDate: "",
          frozen: false,
        });
      })
      .catch((error) => {
        console.error("Error adding/updating ingredient:", error);
      });
  };

  const handleDeleteIngredient = (ingredientName) => {
    fetch(`${domain}/api/ingredients/pantry`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredientName }),
    })
      .then((response) => {
        if (response.ok) {
          setIngredients((prev) =>
            prev.filter((ingredient) => ingredient.ingredientName !== ingredientName)
          );
        } else {
          throw new Error("Failed to delete ingredient.");
        }
      })
      .catch((error) => {
        console.error("Error deleting ingredient:", error);
      });
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Ingredients
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <List sx={{ marginBottom: 2 }}>
          {ingredients.map((ingredient, index) => (
            <ListItem key={index} sx={{ marginBottom: 2 }}>
              <Card sx={{ width: "100%", boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
                    {ingredient.ingredientName}
                  </Typography>
                  <Typography color="text.secondary" sx={{ marginBottom: 1 }}>
                    Expiration Date: {ingredient.expirationDate}
                  </Typography>
                  <Typography color="text.secondary" sx={{ marginBottom: 1 }}>
                    Purchase Date: {ingredient.purchaseDate}
                  </Typography>
                  <Typography color="text.secondary">
                    Frozen: {ingredient.frozen ? "Yes" : "No"}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteIngredient(ingredient.ingredientName)}
                    size="small"
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </ListItem>
          ))}
        </List>
      )}

      {/* Toggle Button */}
      <Button
        variant="outlined"
        onClick={() => setShowForm((prev) => !prev)}
        sx={{ marginBottom: 2 }}
      >
        {showForm ? "Hide Form" : "Add Ingredient"}
      </Button>

      {/* Conditionally render the form */}
      {showForm && (
        <>
          <Typography variant="h6" gutterBottom>
            Add or Update Ingredient
          </Typography>
          <form onSubmit={handleAddIngredient}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Ingredient Name"
                name="ingredientName"
                value={newIngredient.ingredientName}
                onChange={handleInputChange}
                required
              />
              <TextField
                label="Purchase Date"
                type="date"
                name="purchaseDate"
                value={newIngredient.purchaseDate}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true, // Ensures label stays above the field when filled
                }}
                sx={{ marginBottom: 1 }} // Optional: add spacing between fields
              />
              <TextField
                label="Expiration Date"
                type="date"
                name="expirationDate"
                value={newIngredient.expirationDate}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true, // Ensures label stays above the field when filled
                }}
                sx={{ marginBottom: 1 }} // Optional: add spacing between fields
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="frozen"
                    checked={newIngredient.frozen}
                    onChange={handleInputChange}
                  />
                }
                label="Frozen"
              />
              <Button variant="contained" color="primary" type="submit">
                Add/Update Ingredient
              </Button>
            </Box>
          </form>
        </>
      )}

      <RecipeSuggestion ingredients={ingredients} />
    </Box>
  );
}
