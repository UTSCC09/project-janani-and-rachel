import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  Checkbox,
  CircularProgress,
  Paper,
  Card,
  Tooltip,
} from "@mui/material";
import StyledTitle from "./StyledTitle";

const PURPLE = "#7e91ff";
const YELLOW = "#fffae1";

export default function CalendarSection() {
  const [ingredients, setIngredients] = useState([
    { name: "Apple", inPantry: false },
    { name: "Banana", inPantry: true },
    { name: "Carrot", inPantry: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [aiSplit, setAiSplit] = useState(null);
  const [manualSplit, setManualSplit] = useState(false);

  const handlePantryComparison = () => {
    setLoading(true);
    // Simulate AI call
    setTimeout(() => {
      setAiSplit({
        inPantry: ingredients.filter((ingredient) => ingredient.inPantry),
        notInPantry: ingredients.filter((ingredient) => !ingredient.inPantry),
      });
      setLoading(false);
    }, 1000);
  };

  const handleAddToPantry = () => {
    // Send request to add ingredients to pantry
    console.log("Adding to pantry:", aiSplit);
  };

  const handleManualSplit = () => {
    setManualSplit(true);
  };

  const handleManualAddToPantry = () => {
    const inPantry = ingredients.filter((ingredient) => ingredient.inPantry);
    const notInPantry = ingredients.filter((ingredient) => !ingredient.inPantry);
    console.log("Manually adding to pantry:", { inPantry, notInPantry });
  };

  const handleCheckboxChange = (index) => {
    setIngredients((prev) =>
      prev.map((ingredient, i) =>
        i === index ? { ...ingredient, inPantry: !ingredient.inPantry } : ingredient
      )
    );
  };

  return (
    <Box sx={{ padding: "2rem", maxWidth: 800, margin: "auto" }}>
      <StyledTitle>My Planned Meals</StyledTitle>

      <Typography variant="h6" sx={{ marginBottom: "1rem", fontWeight: 600, color: PURPLE }}>
        Meal Planning
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={handlePantryComparison}
        sx={{
          backgroundColor: PURPLE,
          "&:hover": { backgroundColor: "#6b82e0" },
          marginBottom: "1rem",
        }}
      >
        Compare with Pantry (AI)
      </Button>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <CircularProgress />
        </Box>
      )}

      {aiSplit && (
        <Paper
          elevation={3}
          sx={{
            padding: "1rem",
            marginBottom: "1.5rem",
            backgroundColor: YELLOW,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: PURPLE }}>
            AI Split
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PURPLE }}>
            In Pantry
          </Typography>
          <List>
            {aiSplit.inPantry.map((ingredient, index) => (
              <ListItem key={index}>{ingredient.name}</ListItem>
            ))}
          </List>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PURPLE }}>
            Not in Pantry
          </Typography>
          <List>
            {aiSplit.notInPantry.map((ingredient, index) => (
              <ListItem key={index}>{ingredient.name}</ListItem>
            ))}
          </List>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddToPantry}
            sx={{
              backgroundColor: PURPLE,
              "&:hover": { backgroundColor: "#6b82e0" },
              marginTop: "1rem",
            }}
          >
            Add to Pantry
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleManualSplit}
            sx={{
              borderColor: PURPLE,
              color: PURPLE,
              "&:hover": { backgroundColor: "#6b82e0", color: "#fff" },
              marginTop: "1rem",
              marginLeft: "1rem",
            }}
          >
            Add Manually
          </Button>
        </Paper>
      )}

      {manualSplit && (
        <Paper
          elevation={3}
          sx={{
            padding: "1rem",
            marginBottom: "1.5rem",
            backgroundColor: YELLOW,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: PURPLE }}>
            Manual Split
          </Typography>
          <List>
            {ingredients.map((ingredient, index) => (
              <ListItem key={index}>
                <Checkbox
                  checked={ingredient.inPantry}
                  onChange={() => handleCheckboxChange(index)}
                />
                {ingredient.name}
              </ListItem>
            ))}
          </List>
          <Button
            variant="contained"
            color="primary"
            onClick={handleManualAddToPantry}
            sx={{
              backgroundColor: PURPLE,
              "&:hover": { backgroundColor: "#6b82e0" },
              marginTop: "1rem",
            }}
          >
            Add to Pantry
          </Button>
        </Paper>
      )}
    </Box>
  );
}