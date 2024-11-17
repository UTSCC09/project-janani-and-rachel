import { useState } from "react";
import { Box, TextField, Button, Typography, Snackbar, Alert, Link, Paper } from "@mui/material";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase.js";

export default function Signup({ onSignInClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setSuccess("Signup successful!");
        setEmail("");
        setPassword("");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Paper elevation={6} sx={{ padding: 4, maxWidth: "400px", width: "100%" }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: "bold", color: "#7e91ff" }}>
          Sign Up
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
            Sign Up
          </Button>
        </Box>
        <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>
          Already have an account?{" "}
          <Link href="#" onClick={onSignInClick} sx={{ color: "#7e91ff", fontWeight: "bold" }}>
            Sign in
          </Link>
        </Typography>
      </Paper>
      <Snackbar open={!!error || !!success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} sx={{ width: '100%' }}>
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
}