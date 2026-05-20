import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Header from "./components/Header/Header";
import Pos from "./components/Pos/Pos";
import Orders from "./components/Orders/Orders";
import Inventory from "./components/Inventory/Inventory";
import Dashboard from "./components/Dashboard/Dashboard";
import BottomNavbar from "./components/Footer/Footer";
import Register from "./components/Register/Register";
import Login from "./components/Login/Login";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/" replace />;
  return children;
};

function MainApp() {
  const [activeTab, setActiveTab] = useState("POS");
  const userDisplayName = localStorage.getItem("userName") || "Guest";

  const renderTab = () => {
    switch (activeTab) {
      case "Orders": return <Orders />;
      case "Inventory": return <Inventory />;
      case "Dashboard": return <Dashboard />;
      default: return <Pos activeTab={activeTab} onGoToInventory={() => setActiveTab("Inventory")} />;
    }
  };

  return (
    <div style={{ paddingBottom: "60px" }}>
      <Header adminName={userDisplayName} />
      {renderTab()}
      <BottomNavbar active={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/*" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
