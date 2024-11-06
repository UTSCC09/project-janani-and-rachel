import { useState } from "react";
import RecipeSuggestion from "@/components/RecipeSuggestion"; // Import the RecipeSuggestion component

export default function IngredientsSection() {
  const [ingredients, setIngredients] = useState([
    { id: 1, name: "Tomatoes", available: true },
    { id: 2, name: "Chicken", available: false },
    { id: 3, name: "Lettuce", available: true }, // Add more sample ingredients
    { id: 4, name: "Onions", available: true },
  ]);

  return (
    <div>
      <h2>Ingredients</h2>
      <ul>
        {ingredients.map((ingredient) => (
          <li key={ingredient.id}>
            {ingredient.name} - {ingredient.available ? "Available" : "Not Available"}
          </li>
        ))}
      </ul>

      {/* Pass ingredients to RecipeSuggestion */}
      <RecipeSuggestion ingredients={ingredients} />
    </div>
  );
}
