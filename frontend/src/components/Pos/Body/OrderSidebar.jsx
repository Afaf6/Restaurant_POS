import { useState } from "react";
import style from "./Body.module.css";
import { validatePromo } from "../../../services/promoService";

function OrderSidebar({ cart, onInc, onDec, subtotal, tax, total, onPay, orderNumber, isOpen, onClose, onPromoApplied, appliedPromo, discount }) {
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError("");
    setPromoLoading(true);
    try {
      const result = await validatePromo(promoInput.trim(), subtotal);
      onPromoApplied(result);
      setPromoInput("");
    } catch (e) {
      setPromoError(e.message || "Invalid promo code");
      onPromoApplied(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    onPromoApplied(null);
    setPromoInput("");
    setPromoError("");
  };

  const finalTotal = Math.max(0, total - (discount || 0));

  return (
    <div className={`${style.sidebar} ${isOpen ? style.sidebarOpen : ""}`}>

      <div className={style.orderHeader}>
        <span style={{ fontWeight: 700 }}>📋 Order</span>
        <span style={{ fontSize: 14, color: "#e67e22", fontWeight: 800 }}>{orderNumber || "#00001"}</span>
      </div>

      <div className={style.orderList}>
        {cart.length === 0 ? (
          <p className={style.emptyMsg}>No items yet</p>
        ) : (
          cart.map((item) => (
            <div key={item._id} className={style.orderItem}>
              <span style={{ flex: 1, fontSize: 13 }}>{item.name}</span>
              <div className={style.qtyRow}>
                <button className={style.qtyBtn} onClick={() => onDec(item._id)}>−</button>
                <span className={style.qty}>{item.qty}</span>
                <button className={style.qtyBtn} onClick={() => onInc(item._id)}>+</button>
              </div>
              <span style={{ fontSize: 13, minWidth: 52, textAlign: "right" }}>
                ${(item.price * item.qty).toFixed(2)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Promo Input */}
      <div className={style.promoSection}>
        {appliedPromo ? (
          <div className={style.promoApplied}>
            <div className={style.promoAppliedInfo}>
              <span className={style.promoAppliedCode}>🎟️ {appliedPromo.code}</span>
              <span className={style.promoAppliedDesc}>
                {appliedPromo.discountType === "percentage"
                  ? `${appliedPromo.discountValue}% off`
                  : `$${appliedPromo.discountValue} off`}
                {appliedPromo.description ? ` — ${appliedPromo.description}` : ""}
              </span>
            </div>
            <button className={style.promoRemoveBtn} onClick={handleRemovePromo}>✕</button>
          </div>
        ) : (
          <div className={style.promoInputRow}>
            <input
              className={style.promoInput}
              placeholder="Promo code..."
              value={promoInput}
              onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
            />
            <button
              className={style.promoApplyBtn}
              onClick={handleApplyPromo}
              disabled={promoLoading || !promoInput.trim()}
            >
              {promoLoading ? "..." : "Apply"}
            </button>
          </div>
        )}
        {promoError && <p className={style.promoError}>{promoError}</p>}
      </div>

      {/* Breakdown */}
      <div className={style.breakdown}>
        <div className={style.breakRow}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        <div className={style.breakRow}><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
        {discount > 0 && (
          <div className={`${style.breakRow} ${style.discountRow}`}>
            <span>Discount</span>
            <span>−${discount.toFixed(2)}</span>
          </div>
        )}
        <div className={style.totalRow}>
          <span>Total</span>
          <span className={style.totalAmount}>${finalTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className={style.actions}>
        <button className={style.payBtn} onClick={() => onPay(finalTotal, appliedPromo?.promoId)} disabled={cart.length === 0}>
          Pay Now
        </button>
      </div>
    </div>
  );
}

export default OrderSidebar;
