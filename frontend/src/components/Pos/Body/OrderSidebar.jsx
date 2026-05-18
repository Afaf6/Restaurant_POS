import style from "./Body.module.css";

function OrderSidebar({ cart, onInc, onDec, subtotal, tax, total }) {
  return (
    <div className={style.sidebar}>
      
      <div className={style.orderHeader}>
        <span style={{ fontWeight: 700 }}>🪑 Table 04</span>
        <span style={{ fontSize: 13, color: "#888" }}>Guest: John</span>
      </div>

     
      <div className={style.orderList}>
        {cart.length === 0 ? (
          <p className={style.emptyMsg}>No items yet</p>
        ) : (
          cart.map((item) => (
            <div key={item.id} className={style.orderItem}>
              <span style={{ flex: 1, fontSize: 13 }}>{item.name}</span>
              <div className={style.qtyRow}>
                <button className={style.qtyBtn} onClick={() => onDec(item.id)}>
                  − 
                </button>
                <span className={style.qty}>{item.qty}</span>
                <button className={style.qtyBtn} onClick={() => onInc(item.id)}>
                  +
                </button>
              </div>
              <span style={{ fontSize: 13, minWidth: 52, textAlign: "right" }}>
                ${(item.price * item.qty).toFixed(2)}
              </span>
            </div>
          ))
        )}
      </div>

     
      <div className={style.breakdown}>
        <div className={style.breakRow}>
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className={style.breakRow}>
          <span>Tax (8%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className={style.totalRow}>
          <span>Total</span>
          <span className={style.totalAmount}>${total.toFixed(2)}</span>
        </div>
      </div>

      
      <div className={style.actions}>
        <button className={style.outlineBtn}>Bill</button>
        <button className={style.outlineBtn}>Promo</button>
        <button className={style.payBtn}>Pay Now</button>
      </div>
    </div>
  );
}

export default OrderSidebar;