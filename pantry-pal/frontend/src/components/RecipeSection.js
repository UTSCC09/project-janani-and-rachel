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

  return (
    <Container maxWidth="md">
      {/* Title Styled as Normal Text */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography
          variant="h2"
          component="div"
          sx={{
            fontWeight: "bold",
            fontSize: "3rem",
            color: "#c7c3f4",
            textAlign: "center",
            letterSpacing: "2px",
            lineHeight: 1.2,
            textShadow: "2px 2px 6px rgba(0, 0, 0, 0.1)",
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
              borderRadius: "12px",
              boxShadow: 3,
              backgroundColor: "#fafafa",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              marginBottom: "1.5rem",
              "&:hover": {
                transform: "scale(1.03)",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <Typography variant="h6">{recipe.recipeName}</Typography>
              </Box>

              <Box sx={{ marginBottom: "1rem" }}>
                <Typography variant="body2">
                  <strong>Directions:</strong> {recipe.directions}
                </Typography>
                <Typography variant="body2">
                  <strong>Notes:</strong> {recipe.notes}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {recipe.date || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDelete(recipe.recipeId)}
                  sx={{
                    padding: "6px 16px",
                    borderRadius: "12px",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#f44336",
                      color: "#fff",
                    },
                  }}
                >
                  <FaTrashAlt size={20} />
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
}
