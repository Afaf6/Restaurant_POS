import style from "./Body.module.css";

function MenuCard({ item, displayStock, onAdd }) {
  const isOutOfStock = displayStock <= 0;

  return (
    <div className={`${style.card} ${isOutOfStock ? style.outOfStock : ""}`}>
      <div className={style.imageContainer}>
        {item.image ? (
          <img src={item.image} alt={item.name} className={style.itemImage} />
        ) : (
          <div className={style.emoji}>{item.emoji || "🍔"}</div>
        )}
      </div>
      <div className={style.itemName}>{item.name}</div>
      <div className={style.stockInfo}>
        Stock: {displayStock}
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <span className={style.price}>${item.price.toFixed(2)}</span>
        <button 
          className={style.addBtn} 
          onClick={() => onAdd(item)}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? "X" : "+"}
        </button>
      </div>
    </div>
  );
}

export default MenuCard;