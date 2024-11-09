import { useState } from "react";

export default function RecipeSearch({ onSearch }) {
  const [ingredients, setIngredients] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!ingredients) return;

    setLoading(true);
    setError(null); // Reset any previous errors

    try {
      // Make a request to the backend API with the entered ingredients
      const res = await fetch(`/api/recipes?ingredients=${encodeURIComponent(ingredients)}`);
      if (!res.ok) {
        throw new Error("Failed to fetch recipes");
      }

      const data = await res.json();
      onSearch(data); // Pass the results back to the parent component
    } catch (err) {
      setError("There was an error searching for recipes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Search Recipes by Ingredients</h2>
      <input
        type="text"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        placeholder="Enter ingredients separated by commas"
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
