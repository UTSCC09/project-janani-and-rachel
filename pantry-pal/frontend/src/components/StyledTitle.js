import React from 'react';
import { Typography, Box } from '@mui/material';

const StyledTitle = ({ children }) => {
  return (
    <Box
      sx={{
        marginBottom: 6,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
      }}
    >
      <Typography
        variant="h2"
        component="div"
        sx={{
          fontWeight: "bold",
          fontSize: "3rem",
          color: "#7e91ff",
          textAlign: "center",
          letterSpacing: "1px",
          lineHeight: 1.2,
          textShadow: "2px 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        {children}
      </Typography>
    </Box>
  );
};

export default StyledTitle;