import { useEffect, useState } from 'react';
import { Button, Card, CardContent, CircularProgress, TextField, Typography, Grid, Box, Divider } from '@mui/material';
import { MdStar, MdStarBorder } from 'react-icons/md'; // Importing Material icons from react-icons

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
        setUnplannedRecipes(data || []);
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
      <Typography variant="h3" gutterBottom align="center" sx={{ color: '#1976d2' }}>My Favorite Recipes</Typography>

      {/* Search Section */}
      <Box sx={{ marginBottom: '2rem' }}>
        <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>Search for a Favorite Recipe by ID</Typography>
        <Box display="flex" alignItems="center" mb={2} sx={{ justifyContent: 'center' }}>
          <TextField
            label="Enter Recipe ID"
            variant="outlined"
            value={searchRecipeId}
            onChange={(e) => setSearchRecipeId(e.target.value)}
            sx={{ marginRight: 1, maxWidth: '300px' }}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleSearchRecipe}
            disabled={loadingSearch}
            sx={{ padding: '10px 20px' }}
          >
            {loadingSearch ? 'Searching...' : 'Search'}
          </Button>
        </Box>
      </Box>


      {/* Search Result */}
      {searchedRecipe && (
        <Card sx={{ marginTop: 2 }}>
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
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleDelete(searchedRecipe.recipeId)}
              >
                Delete
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* All Recipes Section */}
      <Typography variant="h5" gutterBottom>All Recipes</Typography>
      {loadingAll ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {allRecipes.map((recipe) => (
            <Grid item xs={12} sm={6} md={4} key={recipe.recipeId}>
              <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6">{recipe.recipeName}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    {recipe.planned ? <MdStar color="gold" /> : <MdStarBorder />}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(recipe.recipeId)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Unplanned Recipes Section */}
      <Typography variant="h5" gutterBottom>Unplanned Recipes</Typography>
      {loadingUnplanned ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : unplannedRecipes.length === 0 ? (
        <Typography variant="body1" align="center">No unplanned recipes available.</Typography>
      ) : (
        <Grid container spacing={3}>
          {unplannedRecipes.map((recipe) => (
            <Grid item xs={12} sm={6} md={4} key={recipe.recipeId}>
              <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6">{recipe.recipeName}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    {recipe.planned ? <MdStar color="gold" /> : <MdStarBorder />}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(recipe.recipeId)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
