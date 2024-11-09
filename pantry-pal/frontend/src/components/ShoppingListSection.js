import { useState, useEffect } from "react";

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

export default function ShoppingListSection() {
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");

  // Fetch shopping list from /api/ingredients/shoppingList when the component mounts
  useEffect(() => {
    fetch(`${domain}/api/ingredients/shoppingList`)
      .then((response) => response.json())
      .then((data) => {
        setShoppingList(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching shopping list:", error);
        setLoading(false);
      });
  }, []);

  // Handle input change for the new item form
  const handleInputChange = (e) => {
    setNewItem(e.target.value);
  };

  // Handle form submission to add a new item
  const handleAddItem = (e) => {
    e.preventDefault();

    // Send POST request to add the new item to the shopping list
    fetch(`${domain}/api/ingredients/shoppingList`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredientName: newItem }),
    })
      .then((response) => {
        if (response.status === 201) {
          // Update shopping list with the new item
          setShoppingList((prev) => [...prev, { ingredientName: newItem }]);
          // Reset input field
          setNewItem("");
        } else {
          throw new Error("Failed to add item to shopping list.");
        }
      })
      .catch((error) => {
        console.error("Error adding item to shopping list:", error);
      });
  };

  // Handle deletion of an item
  const handleDeleteItem = (ingredientName) => {
    // Send DELETE request to remove the item from the shopping list
    fetch(`${domain}/api/ingredients/shoppingList`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredientName }),
    })
      .then((response) => {
        if (response.status === 200) {
          // Update shopping list by removing the deleted item
          setShoppingList((prev) =>
            prev.filter((item) => item.ingredientName !== ingredientName)
          );
        } else {
          throw new Error("Failed to delete item from shopping list.");
        }
      })
      .catch((error) => {
        console.error("Error deleting item from shopping list:", error);
      });
  };

  return (
    <div>
      <h2>Shopping List</h2>
      {loading ? (
        <p>Loading shopping list...</p>
      ) : (
        <ul>
          {shoppingList.map((item, index) => (
            <li key={index}>
              {item.ingredientName}
              <button onClick={() => handleDeleteItem(item.ingredientName)} style={{ marginLeft: "10px" }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <h3>Add Item to Shopping List</h3>
      <form onSubmit={handleAddItem}>
        <label>
          Ingredient Name:
          <input
            type="text"
            value={newItem}
            onChange={handleInputChange}
            required
          />
        </label>
        <button type="submit">Add to Shopping List</button>
      </form>
    </div>
  );
}
