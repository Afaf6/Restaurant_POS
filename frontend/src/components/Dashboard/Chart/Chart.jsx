import Activity from "../Activity/Activity";
import style from "./Chart.module.css";


function Chart() {

    const links = [
        {text: "Day"},
        {text: "Week"},
        {text: "Month"}

    ]
  return (
    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 container-md">

    <div className={`${style.chart} gap-3 p-3`}>

      <div className="d-flex justify-content-between align-items-center gap-3">
        <h2>Sales Trends</h2>
        <div>
          {links.map((item, index) => (
            <button key={index}>
              {item.text}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p>Chart will be here</p>
      </div>

    </div>
    
    <Activity/>
    </div>
  );
}   

export default Chart;