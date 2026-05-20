import {useEffect, useState} from "react";
import ExponsCart from "./ExpensCart/ExpensCart";
import Chart from "./Chart/Chart";
import Staff from "./Staff/Staff";
import Promos from "./Promos/Promos";
import style from "./Dashboard.module.css";
import * as XLSX from 'xlsx';
import apiFetch from "../../api/apiFetch";

function Dashboard() {

  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState("financials");
  
  const currentRole = localStorage.getItem("role") || "Cashier";
  const isSuperAdmin  = currentRole === "Super Admin";
  const isTeamLeader  = currentRole === "Team Leader";

useEffect(() => {
    if (subTab === "financials") {
      if (!isSuperAdmin) { setLoading(false); return; }
      const fetchDashboard = async () => {
        try {
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
    } else {
      setLoading(false);
    }
}, [days, subTab]);

const handleExport = () => {
  if (!data) return;

  const wb = XLSX.utils.book_new();
  const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const periodLabel = days === 7 ? 'Last 7 Days' : days === 30 ? 'Last 30 Days' : 'Last 3 Months';

  const style = (bold, bg) => ({ font: { bold }, fill: bg ? { fgColor: { rgb: bg } } : undefined });

  // ── Helper: append a sheet with a title block then rows ──
  const makeSheet = (rows) => XLSX.utils.aoa_to_sheet(rows);

  // ══════════════════════════════════════════
  // SHEET 1 — Executive Summary
  // ══════════════════════════════════════════
  const s = data.summary || {};
  const summaryRows = [
    [`FreshBite Restaurant — Owner Report`],
    [`Generated: ${reportDate}   |   Period: ${periodLabel}`],
    [],
    ['FINANCIAL SUMMARY'],
    ['Metric', 'Value', 'vs Last Month'],
    ['Total Revenue',  `$${Number(s.revenue  || 0).toFixed(2)}`, `${s.revenueChange  >= 0 ? '+' : ''}${s.revenueChange}%`],
    ['Total Expenses', `$${Number(s.expenses || 0).toFixed(2)}`, `${s.expensesChange >= 0 ? '+' : ''}${s.expensesChange}%`],
    ['Net Profit',     `$${Number(s.profit   || 0).toFixed(2)}`, `${s.profitChange   >= 0 ? '+' : ''}${s.profitChange}%`],
    [],
    ['ORDER SUMMARY'],
    ['Metric', 'Count'],
    ['Total Orders',     s.totalOrders     || 0],
    ['Completed Orders', s.completedOrders || 0],
    ['Pending Orders',   s.pendingOrders   || 0],
    ['Refunded Orders',  s.refundedOrders  || 0],
    ['Cancelled Orders', s.cancelledOrders || 0],
    [],
    ['STAFF SUMMARY'],
    ['Total Staff Members', s.totalStaffCount || 0],
  ];
  XLSX.utils.book_append_sheet(wb, makeSheet(summaryRows), '1. Summary');

  // ══════════════════════════════════════════
  // SHEET 2 — Daily Breakdown
  // ══════════════════════════════════════════
  const dailyRows = [
    [`Daily Breakdown — ${periodLabel}`],
    [],
    ['Date', 'Orders', 'Revenue ($)', 'Expenses ($)', 'Profit ($)'],
    ...(data.dailyBreakdown || []).map(d => [
      d.date,
      d.orders,
      Number(d.revenue).toFixed(2),
      Number(d.expenses).toFixed(2),
      Number(d.profit).toFixed(2)
    ])
  ];
  XLSX.utils.book_append_sheet(wb, makeSheet(dailyRows), '2. Daily Breakdown');

  // ══════════════════════════════════════════
  // SHEET 3 — Full Order Log
  // ══════════════════════════════════════════
  const orderRows = [
    ['Full Order Log'],
    [],
    ['Order #', 'Date', 'Time', 'Cashier', 'Items', 'Item Count', 'Revenue ($)', 'Expenses ($)', 'Profit ($)', 'Status'],
    ...(data.orderLog || []).map(o => [
      o.orderNumber,
      o.date,
      o.time,
      o.cashier,
      o.items,
      o.itemCount,
      Number(o.revenue).toFixed(2),
      Number(o.expenses).toFixed(2),
      Number(o.profit).toFixed(2),
      o.status
    ])
  ];
  XLSX.utils.book_append_sheet(wb, makeSheet(orderRows), '3. Order Log');

  // ══════════════════════════════════════════
  // SHEET 4 — Top Products
  // ══════════════════════════════════════════
  const productRows = [
    ['Top Selling Products'],
    [],
    ['Product Name', 'Units Sold', 'Revenue ($)', 'Cost ($)', 'Profit ($)', 'Margin %'],
    ...(data.topProducts || []).map(p => [
      p.name,
      p.qty,
      Number(p.revenue).toFixed(2),
      Number(p.cost).toFixed(2),
      Number(p.profit).toFixed(2),
      p.margin
    ])
  ];
  XLSX.utils.book_append_sheet(wb, makeSheet(productRows), '4. Top Products');

  // ══════════════════════════════════════════
  // SHEET 5 — Cashier Performance
  // ══════════════════════════════════════════
  const cashierRows = [
    ['Cashier Performance'],
    [],
    ['Name', 'Email', 'Orders Handled', 'Total Revenue ($)', 'Avg Order Value ($)'],
    ...(data.cashierPerformance || []).map(c => [
      c.name,
      c.email,
      c.orders,
      Number(c.revenue).toFixed(2),
      c.orders > 0 ? (c.revenue / c.orders).toFixed(2) : '0.00'
    ])
  ];
  XLSX.utils.book_append_sheet(wb, makeSheet(cashierRows), '5. Cashier Performance');

  // ══════════════════════════════════════════
  // SHEET 6 — Inventory Snapshot
  // ══════════════════════════════════════════
  const inventoryRows = [
    ['Inventory Snapshot'],
    [],
    ['Item Name', 'SKU', 'Category', 'Qty', 'Min Stock', 'Unit', 'Cost Price ($)', 'Selling Price ($)', 'Stock Value ($)', 'Status', 'Expiry Date', 'Last Restocked'],
    ...(data.inventorySnapshot || []).map(i => [
      i.itemName,
      i.sku,
      i.category,
      i.currentQuantity,
      i.minimumStock,
      i.unit,
      Number(i.costPrice).toFixed(2),
      Number(i.sellingPrice).toFixed(2),
      Number(i.stockValue).toFixed(2),
      i.status,
      i.expiryDate,
      i.lastRestocked
    ])
  ];
  XLSX.utils.book_append_sheet(wb, makeSheet(inventoryRows), '6. Inventory');

  // ══════════════════════════════════════════
  // SHEET 7 — Staff List
  // ══════════════════════════════════════════
  const staffRows = [
    ['Staff List'],
    [],
    ['Name', 'Email', 'Role', 'Joined Date'],
    ...(data.staffList || []).map(s => [s.name, s.email, s.role, s.joinedDate])
  ];
  XLSX.utils.book_append_sheet(wb, makeSheet(staffRows), '7. Staff');

  // ── Set column widths on all sheets ──
  const colWidths = (ws, widths) => { ws['!cols'] = widths.map(w => ({ wch: w })); };
  colWidths(wb.Sheets['1. Summary'],           [28, 18, 16]);
  colWidths(wb.Sheets['2. Daily Breakdown'],   [14, 10, 14, 14, 14]);
  colWidths(wb.Sheets['3. Order Log'],         [12, 12, 10, 16, 50, 12, 14, 14, 14, 12]);
  colWidths(wb.Sheets['4. Top Products'],      [24, 12, 14, 14, 14, 12]);
  colWidths(wb.Sheets['5. Cashier Performance'], [20, 28, 16, 18, 18]);
  colWidths(wb.Sheets['6. Inventory'],         [20, 12, 12, 8, 10, 8, 14, 16, 14, 14, 14, 16]);
  colWidths(wb.Sheets['7. Staff'],             [20, 28, 14, 14]);

  const fileName = `FreshBite_Report_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

    const links = [
        {icon: "fa-regular fa-calendar", text: "Last 30 Days", type: "outline"},
        {icon: "fa-solid fa-download", text: "Export Report", type: "primary"},
    ]

    if (loading && subTab === "financials") return <p>Loading Dashboard...</p>;

  return (
   <div className={style.dashboard}>
    {/* Sub Tab Navigation */}
    {(isSuperAdmin || isTeamLeader) && (
      <div className="container-md d-flex gap-3 mb-4" style={{ borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        {isSuperAdmin && (
          <button
            onClick={() => setSubTab("financials")}
            style={{ background: "none", border: "none", fontWeight: subTab === "financials" ? 700 : 500, color: subTab === "financials" ? "#e67e22" : "#666", padding: "5px 10px", borderBottom: subTab === "financials" ? "3px solid #e67e22" : "none", marginBottom: "-13px" }}
          >
            📈 Financials
          </button>
        )}
        <button
          onClick={() => setSubTab("staff")}
          style={{ background: "none", border: "none", fontWeight: subTab === "staff" ? 700 : 500, color: subTab === "staff" ? "#e67e22" : "#666", padding: "5px 10px", borderBottom: subTab === "staff" ? "3px solid #e67e22" : "none", marginBottom: "-13px" }}
        >
          👥 Staff Management
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => setSubTab("promos")}
            style={{ background: "none", border: "none", fontWeight: subTab === "promos" ? 700 : 500, color: subTab === "promos" ? "#e67e22" : "#666", padding: "5px 10px", borderBottom: subTab === "promos" ? "3px solid #e67e22" : "none", marginBottom: "-13px" }}
          >
            🎟️ Promo Codes
          </button>
        )}
      </div>
    )}

    {subTab === "financials" && isSuperAdmin ? (
      <>
        <div className={`${style.dashSec} d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 container-md`}>
          <div className={`${style.dashTitle} `}>
            <h2>Financial Overview</h2>
            <p>Track your restaurant's performance in real-time.</p>
          </div>

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
      </>
    ) : subTab === "promos" && isSuperAdmin ? (
      <div className="container-md">
        <Promos />
      </div>
    ) : (
      <div className="container-md">
        <Staff />
      </div>
    )}
  </div>
  );
}

export default Dashboard;