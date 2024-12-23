import { useState, useEffect, useRef, useCallback } from "react";
import RecipeSuggestion from "@/components/RecipeSuggestion";
import IngredientDetails from "./IngredientDetails";
import IngredientActions from "./IngredientActions";
import IngredientForm from "./IngredientForm";
import PurpleButton from "./PurpleButton";
import StyledTitle from "./StyledTitle";

import {
  Box,
  Typography,
  List,
  ListItem,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

import { FaPlus, FaMinus } from "react-icons/fa";

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

export default function IngredientsSection() {
  const formRef = useRef(null);
  const [ingredients, setIngredients] = useState([]); // list of ingredients
  const [loading, setLoading] = useState(true); // loading state for fetching ingredients
  const [newIngredient, setNewIngredient] = useState({
    ingredientName: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    expirationDate: "",
    frozen: false,
  });
  const [editingIngredient, setEditingIngredient] = useState(null); // Current ingredient being edited
  const [showForm, setShowForm] = useState(false); // Visibility of the form
  const [lastVisible, setLastVisible] = useState(null); // Last fetched ingredient for pagination
  const [hasMore, setHasMore] = useState(true); // Indicates if there are more ingredients to fetch
  const [error, setError] = useState(null); // Error message for user feedback
  const observer = useRef();
  const initialFetch = useRef(true);

  const fetchIngredients = useCallback(
    (lastVisible = null) => {
      setLoading(true);
      let url = `${domain}/api/ingredients/pantry?limit=10`;
      if (lastVisible) {
        url += `&lastVisibleIngredient=${lastVisible}`;
      }

      fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("idToken")}`,
          GoogleAccessToken: localStorage.getItem("accessToken"),
          GoogleAccessToken: localStorage.getItem("accessToken"),
        },
      })
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

  // for infinite scrolling
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
    
    // check for duplicate ingredient names
    if (
      (!editingIngredient &&
        ingredients.some(
          (ingredient) =>
            ingredient.ingredientName.toLowerCase() ===
            newIngredient.ingredientName.toLowerCase()
        )) ||
      (editingIngredient &&
        ingredients.some(
          (ingredient) =>
            ingredient.ingredientName.toLowerCase() ===
              newIngredient.ingredientName.toLowerCase() &&
            ingredient.ingredientName !== editingIngredient.ingredientName
        ))
    ) {
      setError("Ingredient already exists.");
      return;
    }
    const method = editingIngredient ? "PATCH" : "POST";
    const endpoint = `${domain}/api/ingredients/pantry`;
    const requestBody = editingIngredient
      ? {
          ...newIngredient,
          ingredientName: editingIngredient.ingredientName,
          newIngredientName: newIngredient.ingredientName,
        }
      : newIngredient;

    fetch(endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("idToken")}`,
        GoogleAccessToken: localStorage.getItem("accessToken"),
      },
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
          setIngredients((prev) =>
            prev.map((ingredient) =>
              ingredient.ingredientName === editingIngredient.ingredientName
                ? {
                    ...ingredient,
                    ...newIngredient,
                    ingredientName: newIngredient.ingredientName,
                  }
                : ingredient
            )
          );
        } else {
          setIngredients((prev) => [...prev, newIngredient]);
        }

        setEditingIngredient(null);
        setNewIngredient({
          ingredientName: "",
          purchaseDate: new Date().toISOString().split("T")[0],
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
    fetch(
      `${domain}/api/ingredients/pantry/${encodeURIComponent(ingredientName)}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("idToken")}`,
          GoogleAccessToken: localStorage.getItem("accessToken"),
        },
      }
    )
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
      purchaseDate: formatDate(ingredient.purchaseDate), // Use formatDate for consistent formatting
      expirationDate: ingredient.expirationDate
        ? formatDate(ingredient.expirationDate)
        : "", // Handle expirationDate as well
      frozen: ingredient.frozen,
    });
    setShowForm(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };
  const handleToggleForm = () => {
    if (showForm) {
      setNewIngredient({
        ingredientName: "",
        purchaseDate: new Date().toISOString().split("T")[0],
        expirationDate: "",
        frozen: false,
      });
      setEditingIngredient(null);
    } else {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    setShowForm((prev) => !prev);
  };

  const handleCloseSnackbar = () => {
    setError(null);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    let date;
    if (
      timestamp._seconds !== undefined &&
      timestamp._nanoseconds !== undefined
    ) {
      date = new Date(
        timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000
      );
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    // Adjust for timezone offset
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

    // Format as YYYY-MM-DD
    return utcDate.toISOString().split("T")[0];
  };

  return (
    <Box sx={{ padding: 3, maxWidth: "900px", margin: "0 auto" }}>
      <StyledTitle>Pantry Ingredients</StyledTitle>
      <List>
        {ingredients.map((ingredient, index) => (
          <Box key={index}>
            <ListItem
              ref={
                index === ingredients.length - 1
                  ? lastIngredientElementRef
                  : null
              }
              sx={{
                marginBottom: 2,
                backgroundColor: "#fffae1",
                borderRadius: 2,
                padding: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              <IngredientDetails
                ingredient={ingredient}
                formatDate={formatDate}
              />
              <IngredientActions
                onEdit={() => handleEditIngredient(ingredient)}
                onDelete={() =>
                  handleDeleteIngredient(ingredient.ingredientName)
                }
              />
            </ListItem>
            {editingIngredient === ingredient && (
              <IngredientForm
                ingredient={newIngredient}
                onChange={handleInputChange}
                onSubmit={handleAddOrUpdateIngredient}
                onCancel={() => {
                  setEditingIngredient(null);
                  setShowForm(false);
                  setNewIngredient({
                    ingredientName: "",
                    purchaseDate: new Date().toISOString().split("T")[0],
                    expirationDate: "",
                    frozen: false,
                  });
                }}
                formRef={formRef}
                isEditing={true}
              />
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
          <PurpleButton
            onClick={handleToggleForm}
            startIcon={showForm ? <FaMinus /> : <FaPlus />}
          >
            {showForm ? "Cancel" : "Add Ingredient"}
          </PurpleButton>

          {showForm && (
            <IngredientForm
              ingredient={newIngredient}
              onChange={handleInputChange}
              onSubmit={handleAddOrUpdateIngredient}
              onCancel={() => {
                setShowForm(false);
                setNewIngredient({
                  ingredientName: "",
                  purchaseDate: new Date().toISOString().split("T")[0],
                  expirationDate: "",
                  frozen: false,
                });
              }}
              formRef={formRef}
              isEditing={false}
            />
          )}
        </>
      )}

      <RecipeSuggestion ingredients={ingredients} />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
