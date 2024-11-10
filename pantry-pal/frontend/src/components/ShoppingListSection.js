import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { FaPlusCircle, FaTrashAlt } from "react-icons/fa"; // React Icons

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

export default function ShoppingListSection() {
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");

  // Fetch shopping list from /api/ingredients/shoppingList when the component mounts
  useEffect(() => {
    fetch(`${domain}/api/ingredients/shoppingList`)
      .then((response) => response.json())
      .then((data) => {
        setShoppingList(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching shopping list:", error);
        setLoading(false);
      });
  }, []);

  // Handle input change for the new item form
  const handleInputChange = (e) => {
    setNewItem(e.target.value);
  };

  // Handle form submission to add a new item
  const handleAddItem = (e) => {
    e.preventDefault();

    // Send POST request to add the new item to the shopping list
    fetch(`${domain}/api/ingredients/shoppingList`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredientName: newItem }),
    })
      .then((response) => {
        if (response.status === 200) {
          // Update shopping list with the new item
          setShoppingList((prev) => [...prev, { ingredientName: newItem }]);
          // Reset input field
          setNewItem("");
        } else {
          throw new Error("Failed to add item to shopping list.");
        }
      })
      .catch((error) => {
        console.error("Error adding item to shopping list:", error);
      });
  };

  // Handle deletion of an item
  const handleDeleteItem = (ingredientName) => {
    // Send DELETE request to remove the item from the shopping list
    fetch(`${domain}/api/ingredients/shoppingList`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredientName }),
    })
      .then((response) => {
        if (response.status === 200) {
          // Update shopping list by removing the deleted item
          setShoppingList((prev) =>
            prev.filter((item) => item.ingredientName !== ingredientName)
          );
        } else {
          throw new Error("Failed to delete item from shopping list.");
        }
      })
      .catch((error) => {
        console.error("Error deleting item from shopping list:", error);
      });
  };

  return (
    <Box sx={{ padding: "2rem", maxWidth: 600, margin: "auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 600, textAlign: "center" }}
      >
        Shopping List
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper
          elevation={3}
          sx={{
            padding: "1rem",
            marginBottom: "1.5rem",
            backgroundColor: "#f9f9f9",
            borderRadius: 2,
          }}
        >
          <List sx={{ padding: 0 }}>
            {shoppingList.map((item, index) => (
              <Card
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  marginBottom: "1rem",
                  boxShadow: 3,
                  borderRadius: 2,
                  backgroundColor: "#fff",
                  "&:hover": { boxShadow: 6 },
                }}
              >
                <ListItemText
                  primary={item.ingredientName}
                  sx={{ textDecoration: "none", fontWeight: 500 }}
                />
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteItem(item.ingredientName)}
                  color="error"
                  sx={{ padding: "0.5rem" }}
                >
                  <FaTrashAlt />
                </IconButton>
              </Card>
            ))}
          </List>
        </Paper>
      )}

      <Typography variant="h6" sx={{ marginBottom: "1rem", fontWeight: 600 }}>
        Add Item to Shopping List
      </Typography>

      <Box
        component="form"
        onSubmit={handleAddItem}
        sx={{ display: "flex", flexDirection: "row", gap: 2 }}
      >
        <TextField
          label="Ingredient Name"
          variant="outlined"
          value={newItem}
          onChange={handleInputChange}
          fullWidth
          required
          sx={{ backgroundColor: "#fff", borderRadius: 1 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            height: "100%",
            borderRadius: 1,
            boxShadow: 2,
            "&:hover": { boxShadow: 4 },
          }}
          startIcon={<FaPlusCircle />}
        >
          Add
        </Button>
      </Box>
    </Box>
  );
}
