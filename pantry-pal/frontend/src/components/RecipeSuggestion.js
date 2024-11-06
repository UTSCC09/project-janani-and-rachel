import { useState } from "react";

export default function RecipeSuggestion({ ingredients }) {
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [showRecipes, setShowRecipes] = useState(false);

  // Sample list of recipes
  const allRecipes = [
    { id: 1, name: "Tomato Soup", ingredients: ["Tomatoes", "Onions", "Salt"] },
    { id: 2, name: "Chicken Salad", ingredients: ["Chicken", "Lettuce", "Tomatoes"] },
    { id: 3, name: "Chicken Soup", ingredients: ["Chicken", "Onions", "Salt"] },
    { id: 4, name: "Grilled Chicken", ingredients: ["Chicken", "Garlic", "Olive Oil"] },
  ];

  // Function to check if the recipe can be made with the available ingredients
  const canMakeRecipe = (recipeIngredients) => {
    return recipeIngredients.every((ingredient) =>
      ingredients.some((ing) => ing.name === ingredient && ing.available)
    );
  };

  const findSuggestedRecipes = () => {
    const filteredRecipes = allRecipes.filter((recipe) =>
      canMakeRecipe(recipe.ingredients)
    );
    setSuggestedRecipes(filteredRecipes);
    setShowRecipes(true);
  };

  return (
    <div>
      <button onClick={findSuggestedRecipes}>Find Suggested Recipes</button>

      {showRecipes && (
        <div>
          <h3>Suggested Recipes</h3>
          {suggestedRecipes.length > 0 ? (
            <ul>
              {suggestedRecipes.map((recipe) => (
                <li key={recipe.id}>{recipe.name}</li>
              ))}
            </ul>
          ) : (
            <p>No recipes can be made with the available ingredients.</p>
          )}
        </div>
      )}
    </div>
  );
}
