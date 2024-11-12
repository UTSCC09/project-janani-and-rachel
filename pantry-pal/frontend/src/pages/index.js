import { useState } from "react";
import Head from "next/head";
import RecipeSection from "@/components/RecipeSection";
import IngredientsSection from "@/components/IngredientsSection";
import ShoppingListSection from "@/components/ShoppingListSection";
import CalendarSection from "@/components/CalendarSection";
import RecipeSearch from "@/components/RecipeSearch";
import { Menu, MenuItem, IconButton, AppBar, Toolbar, Typography, Container, Box } from "@mui/material";
import { FaBars } from "react-icons/fa";
import styles from "@/styles/Home.module.css";

export default function Home() {
  const [activeSection, setActiveSection] = useState("recipes");
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (section) => {
    setActiveSection(section);
    setAnchorEl(null);
  };

  return (
    <>
      <Head>
        <title>Pantry Pal</title>
        <meta name="description" content="Plan meals, track ingredients, and create shopping lists." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Top Navigation Bar */}
      <AppBar
        position="fixed"
        sx={{
          background: "linear-gradient(135deg, #cce7ff 30%, #e6f2ff 90%)",
          color: "#444444",
          boxShadow: "none",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: "space-between", padding: "0 1rem" }}>
            {/* Make the Pantry Pal logo clickable */}
            <Box
              onClick={() => setActiveSection("recipes")}
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
                  color: "#1a237e"
                }}
              >
                Pantry Pal
              </Typography>
            </Box>
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                color: "#1a237e",
                fontSize: "1.5rem",
                "&:hover": { backgroundColor: "rgba(26, 35, 126, 0.1)" },
              }}
            >
              <FaBars />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              sx={{
                mt: 1.5,
                "& .MuiPaper-root": {
                  borderRadius: "8px",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
                  minWidth: "180px",
                },
              }}
            >
              <MenuItem onClick={() => handleMenuClose("recipes")}>Favorite Recipes</MenuItem>
              <MenuItem onClick={() => handleMenuClose("ingredients")}>Ingredients</MenuItem>
              <MenuItem onClick={() => handleMenuClose("shoppingList")}>Shopping List</MenuItem>
              <MenuItem onClick={() => handleMenuClose("calendar")}>Calendar</MenuItem>
              <MenuItem onClick={() => handleMenuClose("recipeSearch")}>Search Recipes</MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Content Section with Padding to Prevent Overlap */}
      <Box
        component="main"
        className={styles.content}
        sx={{
          paddingTop: "100px",
          paddingX: { xs: 2, sm: 4, lg: 8 },
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {activeSection === "recipes" && <RecipeSection />}
        {activeSection === "ingredients" && <IngredientsSection />}
        {activeSection === "shoppingList" && <ShoppingListSection />}
        {activeSection === "calendar" && <CalendarSection />}
        {activeSection === "recipeSearch" && <RecipeSearch onSearch={() => {}} />}
      </Box>
    </>
  );
}
