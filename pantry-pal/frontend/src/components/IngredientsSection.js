import { useState, useEffect } from "react";
import RecipeSuggestion from "@/components/RecipeSuggestion";

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

export default function IngredientsSection() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newIngredient, setNewIngredient] = useState({
    ingredientName: "",
    units: "",
    purchaseDate: "",
    expirationDate: "",
    frozen: false,
  });

  // Fetch ingredients from /api/ingredients/pantry when the component mounts
  useEffect(() => {
    fetch(`${domain}/api/ingredients/pantry`)
      .then((response) => response.json())
      .then((data) => {
        // Process data to format dates
        const processedData = data.ingredients.map((item) => ({
          ...item,
          purchaseDate: item.purchaseDate
            ? new Date(item.purchaseDate.seconds * 1000).toLocaleDateString()
            : "N/A",
          expirationDate: item.expirationDate
            ? new Date(item.expirationDate.seconds * 1000).toLocaleDateString()
            : "N/A",
        }));
        setIngredients(processedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching ingredients:", error);
        setLoading(false);
      });
  }, []);

  // Handle input change for the new ingredient form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewIngredient((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission
  const handleAddIngredient = (e) => {
    e.preventDefault();

    // Send POST request to add or update ingredient
    fetch(`${domain}/api/ingredients/pantry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newIngredient),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to add or update ingredient.");
        }
      })
      .then((data) => {
        // Refresh ingredient list to reflect the new addition/update
        setIngredients((prev) => [...prev, newIngredient]);
        // Reset form
        setNewIngredient({
          ingredientName: "",
          units: "",
          purchaseDate: "",
          expirationDate: "",
          frozen: false,
        });
      })
      .catch((error) => {
        console.error("Error adding/updating ingredient:", error);
      });
  };

  // Handle delete ingredient
  const handleDeleteIngredient = (ingredientName) => {
    fetch(`${domain}/api/ingredients/pantry`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredientName }),
    })
      .then((response) => {
        if (response.ok) {
          setIngredients((prev) =>
            prev.filter((ingredient) => ingredient.ingredientName !== ingredientName)
          );
        } else {
          throw new Error("Failed to delete ingredient.");
        }
      })
      .catch((error) => {
        console.error("Error deleting ingredient:", error);
      });
  };

  return (
    <div>
      <h2>Ingredients</h2>

      {loading ? (
        <p>Loading ingredients...</p>
      ) : (
        <ul>
          {ingredients.map((ingredient, index) => (
            <li key={index} style={{ marginBottom: "1em" }}>
              <strong>{ingredient.ingredientName}</strong>
              <ul>
                <li>Expiration Date: {ingredient.expirationDate}</li>
                <li>Frozen: {ingredient.frozen ? "Yes" : "No"}</li>
                <li>Purchase Date: {ingredient.purchaseDate}</li>
              </ul>
              <button onClick={() => handleDeleteIngredient(ingredient.ingredientName)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <h3>Add or Update Ingredient</h3>
      <form onSubmit={handleAddIngredient}>
        <label>
          Name:
          <input
            type="text"
            name="ingredientName"
            value={newIngredient.ingredientName}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Units:
          <input
            type="text"
            name="units"
            value={newIngredient.units}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Purchase Date:
          <input
            type="date"
            name="purchaseDate"
            value={newIngredient.purchaseDate}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Expiration Date:
          <input
            type="date"
            name="expirationDate"
            value={newIngredient.expirationDate}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Frozen:
          <input
            type="checkbox"
            name="frozen"
            checked={newIngredient.frozen}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit">Add/Update Ingredient</button>
      </form>

      {/* Pass ingredients to RecipeSuggestion */}
      <RecipeSuggestion ingredients={ingredients} />
    </div>
  );
}
