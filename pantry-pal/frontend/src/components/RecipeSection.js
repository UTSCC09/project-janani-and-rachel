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
    // Fetch all favorite recipes
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

    // Fetch unplanned recipes
    fetch(`${domain}/api/recipes/favorites/unplanned`)
      .then((res) => res.json())
      .then((data) => {
        // Assuming `data.recipes` is the correct format for unplanned recipes
        setUnplannedRecipes(data.recipes || []);
        setLoadingUnplanned(false);
      })
      .catch((error) => {
        console.error('Error fetching unplanned recipes:', error);
        setLoadingUnplanned(false);
      });
  }, []);

  const handleDelete = (recipeId) => {
    fetch(`${domain}/api/recipes/${recipeId}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (res.status === 204) {
          setAllRecipes((prevRecipes) =>
            prevRecipes.filter((recipe) => recipe.recipeId !== recipeId)
          );
          setUnplannedRecipes((prevRecipes) =>
            prevRecipes.filter((recipe) => recipe.recipeId !== recipeId)
          );
          setSearchedRecipe(null);
        } else {
          console.error('Error deleting recipe:', res.status);
        }
      })
      .catch((error) => {
        console.error('Error deleting recipe:', error);
      });
  };

  const handleSearchRecipe = () => {
    if (!searchRecipeId) return;
    setLoadingSearch(true);
    fetch(`${domain}/api/recipes/favorites/${searchRecipeId}`)
      .then((res) => res.json())
      .then((data) => {
        setSearchedRecipe(data);
        setLoadingSearch(false);
      })
      .catch((error) => {
        console.error('Error fetching recipe by ID:', error);
        setSearchedRecipe(null);
        setLoadingSearch(false);
      });
  };

  return (
    <Box sx={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Typography
        variant="h3"
        gutterBottom
        align="center"
        sx={{
          color: '#1976d2',
          fontWeight: 600,
          marginBottom: '2rem',
        }}
      >
        My Favorite Recipes
      </Typography>

      {/* Search Section */}
      <Box sx={{ marginBottom: '2rem' }}>
        <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
          Search for a Favorite Recipe by Name
        </Typography>
        <Box display="flex" alignItems="center" mb={2} sx={{ justifyContent: 'center' }}>
          <TextField
            label="Recipe Name"
            variant="outlined"
            value={searchRecipeId}
            onChange={(e) => setSearchRecipeId(e.target.value)}
            sx={{
              marginRight: 1,
              maxWidth: '300px',
              '& .MuiOutlinedInput-root': { borderRadius: '12px' },
            }}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleSearchRecipe}
            disabled={loadingSearch}
            sx={{
              padding: '10px 20px',
              borderRadius: '12px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#1976d2',
                opacity: 0.9,
              },
            }}
          >
            {loadingSearch ? <CircularProgress size={24} color="inherit" /> : 'Search'}
          </Button>
        </Box>
      </Box>

      {/* Search Result */}
      {searchedRecipe && (
        <Card sx={{ marginTop: 2, borderRadius: '12px', boxShadow: 3, backgroundColor: '#f9f9f9' }}>
          <CardContent>
            <Typography variant="h6">{searchedRecipe.recipeName}</Typography>
            <Divider sx={{ margin: '1rem 0' }} />
            <Typography variant="body1">
              <strong>Directions:</strong> {searchedRecipe.directions}
            </Typography>
            <Typography variant="body1">
              <strong>Notes:</strong> {searchedRecipe.notes}
            </Typography>
            <Typography variant="body1">
              <strong>Planned:</strong> {searchedRecipe.planned ? 'Yes' : 'No'}
            </Typography>
            <Typography variant="body1">
              <strong>Date:</strong> {searchedRecipe.date || 'N/A'}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <IconButton onClick={() => handleDelete(searchedRecipe.recipeId)} color="error" sx={{ padding: 0 }}>
                <MdDelete size={24} />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* All Recipes Section */}
      <Typography variant="h5" gutterBottom sx={{ marginTop: '2rem' }}>
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
  );
}
