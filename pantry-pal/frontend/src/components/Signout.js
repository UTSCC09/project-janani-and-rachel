import { Button } from "@mui/material";
import { signOuts } from "firebase/auth";
import { auth } from "../../config/firebase";

export default function Signout({ onSignout }) {
  const handleSignout = async () => {
    try {
      await signOut(auth);
      // Clear user session or token
      localStorage.removeItem("idToken"); // Remove the token from localStorage
      localStorage.removeItem("accessToken"); // Remove the access token from localStorage
      onSignout();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={handleSignout}
      sx={{ backgroundColor: "#f44336", "&:hover": { backgroundColor: "#d32f2f" } }}
    >
      Signout
    </Button>
  );
}

// on signout, clear the token
// use the firebase logout function
// on signout, redirect to the home page