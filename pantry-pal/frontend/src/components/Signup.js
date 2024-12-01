import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Link,
  Paper,
  Divider,
} from "@mui/material";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../config/firebase.js";

export default function Signup({ onSignInClick, onRecipeSectionClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await sendEmailVerification(user);
      setSuccess(
        "Signup successful! Please check your email to verify your account."
      );
      setEmail("");
      setPassword("");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/tasks");
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
      onRecipeSectionClick(); // Change the active section to RecipeSection
    } catch (error) {
      setError(error.message);
    }
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
        height: "100vh",
      }}
    >
      <Paper
        elevation={6}
        sx={{ padding: 4, maxWidth: "400px", width: "100%" }}
      >
        <Button
          variant="outlined"
          onClick={handleGoogleSignIn} // Trigger Google sign-in on click
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            marginBottom: 2,
            backgroundColor: "#fff",
            color: "#000",
            borderColor: "#ccc",
            "&:hover": {
              backgroundColor: "#f5f5f5",
              borderColor: "#bbb",
            },
          }}
        >
          Sign up with
          <img
            src="https://hackaday.com/wp-content/uploads/2016/08/google-g-logo.png"
            alt="Google logo"
            style={{ width: "20px", height: "20px", marginLeft: "8px" }}
          />
        </Button>
        <Divider sx={{ marginY: 2 }}>Or</Divider>
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ fontWeight: "bold", color: "#7e91ff" }}
        >
          Sign Up
        </Typography>
        <Box
          component="form"
          onSubmit={handleSignup}
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
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            Sign Up
          </Button>
        </Box>
        <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>
          Already have an account?{" "}
          <Link
            href="#"
            onClick={onSignInClick}
            sx={{ color: "#7e91ff", fontWeight: "bold" }}
          >
            Sign in
          </Link>
        </Typography>
      </Paper>
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
