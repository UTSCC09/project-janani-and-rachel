import { useState } from "react";

export default function IngredientsSection() {
  const [ingredients, setIngredients] = useState([
    { id: 1, name: "Tomatoes", available: true },
    { id: 2, name: "Chicken", available: false },
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
    </div>
  );
}
