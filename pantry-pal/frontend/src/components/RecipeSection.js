// Example usage in a frontend component
import { useEffect, useState } from 'react';

export default function RecipeList() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetch('/api/recipes') // URL pointing to backend API
      .then((res) => res.json())
      .then((data) => setRecipes(data));
  }, []);

  return (
    <div>
      <h2>Recipes</h2>
      <ul>
        {recipes.map((recipe, index) => (
          <li key={index}>{recipe.name}</li>
        ))}
      </ul>
    </div>
  );
}
