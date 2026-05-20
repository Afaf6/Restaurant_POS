import { useState, useEffect } from "react";
import MenuCard from "./MenuCard";
import OrderSidebar from "./OrderSidebar";
import style from "./Body.module.css";
import { fetchProducts } from "../../../services/productService";
import { createOrder, fetchOrders } from "../../../services/orderService";
import NewProductModal from "./NewProductModal";

const CATEGORIES = ["All Items", "Burgers", "Pizzas", "Salads"];
const TAX_RATE = 0.08;

export default function Body({ onGoToInventory }) {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All Items");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextOrderNumber, setNextOrderNumber] = useState("#00001");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showIngredientConfirm, setShowIngredientConfirm] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [discount, setDiscount] = useState(0);

  const handleAddProductClick = () => setShowIngredientConfirm(true);

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

  const loadNextOrderNumber = async () => {
    try {
      const orders = await fetchOrders();
      const maxOrderNum = Array.isArray(orders)
        ? orders.reduce((max, o) => ((o.orderNumber || 0) > max ? o.orderNumber : max), 0)
        : 0;
      const nextNum = maxOrderNum + 1;
      setNextOrderNumber(`#${String(nextNum).padStart(5, "0")}`);
    } catch (error) {
      console.error("Failed to load order number:", error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadNextOrderNumber();
  }, []);

  const filtered = products.filter(
    (m) =>
      (category === "All Items" || m.category === category) &&
      m.name.toLowerCase().includes(search.toLowerCase())
  );

  const getDynamicStock = (product, currentCart) => {
    if (!product.ingredients || product.ingredients.length === 0) {
      const inCart = currentCart.find((c) => c._id === product._id)?.qty || 0;
      return Math.max(0, product.stock - inCart);
    }

    const stocks = product.ingredients.map((ing) => {
      const invId = ing.inventoryItem?._id || ing.inventoryItem;
      if (!invId) return 0;
      const totalAvailable = ing.inventoryItem?.currentQuantity || 0;

      let alreadyAllocated = 0;
      for (const cartItem of currentCart) {
        const fullProd = products.find((p) => p._id === cartItem._id);
        if (fullProd && fullProd.ingredients) {
          const matchingIng = fullProd.ingredients.find(
            (i) => (i.inventoryItem?._id || i.inventoryItem) === invId
          );
          if (matchingIng) {
            alreadyAllocated += matchingIng.quantity * cartItem.qty;
          }
        }
      }

      const remainingAvailable = Math.max(0, totalAvailable - alreadyAllocated);
      return Math.floor(remainingAvailable / ing.quantity);
    });

    return Math.min(...stocks);
  };

  const checkInventoryAvailability = (product, qtyChange, currentCart) => {
    if (!product.ingredients || product.ingredients.length === 0) {
      const inCartQty = currentCart.find((c) => c._id === product._id)?.qty || 0;
      if (inCartQty + qtyChange > product.stock) {
        return { allowed: false, name: "Product Stock" };
      }
      return { allowed: true };
    }

    for (const ing of product.ingredients) {
      const invId = ing.inventoryItem?._id || ing.inventoryItem;
      if (!invId) continue;

      const totalAvailable = ing.inventoryItem?.currentQuantity || 0;

      let alreadyAllocated = 0;
      for (const cartItem of currentCart) {
        const fullProd = products.find((p) => p._id === cartItem._id);
        if (fullProd && fullProd.ingredients) {
          const matchingIng = fullProd.ingredients.find(
            (i) => (i.inventoryItem?._id || i.inventoryItem) === invId
          );
          if (matchingIng) {
            alreadyAllocated += matchingIng.quantity * cartItem.qty;
          }
        }
      }

      const proposedAllocation = alreadyAllocated + ing.quantity * qtyChange;
      if (proposedAllocation > totalAvailable) {
        return {
          allowed: false,
          name: ing.inventoryItem?.itemName || "ingredients",
        };
      }
    }

    return { allowed: true };
  };

  const addToCart = (item) =>
    setCart((prev) => {
      const check = checkInventoryAvailability(item, 1, prev);
      if (!check.allowed) {
        alert(`Insufficient stock for ${check.name} (needed for ${item.name})`);
        return prev;
      }
      const found = prev.find((c) => c._id === item._id);
      return found
        ? prev.map((c) => (c._id === item._id ? { ...c, qty: c.qty + 1 } : c))
        : [...prev, { ...item, qty: 1 }];
    });

  const inc = (id) =>
    setCart((prev) => {
      const item = products.find((p) => p._id === id);
      const check = checkInventoryAvailability(item, 1, prev);
      if (!check.allowed) {
        alert(`Insufficient stock for ${check.name} (needed for ${item?.name})`);
        return prev;
      }
      return prev.map((c) => (c._id === id ? { ...c, qty: c.qty + 1 } : c));
    });

  const dec = (id) =>
    setCart((prev) =>
      prev.map((c) => (c._id === id ? { ...c, qty: c.qty - 1 } : c)).filter((c) => c.qty > 0)
    );

  const handlePromoApplied = (result) => {
    if (result) {
      setAppliedPromo(result);
      setDiscount(result.discount);
    } else {
      setAppliedPromo(null);
      setDiscount(0);
    }
  };

  const handlePay = async (finalTotal, promoId) => {
    if (cart.length === 0) {
      alert("Please add items to the cart first.");
      return;
    }
    try {
      await createOrder(cart, promoId, discount, appliedPromo?.code);
      setCart([]);
      setAppliedPromo(null);
      setDiscount(0);
      loadProducts();
      loadNextOrderNumber();
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 5000);
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
    window.print();
  };

  const handlePromo = () => {
    const code = prompt("Enter Promo Code:");
    if (code) {
      alert(`Promo code "${code}" is valid! Discount applied (Simulated)`);
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
          <button
            className={`${style.catBtn} ${style.addProductBtn}`}
            onClick={handleAddProductClick}
          >
            + Add Product
          </button>
        </div>

        <div className={style.searchWrap}>
          <span className={style.searchIcon}>🔍</span>
          <input
            className={style.searchInput}
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={style.grid}>
          {filtered.map((item) => {
            const displayStock = getDynamicStock(item, cart);
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

      <button className={`${style.cartToggle}`} onClick={() => setCartOpen(true)}>
        🛒
        {cart.length > 0 && <span className={style.cartBadge}>{cart.reduce((s,c)=>s+c.qty,0)}</span>}
      </button>

      <div className={`${style.sidebarOverlay} ${cartOpen ? style.overlayVisible : ''}`} onClick={() => setCartOpen(false)} />

      <OrderSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onInc={inc}
        onDec={dec}
        onPay={handlePay}
        onPromoApplied={handlePromoApplied}
        appliedPromo={appliedPromo}
        discount={discount}
        subtotal={subtotal}
        tax={tax}
        total={total}
        orderNumber={nextOrderNumber}
      />

      {showSuccessPopup && (
        <div className={style.popupOverlay} onClick={() => setShowSuccessPopup(false)}>
          <div className={style.popupCard} onClick={(e) => e.stopPropagation()}>
            <div className={style.popupCheckmark}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h3>Thank You!</h3>
            <p>Thank you for your purchase.</p>
            <div className={style.popupTimer}></div>
          </div>
        </div>
      )}

      {showIngredientConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 2000, padding: "16px"
        }}>
          <div style={{
            background: "#fff", borderRadius: "16px", padding: "32px 28px",
            maxWidth: "400px", width: "100%", textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)"
          }}>
            <div style={{ fontSize: "42px", marginBottom: "12px" }}>🧂</div>
            <h3 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: 700, color: "#1a1a1a" }}>
              Ingredients Ready?
            </h3>
            <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#666", lineHeight: 1.6 }}>
              Did you add the necessary ingredients to the <strong>Inventory</strong> first?
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => { setShowIngredientConfirm(false); onGoToInventory && onGoToInventory(); }}
                style={{
                  flex: 1, padding: "11px", borderRadius: "10px",
                  border: "1.5px solid #e4e4e4", background: "#f5f5f5",
                  color: "#333", fontWeight: 600, fontSize: "14px", cursor: "pointer"
                }}
              >
                No — Go to Inventory
              </button>
              <button
                onClick={() => { setShowIngredientConfirm(false); setShowAddProduct(true); }}
                style={{
                  flex: 1, padding: "11px", borderRadius: "10px",
                  border: "none", background: "#e67e22",
                  color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer"
                }}
              >
                Yes — Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddProduct && (
        <NewProductModal
          onClose={() => setShowAddProduct(false)}
          onProductAdded={loadProducts}
        />
      )}
    </div>
  );
}
