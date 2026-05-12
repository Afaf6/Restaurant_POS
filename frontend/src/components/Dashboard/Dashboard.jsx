import ExponsCart from "./ExpensCart/ExpensCart";
import Chart from "./Chart/Chart";
import style from "./Dashboard.module.css";


function Dashboard() {

    const links = [
        {icon: "fa-regular fa-calendar", text: "Last 30 Days", type: "outline"},
        {icon: "fa-solid fa-download", text: "Export Report", type: "primary"},
    ]

  return (
   <div>
    <div className={`${style.dashSec} d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 container-md`}>
      <div className={`${style.dashTitle} `}>
        <h2>Financial Overview</h2>
        <p>Track your restaurant's performance in real-time.</p>
      </div>
      <div className={`${style.btns} d-flex flex-column flex-sm-row gap-2`}>
        {links.map((item, index) => (
           <button className={`${style.btn} ${item.type === "primary" ? style.primary : style.outline}`} key={index}>
            <i className={item.icon}></i>
           
            <span className="text">{item.text}</span>
        </button>
        ))}
      </div>
    </div>
    <ExponsCart/>
    <div className={`${style.dashSec} d-flex justify-content-between align-items-start`}>
      <Chart/>
      
    </div>

  </div>
  );
}

export default Dashboard;