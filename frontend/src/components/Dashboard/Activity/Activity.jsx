import style from "./Activity.module.css";

function Activity() {
    const links = [
        {icon:"fa-burger", title:"Total Revenue", subtitle:"Table 08 • 10:24 AM" ,money:"$142.50", type:"background-g", font:"fontG"  },
        {icon:"fa-caravan", title:"Total Expenses", subtitle:"Inventory • 09:15 AM" ,money:"$850.00", type:"background-r", font:"fontR" },
        {icon:"fa-mug-saucer", title:"Net Profit", subtitle:"Counter • 08:45 AM" ,money:"$24.15", type:"background-g", font:"fontG"},
        {icon:"fa-user", title:"Net Profit", subtitle:"Salary • 07:00 AM" ,money:"$1,200.00", type:"background-b", font:"fontR"},

    ]
    return (
        <div className={`${style.activitySec} d-flex flex-column gap-4 p-3`}>
            <h2>Recent Activity</h2>

        {links.map  ((item, index) => (
                <div className="d-flex justify-content-between align-items-center" key={index}>

                    <span className={`${style.icon} ${style[item.type]}`}><i className={`fa-solid ${item.icon}`}></i></span>

                    <div className={style.text}>
                        <h3>
                            {item.title}
                        </h3>
                        <p>
                            {item.subtitle}
                        </p>
                    </div>

                    <span className={`${style.mony} ${style[item.font]}`}>
                        {item.money}
                    </span>
                </div>
        ))}
        </div>
    )
}
export default Activity;