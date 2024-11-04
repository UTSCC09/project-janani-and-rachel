import { useState } from "react";

export default function RecipeSection() {
  const [recipes, setRecipes] = useState([
    { id: 1, name: "Spaghetti Bolognese" },
    { id: 2, name: "Chicken Curry" },
  ]);

  return (
    <div>
      <h2>Recipes</h2>
      <ul>
        {recipes.map((recipe) => (
          <li key={recipe.id}>{recipe.name}</li>
        ))}
      </ul>
    </div>
  );
}
