// DeleteButton.js
import React from "react";
import { Button, IconButton } from "@mui/material";
import { FaTrashAlt } from "react-icons/fa";

const DeleteButton = ({ onClick }) => {
  return (
    <IconButton
      color="error"
      onClick={onClick}
      sx={{
        padding: "8px",
        border: "none",
        textTransform: "none",
        color: "#f44336",
        "&:hover": {
          backgroundColor: "rgba(244, 67, 54, 0.15)", // Subtle red hover background
          transform: "scale(1.1)", // Slightly scale up the icon
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Add subtle shadow
        },
      }}
    >
      <FaTrashAlt size={20} />
    </IconButton>
  );
};

export default DeleteButton;

