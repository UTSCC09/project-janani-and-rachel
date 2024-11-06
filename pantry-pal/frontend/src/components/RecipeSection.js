// Example usage in a frontend component
import { useEffect, useState } from 'react';

// let the user find recipes they can make given the ingredients they currently have
// this component will display a list of recipes
// the list of recipes will be fetched from the backend API
// the backend API will return a list of recipes
// we need to get the current ingredients the user has
const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

export default function RecipeList() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetch(`${domain}/api/recipes`) // get the user' s recipes and display them
      .then((res) => res.json())
      .then((data) => setRecipes(data));
      // log the response
      console.log(recipes);
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
