import { useState } from "react";
import { Box, TextField, Button, Typography, Snackbar, Alert, Link, Paper } from "@mui/material";
import { signInWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
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

      // save the access token to local storage to use google api tools
      setSuccess("Sign in with Google successful!");
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
        <Button
          variant="contained"
          color="primary"
          onClick={handleGoogleSignIn}
          sx={{ marginTop: 2, backgroundColor: "#db4437", "&:hover": { backgroundColor: "#c23321" } }}
        >
          Sign In with Google
        </Button>
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