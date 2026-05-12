import { useState, useEffect } from "react";
import MenuCard from "./MenuCard";
import OrderSidebar from "./OrderSidebar";
import style from "./Body.module.css";
import { fetchProducts } from "../../../services/productService";
import { createOrder } from "../../../services/orderService";

const CATEGORIES = ["All Items", "Burgers", "Pizzas", "Salads"];
const TAX_RATE = 0.08;

export default function Body() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All Items");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter(
    (m) =>
      (category === "All Items" || m.category === category) &&
      m.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (item) =>
    setCart((prev) => {
      const found = prev.find((c) => c._id === item._id);
      const currentQty = found ? found.qty : 0;
      
      // Check effective stock
      if (currentQty + 1 > item.effectiveStock) {
        alert(`Insufficient stock for ${item.name}`);
        return prev;
      }

      return found
        ? prev.map((c) => (c._id === item._id ? { ...c, qty: c.qty + 1 } : c))
        : [...prev, { ...item, qty: 1 }];
    });

  const inc = (id) =>
    setCart((prev) => {
      const item = products.find(p => p._id === id);
      const found = prev.find(c => c._id === id);
      if (found && found.qty + 1 > item.effectiveStock) {
        alert(`Insufficient stock for ${item.name}`);
        return prev;
      }
      return prev.map((c) => (c._id === id ? { ...c, qty: c.qty + 1 } : c));
    });

  const dec = (id) =>
    setCart((prev) =>
      prev
        .map((c) => (c._id === id ? { ...c, qty: c.qty - 1 } : c))
        .filter((c) => c.qty > 0)
    );

  const handlePay = async () => {
    if (cart.length === 0) {
      alert("Please add items to the cart first.");
      return;
    }
    try {
      console.log("Placing order...", cart);
      await createOrder(cart);
      alert("Order placed successfully!");
      setCart([]);
      loadProducts(); // Refresh stock
    } catch (error) {
      console.error("Payment Error:", error);
      alert(`Error placing order: ${error.message}`);
    }
  };

  const handleBill = () => {
    if (cart.length === 0) {
      alert("Cannot generate bill for an empty cart.");
      return;
    }
    alert("Generating Bill... (This would typically open a print view)");
    window.print();
  };

  const handlePromo = () => {
    const code = prompt("Enter Promo Code:");
    if (code) {
      alert(`Promo code "${code}" is valid! Discount applied (Simulated)`);
      // In a real app, you'd calculate discount here
    }
  };

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  if (loading) return <div className={style.loading}>Loading Menu...</div>;

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
          {filtered.map((item) => {
            const inCart = cart.find((c) => c._id === item._id)?.qty || 0;
            const displayStock = item.effectiveStock - inCart;
            
            return (
              <MenuCard 
                key={item._id} 
                item={item} 
                displayStock={displayStock} 
                onAdd={addToCart} 
              />
            );
          })}
        </div>
      </div>

      {/* ── Right: Order Sidebar ── */}
      <OrderSidebar
        cart={cart}
        onInc={inc}
        onDec={dec}
        onPay={handlePay}
        onBill={handleBill}
        onPromo={handlePromo}
        subtotal={subtotal}
        tax={tax}
        total={total}
      />
    </div>
  );
}