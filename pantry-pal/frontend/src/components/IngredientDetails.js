import React from 'react';
import { Box, Typography } from "@mui/material";
import { FaRegCalendarAlt, FaRegCalendar, FaCheckCircle } from "react-icons/fa";

const PURPLE = "#7e91ff";

const IngredientDetails = ({ ingredient, formatDate }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          marginBottom: 1,
          color: "#ffffff",
          padding: "4px 8px",
          backgroundColor: "#7e91ff",
          width: "111%",
          borderRadius: 2,
          position: "relative",
          display: "inline-block",
        }}
      >
        {ingredient.ingredientName}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", marginBottom: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", marginBottom: 0.5 }}>
          <FaRegCalendarAlt
            style={{
              marginRight: "8px",
              fontSize: "16px",
              color: "#7e91ff",
            }}
          />
          <Typography variant="body2" sx={{ color: "#777" }}>
            Expiration: {formatDate(ingredient.expirationDate) || "N/A"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", marginBottom: 0.5 }}>
          <FaRegCalendar
            style={{
              marginRight: "8px",
              fontSize: "16px",
              color: "#7e91ff",
            }}
          />
          <Typography variant="body2" sx={{ color: "#777" }}>
            Purchased: {formatDate(ingredient.purchaseDate) || "N/A"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FaCheckCircle
            color={ingredient.frozen ? "#7e91ff" : "gray"}
            style={{ marginRight: "8px", fontSize: "16px" }}
          />
          <Typography
            variant="body2"
            sx={{ color: ingredient.frozen ? "#7e91ff" : "gray" }}
          >
            {ingredient.frozen ? "Frozen" : "Not Frozen"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default IngredientDetails;