import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  List,
  ListItemText,
  IconButton,
  CircularProgress,
  Paper,
  Card,
  Tooltip,
} from "@mui/material";
import { FaPlusCircle, FaTrashAlt, FaArrowRight } from "react-icons/fa";

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

export default function ShoppingListSection() {
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    // Fetch shopping list data from the backend or other source
    const fetchShoppingList = async () => {
      try {
        const response = await fetch(`${domain}/api/ingredients/shopping-list`); // Adjust the API endpoint as needed
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setShoppingList(data.ingredients); // Access the ingredients array from the response data
      } catch (error) {
        console.error("Error fetching shopping list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShoppingList();
  }, []);

  const handleInputChange = (e) => {
    setNewItem(e.target.value);
  };

  const handleDeleteItem = (ingredientName) => {
    fetch(`${domain}/api/ingredients/shopping-list/${encodeURIComponent(ingredientName)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (response.status === 200) {
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

  const handleAddItem = (e) => {
    e.preventDefault();

    fetch(`${domain}/api/ingredients/shopping-list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredientName: newItem }),
    })
      .then((response) => {
        if (response.status === 200) {
          setShoppingList((prev) => [...prev, { ingredientName: newItem }]);
          setNewItem("");
        } else {
          throw new Error("Failed to add item to shopping list.");
        }
      })
      .catch((error) => {
        console.error("Error adding item to shopping list:", error);
      });
  };

  const handleMoveToPantry = (ingredientName) => {
    const today = new Date().toISOString().split("T")[0];

    fetch(`${domain}/api/ingredients/pantry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ingredientName,
        purchaseDate: today,
      }),
    })
      .then((response) => {
        if (response.status === 200) {
          return fetch(`${domain}/api/ingredients/shopping-list/${encodeURIComponent(ingredientName)}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
          });
        } else {
          throw new Error("Failed to add item to pantry.");
        }
      })
      .then((response) => {
        if (response.status === 200) {
          setShoppingList((prev) =>
            prev.filter((item) => item.ingredientName !== ingredientName)
          );
        } else {
          throw new Error("Failed to remove item from shopping list.");
        }
      })
      .catch((error) => {
        console.error("Error moving item to pantry:", error);
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
            marginTop: "2rem",
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
                <Box>
                  <Tooltip title="Move to Pantry" enterDelay={0}>
                    <IconButton
                      edge="end"
                      onClick={() => handleMoveToPantry(item.ingredientName)}
                      color="primary"
                      sx={{ padding: "0.5rem" }}
                    >
                      <FaArrowRight />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete Ingredient" enterDelay={0}>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteItem(item.ingredientName)}
                      color="error"
                      sx={{ padding: "0.5rem" }}
                    >
                      <FaTrashAlt />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}