import { useState, useEffect, useRef, useCallback } from "react";
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
const PURPLE = "#7e91ff";
const YELLOW = "#fffae1";

export default function ShoppingListSection() {
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const fetchMoreItems = useCallback(async () => {
    if (!hasMore) return;
    setLoading(true);
    try {
      const response = await fetch(`${domain}/api/ingredients/shopping-list?lastVisibleIngredient=${lastVisible}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("idToken")}`,
          "GoogleAccessToken": localStorage.getItem('accessToken')
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.ingredients && Array.isArray(data.ingredients)) {
        setShoppingList((prevItems) => {
          const newItems = data.ingredients.filter(
            (item) => !prevItems.some((prevItem) => prevItem.ingredientName === item.ingredientName)
          );
          return [...prevItems, ...newItems];
        });
        setLastVisible(data.lastVisible);
        setHasMore(data.ingredients.length > 0);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more items:", error);
    } finally {
      setLoading(false);
    }
  }, [lastVisible, hasMore]);

  useEffect(() => {
    fetchMoreItems();
  }, [fetchMoreItems]);

  const lastItemRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchMoreItems();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, fetchMoreItems]
  );

  const handleInputChange = (e) => {
    setNewItem(e.target.value);
  };

  const handleDeleteItem = async (ingredientName) => {
    try {
      const response = await fetch(`${domain}/api/ingredients/shopping-list/${encodeURIComponent(ingredientName)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("idToken")}`,
          "GoogleAccessToken": localStorage.getItem('accessToken')
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setShoppingList((prevItems) => prevItems.filter(item => item.ingredientName !== ingredientName));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${domain}/api/ingredients/shopping-list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("idToken")}`,
          "GoogleAccessToken": localStorage.getItem('accessToken')
        },
        body: JSON.stringify({ ingredientName: newItem }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setShoppingList((prevItems) => [...prevItems, { ingredientName: newItem }]);
      setNewItem("");
    } catch (error) {
      console.error("Error adding item to shopping list:", error);
    }
  };

  const handleMoveToPantry = async (ingredientName) => {
    const today = new Date().toISOString().split("T")[0];
    try {
      const response = await fetch(`${domain}/api/ingredients/pantry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("idToken")}`,
          "GoogleAccessToken": localStorage.getItem('accessToken')
        },
        body: JSON.stringify({
          ingredientName,
          purchaseDate: today,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetch(`${domain}/api/ingredients/shopping-list/${encodeURIComponent(ingredientName)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("idToken")}`,
          "GoogleAccessToken": localStorage.getItem('accessToken')
        },
      });
      setShoppingList((prevItems) => prevItems.filter(item => item.ingredientName !== ingredientName));
    } catch (error) {
      console.error("Error moving item to pantry:", error);
    }
  };

  return (
    <Box sx={{ padding: "2rem", maxWidth: 800, margin: "auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 600, textAlign: "center", color: PURPLE }}
      >
        Shopping List
      </Typography>

      <Typography variant="h6" sx={{ marginBottom: "1rem", fontWeight: 600, color: PURPLE}}>
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
            backgroundColor: PURPLE, 
            "&:hover": { backgroundColor: "#6b82e0" }, // Darker shade on hover
          }}
          startIcon={<FaPlusCircle />}
        >
          Add
        </Button>
      </Box>

      {loading && shoppingList.length === 0 ? (
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
            backgroundColor: YELLOW,
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
                ref={index === shoppingList.length - 1 ? lastItemRef : null}
              >
                <ListItemText
                  primary={item.ingredientName}
                  sx={{ textDecoration: "none", fontWeight: 500, color: "#333" }}
                />
                <Box>
                  <Tooltip title="Move to Pantry" enterDelay={0}>
                    <IconButton
                      edge="end"
                      onClick={() => handleMoveToPantry(item.ingredientName)}
                      color="primary"
                      sx={{ padding: "0.5rem", color: PURPLE }}
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
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
              <CircularProgress />
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}