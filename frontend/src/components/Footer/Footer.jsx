import style from "./Footer.module.css";

export default function BottomNavbar({ active, onChange }) {
  const tabs = ["POS", "Inventory", "Dashboard"];
  return (
    <nav className={style.nav}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`${style.btn} ${active === tab ? style.active : ""}`}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}