import { useState } from "react";
import Body from "../Pos/Body/Body";
import BottomNavbar from "../Footer/Footer";
import Dashboard from "../../components/Dashboard/Dashboard";
import Inventory from "../../components/Inventory/Inventory";
import style from "./Pos.module.css";

function Pos({ activeTab }) {

  return (
    <div className={style.posWrapper}>
      <div className={style.content}>
        {activeTab === "POS" && <Body />}

        {activeTab === "Inventory" && <Inventory activeTab={activeTab} />}

        {activeTab === "Dashboard" && <Dashboard/>}
      </div>

    </div>
  );
}

export default Pos;
