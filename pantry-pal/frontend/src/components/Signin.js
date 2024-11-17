import { useState } from "react";
import { Box, TextField, Button, Typography, Snackbar, Alert, Link, Paper } from "@mui/material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";

export default function Signin({ onSignIn, onSignUpClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setSuccess("Sign in successful!");
      setEmail("");
      setPassword("");
      onSignIn();
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
          Welcome Back!
        </Typography>
        <Box component="form" onSubmit={handleSignIn} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
            Sign In
          </Button>
        </Box>
        <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>
          Don't have an account?{" "}
          <Link href="#" onClick={onSignUpClick} sx={{ color: "#7e91ff", fontWeight: "bold" }}>
            Sign up
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
// get the token
// store the token in local storaeg
// send the token in the header of every request
// if the token is not present, redirect to the signin page