import { useState } from "react";
import { Box, TextField, Button, Typography, Snackbar, Alert, Link, Paper, Divider } from "@mui/material";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../config/firebase"; // Adjust the import path as needed

export default function Signin({ onSignIn, onSignUpClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      // save the token to local storage
      localStorage.setItem("idToken", idToken);
      setSuccess("Sign in successful!");
      setEmail("");
      setPassword("");
      onSignIn();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      // save the token to local storage
      localStorage.setItem("idToken", idToken);

      // Get the OAuth 2.0 access token to access Google APIs
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;

      // save the access token to local storage to use google api tools
      localStorage.setItem("accessToken", accessToken);

      setSuccess("Sign in with Google successful!");
      onSignIn();
    } catch (error) {
      setError(error.message);
    }
  };

  const onForgotPasswordClick = () => {
    // Handle forgot password logic here
    console.log("Forgot password clicked");
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
          <Typography variant="body2" align="right" sx={{ marginTop: 1 }}>
          <Link href="#" onClick={onForgotPasswordClick} sx={{ color: "#7e91ff" }}>
            Forgot your password?
          </Link>
        </Typography>
        </Box>
        <Divider sx={{ marginY: 2 }}>Or Sign In/Up With</Divider>
      <Box display="flex" justifyContent="center" alignItems="center">
        <Button
          onClick={handleGoogleSignIn}
          sx={{ padding: 0, minWidth: 'auto', backgroundColor: "transparent", "&:hover": { backgroundColor: "transparent" } }}
        >
          <img src="https://hackaday.com/wp-content/uploads/2016/08/google-g-logo.png" alt="Sign In with Google" style={{ width: '24px', height: '24px' }} />
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