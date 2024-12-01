import React from 'react';
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { FaMinus } from "react-icons/fa";

const IngredientForm = ({
  ingredient,
  onChange,
  onSubmit,
  onCancel,
  formRef,
  isEditing,
}) => {
  return (
    <Box
      ref={formRef}
      component="form"
      onSubmit={onSubmit}
      sx={{
        backgroundColor: "#f9f9f9",
        padding: 2,
        borderRadius: 2,
        boxShadow: 2,
        marginTop: 2,
      }}
    >
      <TextField
        label="Ingredient Name"
        name="ingredientName"
        value={ingredient.ingredientName}
        onChange={onChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        type="date"
        label="Purchase Date"
        name="purchaseDate"
        value={ingredient.purchaseDate}
        onChange={onChange}
        fullWidth
        margin="normal"
        required
        slotProps={{
          inputLabel: {
            shrink: true,
          },
        }}
      />
      <TextField
        type="date"
        label="Expiration Date"
        name="expirationDate"
        value={ingredient.expirationDate}
        onChange={onChange}
        fullWidth
        margin="normal"
        slotProps={{
          inputLabel: {
            shrink: true,
          },
        }}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={ingredient.frozen}
            onChange={onChange}
            name="frozen"
            color="primary"
          />
        }
        label="Frozen"
        sx={{ marginBottom: 2 }}
      />
      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{
          padding: 1.5,
          backgroundColor: "#7e91ff",
          "&:hover": {
            backgroundColor: "#6b82e0",
          },
        }}
      >
        {isEditing ? "Update Ingredient" : "Add Ingredient"}
      </Button>
      {isEditing && (
        <Button
          variant="outlined"
          onClick={onCancel}
          startIcon={<FaMinus />}
          sx={{
            marginTop: 2,
            display: "block",
            width: "100%",
            textAlign: "center",
            fontSize: "0.9rem",
            color: "#7e91ff",
            borderColor: "#7e91ff",
            "&:hover": {
              backgroundColor: "#7e91ff",
              color: "#fff",
            },
          }}
        >
          Cancel
        </Button>
      )}
    </Box>
  );
};

export default IngredientForm;