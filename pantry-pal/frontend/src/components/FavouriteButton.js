// FavoriteButton.js
import React from "react";
import { IconButton } from "@mui/material";
import { FaStar, FaRegStar } from "react-icons/fa";

const FavoriteButton = ({ isFavorite, onClick }) => {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        color: isFavorite ? "#e4e642" : "gray",
        padding: "8px",
        transition: "color 0.3s ease",
        marginLeft: "auto", // Ensure the button is pushed to the right
      }}
    >
      {isFavorite ? <FaStar /> : <FaRegStar />}
    </IconButton>
  );
};

export default FavoriteButton;