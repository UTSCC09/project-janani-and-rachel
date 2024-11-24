import React from 'react';
import { Button } from "@mui/material";

const PurpleButton = ({ children, onClick, startIcon, ...props }) => {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      startIcon={startIcon}
      sx={{
        marginBottom: 2,
        display: "block",
        width: "100%",
        textAlign: "center",
        fontSize: "1.1rem",
        color: "#7e91ff",
        borderColor: "#7e91ff",
        "&:hover": {
          backgroundColor: "#7e91ff",
          color: "#fff",
        },
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default PurpleButton;