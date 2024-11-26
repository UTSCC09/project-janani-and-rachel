import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, List, ListItem, IconButton, CircularProgress, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteButton from './DeleteButton';

const PURPLE = "#7e91ff";
const YELLOW = "#fffae1";

const MealPlanCard = ({ mealPlan, index, expanded, handleToggle, handleDelete }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [aiSplit, setAiSplit] = useState(null);

  // Parse the date string and convert to UTC
  const date = new Date(mealPlan.date);
  const formattedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString();

  const handlePantryComparison = () => {
    setLoading(true);
    fetch(`${domain}/api/recipes/favorites/${mealPlan.recipe.recipeId}/pantry-comparison`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("idToken")}`,
        "GoogleAccessToken": localStorage.getItem('accessToken')
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('AI Pantry split:', data);
        setAiSplit({
          inPantry: data.matchingIngredients || [],
          notInPantry: data.missingIngredients || [],
        });
        setOpen(true);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error with pantry comparison:', error);
        setLoading(false);
      });
  };

  const handleClose = () => {
    setOpen(false);
    setAiSplit(null);
  };

  return (
    <Card
      sx={{
        borderRadius: "16px",
        boxShadow: 3,
        backgroundColor: YELLOW,
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        marginBottom: "1.5rem",
        position: "relative",
        width: "90%",
        left: "2%",
        marginTop: "1rem",
      }}
    >
      <CardContent>
        <Box
          sx={{
            backgroundColor: PURPLE,
            padding: "8px 16px",
            borderRadius: "8px",
            width: "95%",
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "600", color: "#fff", textAlign: "center" }}
          >
            {mealPlan.recipe.recipeName}
          </Typography>
          <Box>
            <IconButton onClick={() => handleToggle(index)} sx={{ color: "#fff" }}>
              {expanded[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            <Tooltip title="Delete Meal Plan" arrow>
              <DeleteButton onClick={() => handleDelete(mealPlan.id)} />
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ marginBottom: "1.5rem" }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: "500", color: PURPLE, marginBottom: "0.5rem" }}
          >
            <strong>Planned On:</strong> {formattedDate}
          </Typography>
        </Box>

        {expanded[index] && (
          <>
            <Box
              sx={{
                marginBottom: "1rem",
                backgroundColor: "#fff", // White background for the box
                padding: "1rem",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "500", color: PURPLE, marginBottom: "0.5rem" }}
              >
                <strong>Instructions:</strong>
              </Typography>
              {mealPlan.recipe.instructions.map((instruction, idx) => (
                <Typography key={idx} variant="body2" sx={{ color: "#000000" }}>
                  {instruction.number}. {instruction.step}
                </Typography>
              ))}
            </Box>

            <Box
              sx={{
                marginBottom: "1rem",
                backgroundColor: "#fff", // White background for the box
                padding: "1rem",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "500", color: PURPLE, marginBottom: "0.5rem" }}
              >
                <strong>Pantry Ingredients:</strong>
              </Typography>
              <List>
                {mealPlan.pantryIngredients.map((ingredient, idx) => (
                  <ListItem key={idx} sx={{ padding: "0.25rem 0" }}>
                    <Typography variant="body2" sx={{ color: "#000000" }}>
                      {ingredient}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box
              sx={{
                marginBottom: "1rem",
                backgroundColor: "#fff", // White background for the box
                padding: "1rem",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "500", color: PURPLE, marginBottom: "0.5rem" }}
              >
                <strong>Shopping List Ingredients:</strong>
              </Typography>
              <List>
                {mealPlan.shoppingListIngredients.map((ingredient, idx) => (
                  <ListItem key={idx} sx={{ padding: "0.25rem 0" }}>
                    <Typography variant="body2" sx={{ color: "#000000" }}>
                      {ingredient}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
        )}
      </CardContent>

      <Box
        sx={{
          position: "absolute",
          bottom: "16px",
          right: "16px",
          display: "flex",
          gap: "8px",
        }}
      >
        <Tooltip title="Pantry Comparison" arrow>
          <IconButton color="primary" onClick={handlePantryComparison}>
            {loading ? <CircularProgress size={24} /> : <ExpandMoreIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Pantry Comparison Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Pantry Comparison</DialogTitle>
        <DialogContent>
          {aiSplit && (
            <>
              <Typography variant="h6" sx={{ fontWeight: "600", color: PURPLE }}>
                In Pantry
              </Typography>
              <List>
                {aiSplit.inPantry.map((ingredient, index) => (
                  <ListItem key={index}>{ingredient}</ListItem>
                ))}
              </List>
              <Typography variant="h6" sx={{ fontWeight: "600", color: PURPLE }}>
                Not in Pantry
              </Typography>
              <List>
                {aiSplit.notInPantry.map((ingredient, index) => (
                  <ListItem key={index}>{ingredient}</ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default MealPlanCard;