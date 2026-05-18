import style from "./Body.module.css";

function MenuCard({ item, onAdd }) {
  return (
    <div className={style.card}>
      <div className={style.emoji}>{item.emoji}</div>
      <div className={style.itemName}>{item.name}</div>
      <div className="d-flex justify-content-between align-items-center">
        <span className={style.price}>${item.price.toFixed(2)}</span>
        <button className={style.addBtn} onClick={() => onAdd(item)}>
          +
        </button>
      </div>
    </div>
  );
}

export default MenuCard;