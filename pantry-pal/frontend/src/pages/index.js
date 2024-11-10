import { useState } from "react";
import Head from "next/head";
import RecipeSection from "@/components/RecipeSection";
import IngredientsSection from "@/components/IngredientsSection";
import ShoppingListSection from "@/components/ShoppingListSection";
import CalendarSection from "@/components/CalendarSection";
import RecipeSearch from "@/components/RecipeSearch";
import { Menu, MenuItem, IconButton, Box } from "@mui/material";
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
        <title>Meal Planner</title>
        <meta name="description" content="Plan meals, track ingredients, and create shopping lists." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        {/* Navbar with Dropdown Menu in Top-Right Corner */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            padding: 2,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: 1,
            zIndex: 1000,
          }}
        >
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              backgroundColor: "transparent", // Ensure background is transparent
              color: "#2196f3", // Set the icon color to blue
              fontSize: 24,
              transition: "transform 0.3s ease",
              "&:hover": { backgroundColor: "rgba(33, 150, 243, 0.1)" },
              "&:active": { transform: "rotate(90deg)" },
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
              mt: 2,
              "& .MuiPaper-root": {
                borderRadius: "6px",
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
                minWidth: "160px",
                padding: "8px 0",
                animation: "fadeIn 0.3s ease",
              },
              "@keyframes fadeIn": {
                from: { opacity: 0, transform: "scale(0.9)" },
                to: { opacity: 1, transform: "scale(1)" },
              },
            }}
          >
            <MenuItem onClick={() => handleMenuClose("recipes")}>Recipes</MenuItem>
            <MenuItem onClick={() => handleMenuClose("ingredients")}>Ingredients</MenuItem>
            <MenuItem onClick={() => handleMenuClose("shoppingList")}>Shopping List</MenuItem>
            <MenuItem onClick={() => handleMenuClose("calendar")}>Calendar</MenuItem>
            <MenuItem onClick={() => handleMenuClose("recipeSearch")}>Search Recipes</MenuItem>
          </Menu>
        </Box>

        {/* Content Section */}
        <main className={styles.content}>
          {activeSection === "recipes" && <RecipeSection />}
          {activeSection === "ingredients" && <IngredientsSection />}
          {activeSection === "shoppingList" && <ShoppingListSection />}
          {activeSection === "calendar" && <CalendarSection />}
          {activeSection === "recipeSearch" && <RecipeSearch onSearch={() => {}} />}
        </main>
      </div>
    </>
  );
}
