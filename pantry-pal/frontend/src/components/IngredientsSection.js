import { useState, useEffect } from "react";
import RecipeSuggestion from "@/components/RecipeSuggestion";
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
} from "@mui/material";
import { FaTrashAlt, FaPlus, FaCheckCircle, FaRegCalendarAlt, FaRegCalendar } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

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
    <Box sx={{ padding: 3, maxWidth: "900px", margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom align="center">
        Pantry Ingredients
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
        {ingredients.map((ingredient, index) => (
            <ListItem key={index} sx={{ marginBottom: 2, backgroundColor: "#ffffff", borderRadius: 2, padding: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            
            {/* Left Section: Ingredient Details */}
            <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                
                {/* Ingredient Name */}
                <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1 }}>
                {ingredient.ingredientName}
                </Typography>

                {/* Expiration, Purchase Date and Frozen Status */}
                <Box sx={{ display: "flex", flexDirection: "column", marginBottom: 1 }}>
                
                {/* Expiration Date */}
                <Box sx={{ display: "flex", alignItems: "center", marginBottom: 0.5 }}>
                    <FaRegCalendarAlt style={{ marginRight: "8px", fontSize: "16px", color: "#3f51b5" }} />
                    <Typography variant="body2" sx={{ color: "#777" }}>
                    Expiration: {ingredient.expirationDate}
                    </Typography>
                </Box>
                
                {/* Purchase Date */}
                <Box sx={{ display: "flex", alignItems: "center", marginBottom: 0.5 }}>
                    <FaRegCalendar style={{ marginRight: "8px", fontSize: "16px", color: "#3f51b5" }} />
                    <Typography variant="body2" sx={{ color: "#777" }}>
                    Purchased: {ingredient.purchaseDate}
                    </Typography>
                </Box>

                {/* Frozen Status */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <FaCheckCircle
                    color={ingredient.frozen ? "green" : "gray"}
                    style={{ marginRight: "8px", fontSize: "16px" }}
                    />
                    <Typography variant="body2" sx={{ color: ingredient.frozen ? "green" : "gray" }}>
                    {ingredient.frozen ? "Frozen" : "Not Frozen"}
                    </Typography>
                </Box>
                </Box>
            </Box>
            
            {/* Right Section: Action Buttons (Delete/Edit) */}
            <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", height: "100%" }}>
                {/* Delete Button */}
                <Tooltip title="Delete Ingredient" arrow>
                <IconButton color="error" onClick={() => handleDeleteIngredient(ingredient.ingredientName)}>
                    <FaTrashAlt />
                </IconButton>
                </Tooltip>

                {/* Edit Button */}
                <Tooltip title="Edit Ingredient" arrow>
                <IconButton color="primary" sx={{ marginLeft: 1 }}>
                    <MdEdit />
                </IconButton>
                </Tooltip>
            </Box>
            </ListItem>
        ))}
        </List>


      
      )}

      {/* Toggle Button */}
      <Button
        variant="outlined"
        onClick={() => setShowForm((prev) => !prev)}
        startIcon={<FaPlus />}
        sx={{
          marginBottom: 2,
          display: "block",
          width: "100%",
          maxWidth: "200px",
          margin: "0 auto",
        }}
      >
        {showForm ? "Hide Add Ingredient Form" : "Add Ingredient"}
      </Button>

      {/* Conditionally render the form */}
      {showForm && (
        <Box sx={{ backgroundColor: "#f3f3f3", padding: 3, borderRadius: 2 }}>
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
              />
              <TextField
                label="Expiration Date"
                type="date"
                name="expirationDate"
                value={newIngredient.expirationDate}
                onChange={handleInputChange}
              />
              <FormControlLabel
                control={
                  <Checkbox name="frozen" checked={newIngredient.frozen} onChange={handleInputChange} />
                }
                label="Frozen"
              />
              <Button variant="contained" color="primary" type="submit" fullWidth>
                <FaPlus style={{ marginRight: "8px" }} />
                Add Ingredient
              </Button>
            </Box>
          </form>
        </Box>
      )}

      <RecipeSuggestion ingredients={ingredients} />
    </Box>
  );
}
