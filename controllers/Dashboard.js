
const Order = require('../models/orderModel');

const getData = async (req, res) => {

    try {

        const orders = await Order.find().sort({ createdAt: -1 });


        const totalRevenue = orders.reduce((sum, order) => 
             sum + (order.totalPrice || 0), 0);


        const totalOrders = orders.length;

        const totalExpenses = orders.reduce((sum, order) => {
            return sum + (order.expenses || 0);
        }, 0);

        const netProfit = totalRevenue - totalExpenses;

        const recentOrders = orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);


        // compare this month and the last 


        const now = new Date();

        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const currentMonthOrders = orders.filter(order => new Date(order.createdAt) >= currentMonth);

        const lastMonthOrders = orders.filter(order =>
            new Date(order.createdAt) >= lastMonth &&
            new Date(order.createdAt) < currentMonth
        );

        const currentMonthRevenue = currentMonthOrders.reduce(
            (sum, order) => sum + (order.totalPrice), 0
        )


        const lastMonthRevenue = lastMonthOrders.reduce(
            (sum, order) => sum + (order.totalPrice), 0
        );

       const revenueChange = lastMonthRevenue === 0 ? 0 : (
        ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1);


        res.json({
            totalRevenue,
            totalOrders,
            totalExpenses,
            netProfit,
            recentOrders,
            comparison: {
                currentMonthRevenue,
                lastMonthRevenue,
                revenueChange
            }
        })
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    getData
}