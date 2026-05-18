import { useState } from "react";
import MenuCard from "./MenuCard";
import OrderSidebar from "./OrderSidebar";
import style from "./Body.module.css";

const MENU = [
  { id: 1, name: "Classic Burger", price: 8.99, category: "Burgers", emoji: "🍔" },
  { id: 2, name: "Cheese Burger", price: 9.99, category: "Burgers", emoji: "🍔" },
  { id: 3, name: "Margherita Pizza", price: 11.99, category: "Pizzas", emoji: "🍕" },
  { id: 4, name: "Pepperoni Pizza", price: 13.99, category: "Pizzas", emoji: "🍕" },
  { id: 5, name: "Caesar Salad", price: 7.49, category: "Salads", emoji: "🥗" },
  { id: 6, name: "Greek Salad", price: 7.99, category: "Salads", emoji: "🥗" },
];

const CATEGORIES = ["All Items", "Burgers", "Pizzas", "Salads"];
const TAX_RATE = 0.08;

export default function Body() {
  const [category, setCategory] = useState("All Items");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);

  const filtered = MENU.filter(
    (m) =>
      (category === "All Items" || m.category === category) &&
      m.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (item) =>
    setCart((prev) => {
      const found = prev.find((c) => c.id === item.id);
      return found
        ? prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c))
        : [...prev, { ...item, qty: 1 }];
    });

  const inc = (id) =>
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c))
    );

  const dec = (id) =>
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty - 1 } : c))
        .filter((c) => c.qty > 0)
    );

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <div className={style.layout}>
     
      <div className={style.menuSection}>
      
        <div className={style.categories}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`${style.catBtn} ${category === cat ? style.catActive : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className={style.searchWrap}>
          <span className={style.searchIcon}>🔍</span>
          <input
            className={style.searchInput}
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Menu Grid */}
        <div className={style.grid}>
          {filtered.map((item) => (
            <MenuCard key={item.id} item={item} onAdd={addToCart} />
          ))}
        </div>
      </div>

      {/* ── Right: Order Sidebar ── */}
      <OrderSidebar
        cart={cart}
        onInc={inc}
        onDec={dec}
        subtotal={subtotal}
        tax={tax}
        total={total}
      />
    </div>
  );
}