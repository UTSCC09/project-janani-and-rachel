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
import StyledTitle from './StyledTitle';
import RecipeCard from './RecipeCard';

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
      let url = `${domain}/api/recipes/favorites?`;
      if (lastVisible) {
        url += `&lastVisible=${lastVisible}`;
      }

      fetch(url, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("idToken")}`,
          'GoogleAccessToken': localStorage.getItem('accessToken')
        }
      })
      .then((response) => {
        //console.log("Response:", response); // Log the response
        return response.json();
      })
        .then((data) => {
          console.log(data);
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
    fetch(`${domain}/api/recipes/favorites/${encodeURIComponent(recipeId)}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("idToken")}`,
        'GoogleAccessToken': localStorage.getItem('accessToken')
      }
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
      <Box sx={{ marginBottom: 6 }}>
        <StyledTitle>Favorite Recipes</StyledTitle>
      </Box>
  
      {/* Recipe Cards */}
      <Box>
        {allRecipes.map((recipe, index) => (
          <RecipeCard
            key={recipe.recipeId}
            recipe={recipe}
            lastRecipeElementRef={index === allRecipes.length - 1 ? lastRecipeElementRef : null}
            handleDelete={handleDelete}
          />
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
