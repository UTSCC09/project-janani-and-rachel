import { useEffect, useState } from 'react';

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

export default function RecipeList() {
  const [allRecipes, setAllRecipes] = useState([]);
  const [plannedRecipes, setPlannedRecipes] = useState([]);
  const [unplannedRecipes, setUnplannedRecipes] = useState([]);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingUnplanned, setLoadingUnplanned] = useState(true);
  const [searchRecipeId, setSearchRecipeId] = useState("");
  const [searchedRecipe, setSearchedRecipe] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    // Fetch all favorite recipes
    fetch(`${domain}/api/recipes/favorites`)
      .then((res) => res.json())
      .then((data) => {
        const recipes = data.recipes || [];
        setAllRecipes(recipes);
        setPlannedRecipes(recipes.filter((recipe) => recipe.planned));
        setLoadingAll(false);
      })
      .catch((error) => {
        console.error("Error fetching all recipes:", error);
        setLoadingAll(false);
      });

    // Fetch unplanned recipes
    fetch(`${domain}/api/recipes/favorites/unplanned`)
      .then((res) => res.json())
      .then((data) => {
        setUnplannedRecipes(data || []);
        setLoadingUnplanned(false);
      })
      .catch((error) => {
        console.error("Error fetching unplanned recipes:", error);
        setLoadingUnplanned(false);
      });
  }, []);

  const handleDelete = (recipeId) => {
    fetch(`${domain}/api/recipes/${recipeId}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (res.status === 204) {
          setAllRecipes((prevRecipes) =>
            prevRecipes.filter((recipe) => recipe.recipeId !== recipeId)
          );
          setPlannedRecipes((prevRecipes) =>
            prevRecipes.filter((recipe) => recipe.recipeId !== recipeId)
          );
          setUnplannedRecipes((prevRecipes) =>
            prevRecipes.filter((recipe) => recipe.recipeId !== recipeId)
          );
          setSearchedRecipe(null);
        } else {
          console.error("Error deleting recipe:", res.status);
        }
      })
      .catch((error) => {
        console.error("Error deleting recipe:", error);
      });
  };

  const handleSearchRecipe = () => {
    if (!searchRecipeId) return;
    setLoadingSearch(true);
    fetch(`${domain}/api/recipes/favorites/${searchRecipeId}`)
      .then((res) => res.json())
      .then((data) => {
        setSearchedRecipe(data);
        setLoadingSearch(false);
      })
      .catch((error) => {
        console.error("Error fetching recipe by ID:", error);
        setSearchedRecipe(null);
        setLoadingSearch(false);
      });
  };

  return (
    <div>
      <h2>All Favorite Recipes</h2>
      {loadingAll ? (
        <p>Loading recipes...</p>
      ) : (
        <ul>
          {allRecipes.map((recipe) => (
            <li key={recipe.recipeId} style={{ marginBottom: "1em" }}>
              <h3>{recipe.recipeName}</h3>
              <button onClick={() => handleDelete(recipe.recipeId)}>Delete</button>
            </li>
          ))}
        </ul>
      )}

      <h2>Planned Recipes</h2>
      {loadingAll ? (
        <p>Loading planned recipes...</p>
      ) : plannedRecipes.length === 0 ? (
        <p>No planned recipes.</p>
      ) : (
        <ul>
          {plannedRecipes.map((recipe) => (
            <li key={recipe.recipeId} style={{ marginBottom: "1em" }}>
              <h3>{recipe.recipeName}</h3>
              <p><strong>Planned for:</strong> {recipe.date || "N/A"}</p>
              <button onClick={() => handleDelete(recipe.recipeId)}>Delete</button>
            </li>
          ))}
        </ul>
      )}

      <h2>Unplanned Recipes</h2>
      {loadingUnplanned ? (
        <p>Loading unplanned recipes...</p>
      ) : unplannedRecipes.length === 0 ? (
        <p>No unplanned recipes.</p>
      ) : (
        <ul>
          {unplannedRecipes.map((recipe) => (
            <li key={recipe.recipeId} style={{ marginBottom: "1em" }}>
              <h3>{recipe.recipeName}</h3>
              <button onClick={() => handleDelete(recipe.recipeId)}>Delete</button>
            </li>
          ))}
        </ul>
      )}

      <h2>Search for a Favorite Recipe by ID</h2>
      <input
        type="text"
        placeholder="Enter Recipe ID"
        value={searchRecipeId}
        onChange={(e) => setSearchRecipeId(e.target.value)}
      />
      <button onClick={handleSearchRecipe} disabled={loadingSearch}>
        {loadingSearch ? "Searching..." : "Search"}
      </button>
      
      {searchedRecipe && (
        <div style={{ marginTop: "1em", padding: "1em", border: "1px solid #ddd" }}>
          <h3>{searchedRecipe.ingredientName}</h3>
          <p><strong>Directions:</strong> {searchedRecipe.directions}</p>
          <p><strong>Notes:</strong> {searchedRecipe.notes}</p>
          <p><strong>Planned:</strong> {searchedRecipe.planned ? "Yes" : "No"}</p>
          <p><strong>Date:</strong> {searchedRecipe.date || "N/A"}</p>
          <button onClick={() => handleDelete(searchRecipeId)}>Delete</button>
        </div>
      )}
    </div>
  );
}
