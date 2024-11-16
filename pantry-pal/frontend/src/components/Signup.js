import { useState } from "react";
import { Box, TextField, Button, Typography, Snackbar, Alert } from "@mui/material";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        console.log("Signup successful!");
        setSuccess("Signup successful!");
        setEmail("");
        setPassword("");
      } else {
        throw new Error("Signup failed.");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Box sx={{ padding: 3, maxWidth: "400px", margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: "bold", color: "#7e91ff" }}>
        Signup
      </Typography>
      <Box component="form" onSubmit={handleSignup} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
        />
        <Button type="submit" variant="contained" sx={{ backgroundColor: "#7e91ff", "&:hover": { backgroundColor: "#6b82e0" } }}>
          Signup
        </Button>
      </Box>
      <Snackbar open={!!error || !!success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} sx={{ width: '100%' }}>
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
}