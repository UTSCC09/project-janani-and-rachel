import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../config/firebase"; 

export default function ResetPassword({ setActiveSection }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleResetPassword = async (event) => {
    event.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent!");
      setEmail("");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleBackToSignIn = () => {
    setActiveSection("signin");
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Box
        sx={{
          padding: 4,
          maxWidth: "400px",
          width: "100%",
          backgroundColor: "white",
          borderRadius: 2,
        }}
      >
        <IconButton onClick={handleBackToSignIn} sx={{ marginBottom: 2 }}>
          <ArrowBackIcon sx={{ color: "#7e91ff" }} />
        </IconButton>
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ fontWeight: "bold", color: "#7e91ff" }}
        >
          Reset Password
        </Typography>
        <Box
          component="form"
          onSubmit={handleResetPassword}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "#7e91ff",
              "&:hover": { backgroundColor: "#6b82e0" },
            }}
          >
            Send Reset Link
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
}
