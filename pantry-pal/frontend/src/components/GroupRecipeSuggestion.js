import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FavoriteIcon from '@mui/icons-material/Favorite';

const PURPLE = "#7e91ff";
const LIGHT_PURPLE = "#d1d9ff";
const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

const GroupRecipeSuggestion = ({ groupId, recipes }) => {
  const [groupRecipes, setGroupRecipes] = useState(recipes || []);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    setGroupRecipes(Array.isArray(recipes) ? recipes : []);
  }, [recipes]);

  const handleFavoriteRecipe = async (recipe) => {
    try {
      const response = await fetch(`${domain}/api/groups/${groupId}/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('idToken')}`,
          "GoogleAccessToken": localStorage.getItem('accessToken')
        },
        body: JSON.stringify(recipe),
      });

      if (!response.ok) {
        throw new Error('Failed to add recipe to group');
      }

      const addedRecipe = await response.json();
      setGroupRecipes((prev) => [...prev, addedRecipe]);
      setSnackbarMessage('Recipe added to group successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error adding recipe to group:', error);
      setSnackbarMessage('Failed to add recipe to group');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
    <Typography 
      variant="h4" 
      sx={{ 
        fontWeight: 'bold', 
        color: PURPLE, 
        textAlign: 'center', 
        marginBottom: 3 
      }}
    >
      Our Suggested Recipes
    </Typography>
    <List>
      {groupRecipes.map((recipe) => (
        <Accordion 
          key={recipe.recipeId} 
          sx={{ 
            marginBottom: 2, 
            borderRadius: 2, 
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' 
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />} 
            sx={{ 
              backgroundColor: LIGHT_PURPLE, 
              borderRadius: '8px 8px 0 0', 
              padding: '12px 16px' 
            }}
          >
            <Typography 
              sx={{ 
                fontWeight: 'bold', 
                fontSize: '1.2rem', 
                color: PURPLE 
              }}
            >
              {recipe.recipeName}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '16px' }}>
            <Typography 
              variant="body1" 
              color="textPrimary" 
              sx={{ marginBottom: 2 }}
            >
              <strong>Ingredients:</strong> {recipe.ingredients.join(', ')}
            </Typography>
            <Typography 
              variant="body1" 
              color="textPrimary" 
              sx={{ marginBottom: 2 }}
            >
              <strong>Instructions:</strong>
            </Typography>
            <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
              {recipe.instructions.map((instruction, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>
                  {instruction.step}
                </li>
              ))}
            </ul>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                alignItems: 'center', 
                marginTop: 2 
              }}
            >
              <IconButton
                sx={{ color: PURPLE }}
                onClick={() => handleFavoriteRecipe(recipe)}
                aria-label="Add to favorites"
              >
                <FavoriteIcon />
              </IconButton>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </List>
    <Snackbar 
      open={snackbarOpen} 
      autoHideDuration={6000} 
      onClose={() => setSnackbarOpen(false)}
    >
      <Alert 
        onClose={() => setSnackbarOpen(false)} 
        severity={snackbarSeverity} 
        sx={{ width: '100%' }}
      >
        {snackbarMessage}
      </Alert>
    </Snackbar>
  </Box>
  
  );
};

export default GroupRecipeSuggestion;