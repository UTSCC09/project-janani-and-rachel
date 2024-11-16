import { useEffect, useState, useRef, useCallback } from "react";
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Box,
  Container,
} from "@mui/material";
import { FaTrashAlt } from "react-icons/fa"; // Import FaTrashAlt

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

export default function RecipeList() {
  const [allRecipes, setAllRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const initialFetch = useRef(true);

  const fetchRecipes = useCallback(
    (lastVisible = null) => {
      setLoading(true);
      let url = `${domain}/api/recipes/favorites?limit=10`;
      if (lastVisible) {
        url += `&lastVisible=${lastVisible}`;
      }

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const processedData = Array.isArray(data.recipes)
            ? data.recipes.map((item) => ({
                ...item,
              }))
            : [];

          setAllRecipes((prev) => [...prev, ...processedData]);
          setLastVisible(data.lastVisible || null);
          setHasMore(processedData.length === 10);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching recipes:", error);
          setLoading(false);
        });
    },
    [domain]
  );

  useEffect(() => {
    if (initialFetch.current) {
      fetchRecipes();
      initialFetch.current = false;
    }
  }, [fetchRecipes]);

  const lastRecipeElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchRecipes(lastVisible);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, lastVisible, fetchRecipes]
  );

  const handleDelete = (recipeId) => {
    // Send DELETE request to the backend
    fetch(`${domain}/api/recipes/favorites/${recipeId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          // Update the UI by removing the deleted recipe from the list
          setAllRecipes((prevRecipes) =>
            prevRecipes.filter((recipe) => recipe.recipeId !== recipeId)
          );
        } else {
          console.error("Failed to delete the recipe");
        }
      })
      .catch((error) => {
        console.error("Error deleting recipe:", error);
      });
  };

  return (
    <Container maxWidth="md">
      {/* Title Styled as Normal Text */}
      <Box sx={{ marginBottom: 6 }}>
        <Typography
          variant="h2"
          component="div"
          sx={{
            fontWeight: "bold",
            fontSize: "3rem",
            color: "#7e91ff",
            textAlign: "center",
            letterSpacing: "2px",
            lineHeight: 1.2,
            textShadow: "2px 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          Favorite Recipes
        </Typography>
      </Box>

      {/* Recipe Cards */}
      <Box>
        {allRecipes.map((recipe, index) => (
          <Card
            key={recipe.recipeId}
            ref={index === allRecipes.length - 1 ? lastRecipeElementRef : null}
            sx={{
              borderRadius: "16px",
              boxShadow: 3,
              backgroundColor: "#fffae1", // Light pastel background for cards
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              marginBottom: "1.5rem", // Reduced margin for better spacing
              position: "relative", // For absolute positioning of the button
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            {/* Delete Button in Top Right Corner */}
            <Box sx={{ position: "absolute", top: "8px", right: "8px" }}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleDelete(recipe.recipeId)}
                sx={{
                  padding: "8px 16px",
                  border: "none",
                  textTransform: "none",
                  color: "#f44336",
                  "&:hover": {
                    backgroundColor: "#f44336",
                    color: "#fff",
                  },
                }}
              >
                <FaTrashAlt size={20} />
              </Button>
            </Box>

            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "#7e91ff", // Background color for the recipe name
                    padding: "8px 16px", // Adjust padding for better visual balance
                    borderRadius: "8px", // Optional: rounded corners for the background
                    maxWidth: "70%", // Limit width to avoid text overflow
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: "600", color: "#fff" }}>
                    {recipe.recipeName}
                  </Typography>
                </Box>
              </Box>

              {/* Notes Section */}
              <Box sx={{ marginBottom: "1rem" }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "500",
                    color: "#7e91ff", // Soft purple for notes
                    marginBottom: "0.5rem",
                  }}
                >
                  <strong>Notes:</strong>
                </Typography>
                <Typography variant="body2">
                  {recipe.notes || "No notes available"}
                </Typography>
              </Box>

              {/* Date Section */}
              <Box sx={{ marginBottom: "1.5rem" }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "500",
                    color: "#7e91ff", // Soft purple for date
                    marginBottom: "0.5rem",
                  }}
                >
                  <strong>Date:</strong> {recipe.date || "N/A"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Loading Spinner */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
          <CircularProgress sx={{ color: "#D8A6FF" }} /> {/* Purple color for loading */}
        </Box>
      )}
    </Container>
  );
}
