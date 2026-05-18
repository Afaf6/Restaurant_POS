import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Activity from "../Activity/Activity";
import style from "./Chart.module.css";


const dataChart = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 5000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

function Chart({ activity, salesData }) { 
  return (
     <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 container-md">
     
      <div className={`${style.chart} gap-3 p-3`}>

      <div className="flex justify-content-between align-items-center gap-3">
        
        <h2 className="p-3"> Sales Trends</h2>
        
        <div style={{width: '100%', height: 300}}>
          
          <ResponsiveContainer>

            <BarChart data={salesData && salesData.length > 0 ? salesData : []}>
             
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis hide={true} />
              <Tooltip />
              <Bar dataKey="sales" fill="#e67e22" radius={[5, 5, 0, 0]} />
           
            </BarChart>
          
          </ResponsiveContainer>
        </div>
      </div>
      </div>
      <Activity activity={activity} />
    </div>
  );
}

export default Chart;