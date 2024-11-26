import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, List, ListItem, IconButton, CircularProgress, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteButton from './DeleteButton';

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;


const PURPLE = "#7e91ff";
const YELLOW = "#fffae1";

const MealPlanCard = ({ mealPlan, index, expanded, handleToggle, handleDelete }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [aiSplit, setAiSplit] = useState(null);

  // Parse the date string and convert to UTC
  const date = new Date(mealPlan.date);
  const formattedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString();

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
        transition: "transform 0.3s ease-in-out", // Smooth transition for hover effect
        "&:hover": {
          transform: "scale(1.02)", // Zoom out effect on hover
        },
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
    </Card>
  );
};

export default MealPlanCard;