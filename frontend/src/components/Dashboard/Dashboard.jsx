import {useEffect, useState} from "react";
import ExponsCart from "./ExpensCart/ExpensCart";
import Chart from "./Chart/Chart";
import style from "./Dashboard.module.css";
import apiFetch from "../../api/apiFetch";
import * as XLSX from 'xlsx';

function Dashboard() {

  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  
useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // const res = await apiFetch("/showDashboard");
        // console.log("API Response:", res);
        // setData(res);
        setLoading(true);
        const res = await apiFetch(`/showDashboard?days=${days}`);
        console.log(res);
        setData(res);
      } catch (error) {
        console.log("Error:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
}, [days]);

const handleExport = () => {

  const dataToExport = data.salesData; 
  const worksheet = XLSX.utils.json_to_sheet(dataToExport)
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
  
  XLSX.writeFile(workbook, "FreshBite_Report.xlsx");
};

    const links = [
        {icon: "fa-regular fa-calendar", text: "Last 30 Days", type: "outline"},
        {icon: "fa-solid fa-download", text: "Export Report", type: "primary"},
    ]

    if (loading) return <p>Loading Dashboard...</p>;

  return (
   <div className={style.dashboard}>
    <div className={`${style.dashSec} d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 container-md`}>
      <div className={`${style.dashTitle} `}>
        <h2>Financial Overview</h2>
        <p>Track your restaurant's performance in real-time.</p>
      </div>

      {/* <div className={`${style.btns} d-flex flex-column flex-sm-row gap-2`}>
          <select
            className={style.btn}
            onChange={(e) => setDays(e.target.value)}
            value={days}
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 3 Months</option>
          </select>

        {links.map((item, index) => (
           <button className={`${style.btn} ${item.type === "primary" ? style.primary : style.outline}`} key={index}>
            <i className={item.icon}></i>
           
            <span className="text">{item.text}</span>
        </button>
        ))}
      </div> */}
      <div className={`${style.btns} d-flex flex-column flex-sm-row gap-2`}>
    
    <select 
        className={style.btn} 
        value={days} 
        onChange={(e) => setDays(Number(e.target.value))}
    >
        <option value="7">Last 7 Days</option>
        <option value="30">Last 30 Days</option>
        <option value="90">Last 3 Months</option>
    </select>

    
    <button className={style.primary} onClick={handleExport}>
        <i className="fa-solid fa-download"></i> Export Report
    </button>
</div>
    </div>

    <ExponsCart summary={data?.summary} />

    <div className={`${style.dashSec} d-flex justify-content-between align-items-start`}>
      <Chart activity={data?.activity} salesData={data?.salesData} />
    </div>
  </div>
  );
}

export default Dashboard;