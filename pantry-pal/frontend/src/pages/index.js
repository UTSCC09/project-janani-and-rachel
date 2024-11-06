import { useState } from "react";
import Head from "next/head";
import RecipeSection from "@/components/RecipeSection";
import IngredientsSection from "@/components/IngredientsSection";
import ShoppingListSection from "@/components/ShoppingListSection";
import CalendarSection from "@/components/CalendarSection";
import RecipeSearch from "@/components/RecipeSearch"; // Import the RecipeSearch component
import styles from "@/styles/Home.module.css";

export default function Home() {
  const [activeSection, setActiveSection] = useState("recipes");

  return (
    <>
      <Head>
        <title>Meal Planner</title>
        <meta name="description" content="Plan meals, track ingredients, and create shopping lists." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <nav className={styles.nav}>
          <button onClick={() => setActiveSection("recipes")}>Recipes</button>
          <button onClick={() => setActiveSection("ingredients")}>Ingredients</button>
          <button onClick={() => setActiveSection("shoppingList")}>Shopping List</button>
          <button onClick={() => setActiveSection("calendar")}>Calendar</button>
          <button onClick={() => setActiveSection("recipeSearch")}>Search Recipes</button> {/* New Button for Recipe Search */}
        </nav>

        <main className={styles.content}>
          {activeSection === "recipes" && <RecipeSection />}
          {activeSection === "ingredients" && <IngredientsSection />}
          {activeSection === "shoppingList" && <ShoppingListSection />}
          {activeSection === "calendar" && <CalendarSection />}
          {activeSection === "recipeSearch" && <RecipeSearch onSearch={() => {}} />} {/* Show RecipeSearch when selected */}
        </main>
      </div>
    </>
  );
}
