import { useState, useEffect } from "react";

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

export default function ShoppingListSection() {
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);

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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
