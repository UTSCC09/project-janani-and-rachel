import { useState, useEffect } from "react";
import Head from "next/head";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
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
import GroupsSection from "@/components/GroupsSection";
import styles from "@/styles/Home.module.css";
import { auth } from "../../config/firebase"; // Adjust the import path as needed
import { jwtDecode } from "jwt-decode";

const isTokenExpired = (token) => {
    // token should always be true since that is how we are calling it. but this is just in case
  if (!token) return false; 

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds
    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

export default function Home() {
  const [activeSection, setActiveSection] = useState("signin");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("idToken");

      if (!token) {
        setActiveSection("signin");
      } else {
        if (isTokenExpired(token)) {
          setSessionExpired(true);
          setIsAuthenticated(false);
          setActiveSection("signin");
        }
      }
    };

    // Initial check
    checkTokenExpiration();

    // Set interval to check every 30 seconds (30000 milliseconds)
    const intervalId = setInterval(checkTokenExpiration, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleSignIn = () => {
    setIsAuthenticated(true);
    setActiveSection("recipes");
    setAnchorEl(null); // Ensure the dropdown menu is closed
  };

  const handleSignout = () => {
    auth.signOut().then(() => {
      setIsAuthenticated(false);
      setActiveSection("signin");
      setAnchorEl(null); // Ensure the dropdown menu is closed
      localStorage.removeItem("idToken");
      localStorage.removeItem("accessToken");
    });
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
  };

  return (
    <>
      <Head>
        <title>Pantry Pal</title>
        <meta name="description" content="Pantry management made easy!" />
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
        <Container maxWidth="lg" sx={{ padding: "0" }}>
          <Toolbar disableGutters sx={{ justifyContent: "space-between", padding: 0 }}>
            {/* Pantry Pal Logo */}
            <Box
              onClick={() => setActiveSection(isAuthenticated ? "recipes" : "signin")}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                flexGrow: 0, // Ensure it doesn't grow to take extra space
              }}
            >
              <img
                src="/pantry_pal-removebg-preview.png"
                alt="Logo"
                style={{
                  maxWidth: "85px",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
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
                  <MenuItem onClick={() => handleMenuClose("recipes")}>My Recipes</MenuItem>
                  <MenuItem onClick={() => handleMenuClose("ingredients")}>My Pantry</MenuItem>
                  <MenuItem onClick={() => handleMenuClose("shoppingList")}>Shopping List</MenuItem>
                  <MenuItem onClick={() => handleMenuClose("calendar")}>Meal Plan</MenuItem>
                  <MenuItem onClick={() => handleMenuClose("recipeSearch")}>Recipe Search</MenuItem>
                  <MenuItem onClick={() => handleMenuClose("groups")}>Groups</MenuItem>
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
            {activeSection === "recipes" && <RecipeSection />}
            {activeSection === "ingredients" && <IngredientsSection />}
            {activeSection === "shoppingList" && <ShoppingListSection />}
            {activeSection === "calendar" && <CalendarSection />}
            {activeSection === "groups" && <GroupsSection />}
            {activeSection === "recipeSearch" && <RecipeSearch />}
          </>
        ) : (
          <>
            {activeSection === "signup" && <Signup onSignInClick={() => setActiveSection("signin")} />}
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
        <Alert onClose={handleCloseSnackbar} severity="warning" sx={{ width: "100%" }}>
          Your session expired. Please log back in.
        </Alert>
      </Snackbar>
    </>
  );
}
