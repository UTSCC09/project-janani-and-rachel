import { useState, useEffect, useRef, useCallback } from "react";
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
  Snackbar,
  Alert,
} from "@mui/material";
import {
  FaTrashAlt,
  FaPlus,
  FaCheckCircle,
  FaRegCalendarAlt,
  FaRegCalendar,
  FaMinus,
} from "react-icons/fa";
import { MdEdit } from "react-icons/md";
const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

export default function IngredientsSection() {
  const formRef = useRef(null); // Create a reference for the form container
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newIngredient, setNewIngredient] = useState({
    ingredientName: "",
    purchaseDate: new Date().toISOString().split("T")[0], // Defaults to current date in 'yyyy-mm-dd' format
    expirationDate: "", // Defaults to empty string
    frozen: false,
  });
  const [editingIngredient, setEditingIngredient] = useState(null); // State for ingredient being edited
  const [showForm, setShowForm] = useState(false); // State to manage form visibility
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null); // State for error message
  const observer = useRef();
  const initialFetch = useRef(true);

  const fetchIngredients = useCallback(
    (lastVisible = null) => {
      setLoading(true);
      let url = `${domain}/api/ingredients/pantry?limit=10`;
      if (lastVisible) {
        url += `&lastVisibleIngredient=${lastVisible}`;
      }

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const processedData = Array.isArray(data.ingredients)
            ? data.ingredients.map((item) => ({
                ...item,
                purchaseDate: item.purchaseDate || "",
                expirationDate: item.expirationDate || "",
              }))
            : [];

          setIngredients((prev) => [...prev, ...processedData]);
          setLastVisible(data.lastVisible || null);
          setHasMore(processedData.length === 10);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching ingredients:", error);
          setLoading(false);
        });
    },
    [domain]
  );

  useEffect(() => {
    if (initialFetch.current) {
      fetchIngredients();
      initialFetch.current = false;
    }
  }, [fetchIngredients]);

  const lastIngredientElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchIngredients(lastVisible);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, lastVisible, fetchIngredients]
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewIngredient((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddOrUpdateIngredient = (e) => {
    e.preventDefault();

    // Check if the ingredient already exists
    if (ingredients.some((ingredient) => ingredient.ingredientName.toLowerCase() === newIngredient.ingredientName.toLowerCase())) {
      setError("Ingredient already exists.");
      return;
    }

    const method = editingIngredient ? "PATCH" : "POST";
    const endpoint = `${domain}/api/ingredients/pantry`;
    const requestBody = editingIngredient
      ? {
          ...newIngredient,
          ingredientName: editingIngredient.ingredientName, // Preserve ingredient name for update
        }
      : newIngredient;

    fetch(endpoint, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to add or update ingredient.");
        }
      })
      .then((data) => {
        if (editingIngredient) {
          // Update the ingredient in the list
          setIngredients((prev) =>
            prev.map((ingredient) =>
              ingredient.ingredientName === editingIngredient.ingredientName
                ? { ...ingredient, ...newIngredient }
                : ingredient
            )
          );
        } else {
          // Add the new ingredient to the list
          setIngredients((prev) => [...prev, newIngredient]);
        }

        // Reset form and state
        setEditingIngredient(null);
        setNewIngredient({
          ingredientName: "",
          purchaseDate: new Date().toISOString().split("T")[0], // Reset to current date
          expirationDate: "",
          frozen: false,
        });
        setShowForm(false);
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
            prev.filter(
              (ingredient) => ingredient.ingredientName !== ingredientName
            )
          );
        } else {
          throw new Error("Failed to delete ingredient.");
        }
      })
      .catch((error) => {
        console.error("Error deleting ingredient:", error);
      });
  };

  const handleEditIngredient = (ingredient) => {
    setEditingIngredient(ingredient);
    setNewIngredient({
      ingredientName: ingredient.ingredientName,
      purchaseDate: ingredient.purchaseDate,
      expirationDate: ingredient.expirationDate,
      frozen: ingredient.frozen,
    });
    setShowForm(true);

    // Scroll to the form when an ingredient is being edited
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleToggleForm = () => {
    if (showForm) {
      // Reset newIngredient state when hiding the form (Cancel)
      setNewIngredient({
        ingredientName: "",
        purchaseDate: new Date().toISOString().split("T")[0], // Reset to current date
        expirationDate: "",
        frozen: false,
      });
      setEditingIngredient(null); // Clear editing state
    } else {
      // Scroll to the form when opening it
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    setShowForm((prev) => !prev);
  };

  const handleCloseSnackbar = () => {
    setError(null);
  };

  return (
    <Box sx={{ padding: 3, maxWidth: "900px", margin: "0 auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ fontWeight: "bold", color: "#7e91ff" }}
      >
        Pantry Ingredients
      </Typography>

      <List>
        {ingredients.map((ingredient, index) => (
          <Box key={index}>
            <ListItem
              ref={index === ingredients.length - 1 ? lastIngredientElementRef : null}
              sx={{
                marginBottom: 2,
                backgroundColor: "#fffae1",
                borderRadius: 2,
                padding: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                transition: "transform 0.3s ease, box-shadow 0.3s ease", // Smooth transition for scale and shadow
                "&:hover": {
                  transform: "scale(1.05)", // Slightly increase the size
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Add subtle shadow
                },
              }}
            >
              {/* Left Section: Ingredient Details */}
              <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                {/* Ingredient Name */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    marginBottom: 1,
                    color: "#ffffff", // White text color
                    padding: "4px 8px", // Add padding inside the box
                    backgroundColor: "#7e91ff", // Pastel purple background
                    borderRadius: 2, // Rounded corners for the box
                    display: "inline-block", // To make sure it doesn't take full width
                  }}
                >
                  {ingredient.ingredientName}
                </Typography>

                {/* Expiration, Purchase Date, and Frozen Status */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 0.5,
                    }}
                  >
                    <FaRegCalendarAlt
                      style={{
                        marginRight: "8px",
                        fontSize: "16px",
                        color: "#7e91ff",
                      }}
                    />
                    <Typography variant="body2" sx={{ color: "#777" }}>
                      Expiration: {ingredient.expirationDate || "N/A"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 0.5,
                    }}
                  >
                    <FaRegCalendar
                      style={{
                        marginRight: "8px",
                        fontSize: "16px",
                        color: "#7e91ff",
                      }}
                    />
                    <Typography variant="body2" sx={{ color: "#777" }}>
                      Purchased: {ingredient.purchaseDate || "N/A"}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <FaCheckCircle
                      color={ingredient.frozen ? "#7e91ff" : "gray"}
                      style={{ marginRight: "8px", fontSize: "16px" }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: ingredient.frozen ? "#7e91ff" : "gray" }}
                    >
                      {ingredient.frozen ? "Frozen" : "Not Frozen"}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Right Section: Action Buttons (Delete/Edit) */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Tooltip title="Edit Ingredient" arrow>
                  <IconButton
                    color="primary"
                    sx={{ marginLeft: 1 }}
                    onClick={() => handleEditIngredient(ingredient)}
                  >
                    <MdEdit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Ingredient" arrow>
                  <IconButton
                    color="error"
                    onClick={() =>
                      handleDeleteIngredient(ingredient.ingredientName)
                    }
                  >
                    <FaTrashAlt />
                  </IconButton>
                </Tooltip>
              </Box>
            </ListItem>
            {editingIngredient === ingredient && (
              <Box
                ref={formRef} // Add the reference here
                component="form"
                onSubmit={handleAddOrUpdateIngredient}
                sx={{
                  backgroundColor: "#f9f9f9",
                  padding: 2,
                  borderRadius: 2,
                  boxShadow: 2,
                  marginTop: 2,
                }}
              >
                {/* Ingredient Name */}
                <TextField
                  label="Ingredient Name"
                  name="ingredientName"
                  value={
                    editingIngredient
                      ? editingIngredient.ingredientName
                      : newIngredient.ingredientName
                  }
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  required
                  disabled={!!editingIngredient} // Disable if editing
                />

                {/* Purchase Date */}
                <TextField
                  type="date"
                  label="Purchase Date"
                  name="purchaseDate"
                  value={newIngredient.purchaseDate}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  required
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />

                {/* Expiration Date */}
                <TextField
                  type="date"
                  label="Expiration Date"
                  name="expirationDate"
                  value={newIngredient.expirationDate}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />

                {/* Frozen Checkbox */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newIngredient.frozen}
                      onChange={handleInputChange}
                      name="frozen"
                      color="#7e91ff"
                    />
                  }
                  label="Frozen"
                  sx={{ marginBottom: 2 }}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    padding: 1.5,
                    backgroundColor: "#7e91ff", // Custom background color (pastel purple)
                    "&:hover": {
                      backgroundColor: "#6b82e0", // Custom hover background color
                    },
                  }}
                >
                  {editingIngredient ? "Update Ingredient" : "Add Ingredient"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditingIngredient(null);
                    setShowForm(false);
                  }}
                  startIcon={<FaMinus />}
                  sx={{
                    marginTop: 2,
                    display: "block",
                    width: "100%",
                    textAlign: "center",
                    fontSize: "0.9rem",
                    color: "#7e91ff", // Button text color
                    borderColor: "#7e91ff", // Border color
                    "&:hover": {
                      backgroundColor: "#7e91ff", // Hover background
                      color: "#fff", // Hover text color
                    },
                  }}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Box>
        ))}
      </List>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {!editingIngredient && (
        <>
          <Button
            variant="outlined"
            onClick={handleToggleForm}
            startIcon={showForm ? <FaMinus /> : <FaPlus />} // Conditional icon
            sx={{
              marginBottom: 2,
              display: "block",
              width: "100%",
              textAlign: "center",
              fontSize: "1.1rem",
              color: "#7e91ff", // Button text color
              borderColor: "#7e91ff", // Border color
              "&:hover": {
                backgroundColor: "#7e91ff", // Hover background
                color: "#fff", // Hover text color
              },
            }}
          >
            {showForm ? "Cancel" : "Add Ingredient"}
          </Button>

          {showForm && (
            <Box
              ref={formRef} // Add the reference here
              component="form"
              onSubmit={handleAddOrUpdateIngredient}
              sx={{
                backgroundColor: "#f9f9f9",
                padding: 2,
                borderRadius: 2,
                boxShadow: 2,
                marginTop: 2,
              }}
            >
              {/* Ingredient Name */}
              <TextField
                label="Ingredient Name"
                name="ingredientName"
                value={newIngredient.ingredientName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />

              {/* Purchase Date */}
              <TextField
                type="date"
                label="Purchase Date"
                name="purchaseDate"
                value={newIngredient.purchaseDate}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              {/* Expiration Date */}
              <TextField
                type="date"
                label="Expiration Date"
                name="expirationDate"
                value={newIngredient.expirationDate}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              {/* Frozen Checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newIngredient.frozen}
                    onChange={handleInputChange}
                    name="frozen"
                    color="#7e91ff"
                  />
                }
                label="Frozen"
                sx={{ marginBottom: 2 }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  padding: 1.5,
                  backgroundColor: "#7e91ff", // Custom background color (pastel purple)
                  "&:hover": {
                    backgroundColor: "#6b82e0", // Custom hover background color
                  },
                }}
              >
                Add Ingredient
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Recipe Suggestions */}
      <RecipeSuggestion ingredients={ingredients} />

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}