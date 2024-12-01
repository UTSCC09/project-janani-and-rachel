import React from "react";
import { Box, Typography } from "@mui/material";
import { FaRegCalendarAlt, FaRegCalendar, FaCheckCircle } from "react-icons/fa";

const PURPLE = "#7e91ff";

const IngredientDetails = ({ ingredient, formatDate }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box
        sx={{
          backgroundColor: PURPLE,
          padding: "4px 8px",
          borderRadius: 2,
          marginBottom: 1,
          width: "calc(100% - 16px)", // Adjust width to end before the card
          marginLeft: "8px", // Center the highlight
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "#ffffff",
          }}
          dangerouslySetInnerHTML={{ __html: ingredient.ingredientName }}
        >
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", marginBottom: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", marginBottom: 0.5 }}>
          <FaRegCalendarAlt
            style={{
              marginRight: "8px",
              fontSize: "16px",
              color: PURPLE,
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
              color: PURPLE,
            }}
          />
          <Typography variant="body2" sx={{ color: "#777" }}>
            Purchased: {formatDate(ingredient.purchaseDate) || "N/A"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FaCheckCircle
            color={ingredient.frozen ? PURPLE : "gray"}
            style={{ marginRight: "8px", fontSize: "16px" }}
          />
          <Typography
            variant="body2"
            sx={{ color: ingredient.frozen ? PURPLE : "gray" }}
          >
            {ingredient.frozen ? "Frozen" : "Not Frozen"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default IngredientDetails;
