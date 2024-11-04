import { useState } from "react";

export default function ShoppingListSection() {
  const [shoppingList, setShoppingList] = useState([
    { id: 1, name: "Pasta" },
    { id: 2, name: "Chicken" },
  ]);

  return (
    <div>
      <h2>Shopping List</h2>
      <ul>
        {shoppingList.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
