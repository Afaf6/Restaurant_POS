
const Order = require('../models/orderModel');

const getData = async (req, res) => {

    try {

        const days = parseInt(req.query.days) || 30;

        const startDate = new Date();
        // startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - days);

        const orders = await Order.find({
            // createdAt: { $gte: startDate },
            status: { $in: ["completed", "pending", "success"] }
        })
            .populate("cashier", "userName") 
            .sort({ createdAt: -1 });

        const completeOrders = orders.filter(order => order.status === "completed");

        const totalRevenue = completeOrders.reduce((sum, order) => 
             sum + (order.totalPrice || 0), 0);

        const totalOrders = orders.length;


        // compare this month and the last 
        const now = new Date();

        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);


        const currentMonthRevenue = completeOrders
        .filter(order => new Date(order.createdAt) >= currentMonth)
            .reduce((sum, order) => sum + (order.totalPrice || 0), 0) ;

        const lastMonthRevenue = completeOrders.filter(order =>
            new Date(order.createdAt) >= lastMonth &&
            new Date(order.createdAt) < currentMonth
        ).reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    

       const revenueChange = lastMonthRevenue === 0 ? 0 : (
        ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1);

        const activity = orders.slice(0,10).map(order => ({
            icon: "fa-burger",
            title: order.customerName || "Customer",
            subtitle: `Table ${order.tableNumber || "?"} • ${new Date(order.createdAt).toLocaleTimeString('en-US',
                { hour: '2-digit', minute: '2-digit' }
             )} `,
             money: `$${(order.totalPrice || 0).toFixed(2)}`,
            type: order.status === 'completed' ? "background-g" : 
                  order.status === 'cancelled' ? "background-r" : "background-b",
            font: order.status === 'completed' ? "fontG" : "fontR"
        }))

        // Chart

        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            const dailySales = completeOrders
                .filter(order => new Date(order.createdAt).toDateString() === d.toDateString())
                .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
            return { day: dayName, sales: dailySales };
        }).reverse();

        res.json({
           summary: {
            revenue: totalRevenue.toFixed(2),
            expenses: 0,
            profit: totalRevenue.toFixed(2),
            revenueChange: Number(revenueChange),
            lastMonthRevenue: lastMonthRevenue.toFixed(2),
            lastMonthExpenses: 0,
            lastMonthProfit: lastMonthRevenue.toFixed(2)
           },
           totalOrders,
           activity,
           comparison: {
            currentMonthRevenue: currentMonthRevenue.toFixed(2),
            lastMonthRevenue: lastMonthRevenue.toFixed(2),
            revenueChange
           },
           salesData: last7Days
        });
        
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    getData
}