import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
  Box,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import { MdDelete } from 'react-icons/md';

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

export default function RecipeList() {
  const [allRecipes, setAllRecipes] = useState([]);
  const [unplannedRecipes, setUnplannedRecipes] = useState([]);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingUnplanned, setLoadingUnplanned] = useState(true);
  const [searchRecipeId, setSearchRecipeId] = useState('');
  const [searchedRecipe, setSearchedRecipe] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    fetch(`${domain}/api/recipes/favorites`)
      .then((res) => res.json())
      .then((data) => {
        const recipes = data.recipes || [];
        setAllRecipes(recipes);
        setLoadingAll(false);
      })
      .catch((error) => {
        console.error('Error fetching all recipes:', error);
        setLoadingAll(false);
      });

    fetch(`${domain}/api/recipes/favorites/unplanned`)
      .then((res) => res.json())
      .then((data) => {
        setUnplannedRecipes(data.recipes || []);
        setLoadingUnplanned(false);
      })
      .catch((error) => {
        console.error('Error fetching unplanned recipes:', error);
        setLoadingUnplanned(false);
      });
  }, []);

  const handleDelete = (recipeId) => {
    setAllRecipes((prevRecipes) =>
      prevRecipes.filter((recipe) => recipe.recipeId !== recipeId)
    );
    setUnplannedRecipes((prevRecipes) =>
      prevRecipes.filter((recipe) => recipe.recipeId !== recipeId)
    );
    
    fetch(`${domain}/api/recipes/favorites/${recipeId}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (res.status === 204) return;
        console.error('Error deleting recipe:', res.status);
        fetchRecipes();
      })
      .catch((error) => {
        console.error('Error deleting recipe:', error);
        fetchRecipes();
      });
  };

  const fetchRecipes = () => {
    fetch(`${domain}/api/recipes/favorites`)
      .then((res) => res.json())
      .then((data) => {
        const recipes = data.recipes || [];
        setAllRecipes(recipes);
      })
      .catch((error) => {
        console.error('Error fetching all recipes:', error);
      });

    fetch(`${domain}/api/recipes/favorites/unplanned`)
      .then((res) => res.json())
      .then((data) => {
        setUnplannedRecipes(data.recipes || []);
      })
      .catch((error) => {
        console.error('Error fetching unplanned recipes:', error);
      });
  };

  return (
    <Box sx={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Main Title */}
      <Typography
        variant="h3"
        gutterBottom
        align="center"
        sx={{
          color: '#1976d2',
          fontWeight: 600,
          marginBottom: '3rem',
          textTransform: 'uppercase',
          letterSpacing: 1.5,
        }}
      >
        My Favorite Recipes
      </Typography>

      {/* All Recipes Section */}
      <Box sx={{ marginBottom: '3rem' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: '#333',
            borderBottom: '2px solid #1976d2',
            paddingBottom: '0.5rem',
            marginBottom: '2rem',
            letterSpacing: 0.5,
          }}
        >
          All Recipes
        </Typography>
        {loadingAll ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {allRecipes.map((recipe) => (
              <Card
                key={recipe.recipeId}
                sx={{
                  borderRadius: '12px',
                  boxShadow: 3,
                  backgroundColor: '#fafafa',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <Typography variant="h6">{recipe.recipeName}</Typography>
                    {recipe.planned && (
                      <Chip
                        label="Planned"
                        color="primary"
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          borderRadius: '16px',
                          padding: '0.2rem 0.8rem',
                        }}
                      />
                    )}
                  </Box>

                  <Box sx={{ marginBottom: '1rem' }}>
                    <Typography variant="body2">
                      <strong>Directions:</strong> {recipe.directions}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Notes:</strong> {recipe.notes}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Date:</strong> {recipe.date || 'N/A'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(recipe.recipeId)}
                      sx={{
                        padding: '6px 16px',
                        borderRadius: '12px',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#f44336',
                          color: '#fff',
                        },
                      }}
                    >
                      <MdDelete size={20} />
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* Unplanned Recipes Section */}
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: '#333',
            borderBottom: '2px solid #1976d2',
            paddingBottom: '0.5rem',
            marginBottom: '2rem',
            letterSpacing: 0.5,
          }}
        >
          Unplanned Recipes
        </Typography>
        {loadingUnplanned ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {unplannedRecipes.map((recipe) => (
              <Card
                key={recipe.recipeId}
                sx={{
                  borderRadius: '12px',
                  boxShadow: 3,
                  backgroundColor: '#fafafa',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <Typography variant="h6">{recipe.recipeName}</Typography>
                  </Box>

                  <Box sx={{ marginBottom: '1rem' }}>
                    <Typography variant="body2">
                      <strong>Directions:</strong> {recipe.directions}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Notes:</strong> {recipe.notes}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Date:</strong> {recipe.date || 'N/A'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(recipe.recipeId)}
                      sx={{
                        padding: '6px 16px',
                        borderRadius: '12px',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#f44336',
                          color: '#fff',
                        },
                      }}
                    >
                      <MdDelete size={20} />
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
