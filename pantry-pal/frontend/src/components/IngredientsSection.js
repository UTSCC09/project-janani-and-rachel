import { useState, useEffect, useRef } from "react";
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

  useEffect(() => {
    fetch(`${domain}/api/ingredients/pantry`)
      .then((response) => response.json())
      .then((data) => {
        const processedData = Array.isArray(data.ingredients)
          ? data.ingredients.map((item) => ({
              ...item,
              purchaseDate: item.purchaseDate || "", // Keep the date in 'yyyy-mm-dd' format
              expirationDate: item.expirationDate || "", // Keep the date in 'yyyy-mm-dd' format
            }))
          : []; // Return an empty array if ingredients is not found

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

  const handleAddOrUpdateIngredient = (e) => {
    e.preventDefault();

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
                : ingredient,
            ),
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
              (ingredient) => ingredient.ingredientName !== ingredientName,
            ),
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
            <ListItem
              key={index}
              sx={{
                marginBottom: 2,
                backgroundColor: "#ffffff",
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
                  sx={{ fontWeight: "bold", marginBottom: 1 }}
                >
                  {ingredient.ingredientName}
                </Typography>

                {/* Expiration, Purchase Date and Frozen Status */}
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
                        color: "#3f51b5",
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
                        color: "#3f51b5",
                      }}
                    />
                    <Typography variant="body2" sx={{ color: "#777" }}>
                      Purchased: {ingredient.purchaseDate || "N/A"}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <FaCheckCircle
                      color={ingredient.frozen ? "green" : "gray"}
                      style={{ marginRight: "8px", fontSize: "16px" }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: ingredient.frozen ? "green" : "gray" }}
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
          ))}
        </List>
      )}

      {/* Toggle Button */}
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
                color="primary"
              />
            }
            label="Frozen"
            sx={{ marginBottom: 2 }}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ padding: 1.5 }}
          >
            {editingIngredient ? "Update Ingredient" : "Add Ingredient"}
          </Button>
        </Box>
      )}

      {/* Recipe Suggestions */}
      <RecipeSuggestion ingredients={ingredients} />
    </Box>
  );
}
