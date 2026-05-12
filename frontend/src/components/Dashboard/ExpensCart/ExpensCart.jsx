import style from "./ExpensCart.module.css";

function ExponsCart() {

    const links = [
        { icon: "fa-money-bill", title: "Total Revenue", money: "$124,592", rate: "fa-arrow-up", precen: "12.5%", diff: "vs.  last month", diffMoney: "$110,748", type: "revenue" },
        { icon: "fa-receipt", title: "Total Expenses", money: "$82,340", rate: "fa-arrow-down", precen: "4.2%", diff: "vs.  last month", diffMoney: "$79,021", type: "expenses" },
        { icon: "fa-arrow-trend-up", title: "Net Profit", money: "$42,252", rate: "fa-arrow-up", precen: "28.1%", diff: "vs.  last month", diffMoney: "$32,980", type: "profit" },
    ]
    return (
        <div className={`${style.expCartSec} container`}>
            <div className="row gy-3">
            {links.map((item, index) => (
                <div key={index} className="col-12 col-md-6 col-lg-4">
                    <div className={`${style.expCart} ${style[item.type]}  justify-content-between p-3 h-100 gap-2`}>
                        
                        <div>
                            <div className="d-flex justify-content-between align-items-center">

                                <h4 className={style.title}>{item.title}</h4>

                                <span className={style.backicon}>
                                    <i className={`fa-solid ${item.icon}`}></i>
                                </span>
                            </div>

                            <div className="d-flex align-items-center gap-2">

                                <h2>{item.money}</h2>

                                <span>
                                    <i className={`fa-solid ${item.rate}`}></i>
                                    {item.precen}
                                </span>

                            </div>
                            <span>
                                {item.diffMoney}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        </div>
    )
}

export default ExponsCart;

// d-flex flex-wrap container justify-content-between align-items-center gap-3 p-3