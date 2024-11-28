import React from 'react';
import { Box } from "@mui/material";
import EditButton from "./EditButton";
import DeleteButton from "./DeleteButton";

const IngredientActions = ({ onEdit, onDelete }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <EditButton onClick={onEdit} />
      <DeleteButton onClick={onDelete} />
    </Box>
  );
};

export default IngredientActions;