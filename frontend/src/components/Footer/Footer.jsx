import style from "./Footer.module.css";

export default function BottomNavbar({ active, onChange }) {
  const role = localStorage.getItem("role") || "Cashier";

  // Cashier: POS + Orders only
  // Team Leader: POS + Orders + Inventory + Staff (Dashboard tab shows Staff only)
  // Super Admin: everything
  let tabs = ["POS", "Orders"];

  if (role === "Team Leader") {
    tabs = ["POS", "Orders", "Inventory", "Dashboard"];
  }

  if (role === "Super Admin") {
    tabs = ["POS", "Orders", "Inventory", "Dashboard"];
  }

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
