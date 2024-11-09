import { useEffect, useState } from 'react';

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

export default function RecipeList() {
  const [recipes, setRecipes] = useState({});
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   fetch(`${domain}/api/recipes/favorites`) // Fetch the user's favorite recipes
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setRecipes(data);
  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching recipes:", error);
  //       setLoading(false);
  //     });
  // }, []);

  // const handleDelete = (recipeId) => {
  //   fetch(`${domain}/api/recipes/${recipeId}`, {
  //     method: 'DELETE',
  //   })
  //     .then((res) => {
  //       if (res.status === 204) {
  //         setRecipes((prevRecipes) => {
  //           const newRecipes = { ...prevRecipes };
  //           delete newRecipes[recipeId];
  //           return newRecipes;
  //         });
  //       } else {
  //         console.error("Error deleting recipe:", res.status);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error deleting recipe:", error);
  //     });
  // };

  return (
    <div>
      <h2>Favorite Recipes</h2>
      {loading ? (
        <p>Loading recipes...</p>
      ) : (
        <ul>
          {Object.entries(recipes).map(([id, recipe]) => (
            <li key={id} style={{ marginBottom: "1em" }}>
              <h3>{recipe.name}</h3>
              {recipe.date && <p><strong>Date:</strong> {new Date(recipe.date).toLocaleDateString()}</p>}
              <button onClick={() => handleDelete(id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}