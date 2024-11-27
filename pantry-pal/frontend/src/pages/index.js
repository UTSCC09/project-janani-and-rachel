import { useState, useEffect } from "react";
import Head from "next/head";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Signup from "@/components/Signup";
import Signin from "@/components/Signin";
import IngredientsSection from "@/components/IngredientsSection";
import RecipeSection from "@/components/RecipeSection";
import ShoppingListSection from "@/components/ShoppingListSection";
import CalendarSection from "@/components/CalendarSection";
import RecipeSearch from "@/components/RecipeSearch";
import styles from "@/styles/Home.module.css";
import { auth } from "../../config/firebase"; // Adjust the import path as needed
import { GoogleAuthProvider } from "firebase/auth";

export default function Home() {
  const [activeSection, setActiveSection] = useState("signin");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    // Check if the token is present in localStorage
    const idToken = localStorage.getItem("idToken");
    if (idToken) {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const idToken = await user.getIdToken(true); // Force refresh the token
            localStorage.setItem("idToken", idToken);
            setIsAuthenticated(true);
            setActiveSection("recipes"); // Set the default section for authenticated users
          } catch (error) {
            console.error("Error getting ID token:", error);
            setSessionExpired(true); // Show Snackbar if there's an error getting the new token
          }
        } else {
          setSessionExpired(true); // Show Snackbar if the user is not authenticated
        }
      });
    }

    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken(true); // Force refresh the token
          localStorage.setItem("idToken", idToken);
        } catch (error) {
          console.error("Error getting ID token:", error);
          setSessionExpired(true); // Show Snackbar if there's an error getting the new token
        }
      } else {
        setSessionExpired(true); // Show Snackbar if the user is not authenticated
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = () => {
    setIsAuthenticated(true);
    setActiveSection("recipes");
    setAnchorEl(null); // Ensure the dropdown menu is closed
  };

  const handleSignout = () => {
    setIsAuthenticated(false);
    setActiveSection("signin");
    setAnchorEl(null); // Ensure the dropdown menu is closed
    localStorage.removeItem("idToken");
    localStorage.removeItem("accessToken");
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (section) => {
    setActiveSection(section);
    setAnchorEl(null);
  };

  const handleCloseSnackbar = () => {
    setSessionExpired(false);
    handleSignout();
  };

  return (
    <>
      <Head>
        <title>Pantry Pal</title>
        <meta
          name="description"
          content="Plan meals, track ingredients, and create shopping lists."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Top Navigation Bar */}
      <AppBar
        position="fixed"
        sx={{
          background: "linear-gradient(135deg, #fdfabf 30%, #f6f7ef 90%)",
          color: "#444444",
          boxShadow: "none",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: "space-between", padding: "0 1rem" }}>
            {/* Pantry Pal Logo */}
            <Box
              onClick={() => setActiveSection(isAuthenticated ? "recipes" : "signin")}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1.4rem", sm: "1.6rem" },
                  color: "#7e91ff",
                }}
              >
                Pantry Pal
              </Typography>
            </Box>

            {/* Hamburger Menu - Only visible if authenticated */}
            {isAuthenticated && (
              <>
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMenuOpen}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem onClick={() => handleMenuClose("recipes")}>Recipes</MenuItem>
                  <MenuItem onClick={() => handleMenuClose("ingredients")}>My Pantry</MenuItem>
                  <MenuItem onClick={() => handleMenuClose("shoppingList")}>Shopping List</MenuItem>
                  <MenuItem onClick={() => handleMenuClose("calendar")}>My Meal Plans</MenuItem>
                  <MenuItem onClick={() => handleMenuClose("recipeSearch")}>Recipe Search</MenuItem>
                  <MenuItem onClick={handleSignout}>Sign Out</MenuItem>
                </Menu>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        className={styles.content}
        sx={{
          paddingTop: "100px",
          paddingX: { xs: 1, sm: 3, md: 6 },
          maxWidth: "100%",
          width: { xs: "100%", sm: "90%", md: "80%" },
          margin: "0 auto",
          overflowX: "hidden",
        }}
      >
        {isAuthenticated ? (
          <>
            {activeSection === "recipes" && <RecipeSection onSignOut={handleSignout} />}
            {activeSection === "ingredients" && <IngredientsSection />}
            {activeSection === "shoppingList" && <ShoppingListSection />}
            {activeSection === "calendar" && <CalendarSection />}
            {activeSection === "recipeSearch" && <RecipeSearch onSearch={() => {}} />}
          </>
        ) : (
          <>
            {activeSection === "signup" && <Signup onSignInClick={() => setActiveSection("signin")} onRecipeSectionClick={() => { setActiveSection("recipes"); setIsAuthenticated(true); }} />}
            {activeSection === "signin" && <Signin onSignIn={handleSignIn} onSignUpClick={() => setActiveSection("signup")} />}
          </>
        )}
      </Box>

      {/* Snackbar for session expiration */}
      <Snackbar
        open={sessionExpired}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="warning" sx={{ width: '100%' }}>
          Your session expired. Please log out and log back in.
        </Alert>
      </Snackbar>
    </>
  );
}