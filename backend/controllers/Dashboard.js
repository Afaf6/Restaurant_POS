const Order = require('../models/orderModel');
const Inventory = require('../models/inventoryModel');
const Auth = require('../models/Auth');

const getData = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // ── Fetch all data ──
        const [orders, inventory, staff] = await Promise.all([
            Order.find({ status: { $in: ['completed', 'pending', 'refunded', 'cancelled'] } })
                .populate('cashier', 'userName email role')
                .populate({ path: 'items.product', populate: { path: 'ingredients.inventoryItem' } })
                .sort({ createdAt: -1 }),
            Inventory.find(),
            Auth.find({}, 'userName email role createdAt')
        ]);

        const calculateOrderExpenses = (order) => {
            let cost = 0;
            if (!order.items) return 0;
            for (const item of order.items) {
                const product = item.product;
                if (!product) continue;
                let productCost = 0;
                if (product.ingredients && product.ingredients.length > 0) {
                    for (const ing of product.ingredients) {
                        productCost += (ing.inventoryItem?.costPrice || 0) * ing.quantity;
                    }
                } else {
                    productCost = (product.price || 0) * 0.5;
                }
                cost += productCost * (item.quantity || 1);
            }
            return cost;
        };

        const completedOrders = orders.filter(o => o.status === 'completed');
        const refundedOrders  = orders.filter(o => o.status === 'refunded');
        const cancelledOrders = orders.filter(o => o.status === 'cancelled');
        const pendingOrders   = orders.filter(o => o.status === 'pending');

        const totalRevenue  = completedOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
        const totalExpenses = [...completedOrders, ...refundedOrders].reduce((s, o) => s + calculateOrderExpenses(o), 0);
        const totalProfit   = Math.max(0, totalRevenue - totalExpenses);

        // ── Month comparison ──
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart    = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const inRange = (order, from, to) => {
            const d = new Date(order.createdAt);
            return d >= from && (!to || d < to);
        };

        const currentMonthRevenue  = completedOrders.filter(o => inRange(o, currentMonthStart)).reduce((s, o) => s + (o.totalPrice || 0), 0);
        const currentMonthExpenses = [...completedOrders, ...refundedOrders].filter(o => inRange(o, currentMonthStart)).reduce((s, o) => s + calculateOrderExpenses(o), 0);
        const currentMonthProfit   = Math.max(0, currentMonthRevenue - currentMonthExpenses);

        const lastMonthRevenue  = completedOrders.filter(o => inRange(o, lastMonthStart, currentMonthStart)).reduce((s, o) => s + (o.totalPrice || 0), 0);
        const lastMonthExpenses = [...completedOrders, ...refundedOrders].filter(o => inRange(o, lastMonthStart, currentMonthStart)).reduce((s, o) => s + calculateOrderExpenses(o), 0);
        const lastMonthProfit   = Math.max(0, lastMonthRevenue - lastMonthExpenses);

        const pctChange = (curr, prev) => prev === 0 ? 0 : Number(((curr - prev) / prev * 100).toFixed(1));

        // ── Last 7 days chart ──
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            const dailySales = completedOrders
                .filter(o => new Date(o.createdAt).toDateString() === d.toDateString())
                .reduce((s, o) => s + (o.totalPrice || 0), 0);
            return { day: dayName, sales: dailySales };
        }).reverse();

        // ── Activity feed ──
        const activity = orders.slice(0, 10).map(order => {
            const orderNum = order.orderNumber
                ? `Order #${String(order.orderNumber).padStart(5, '0')}`
                : `Order #${String(order._id).substring(18).toUpperCase()}`;
            return {
                icon: 'fa-burger',
                title: orderNum,
                subtitle: `${new Date(order.createdAt).toLocaleDateString('en-US')} • ${new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
                money: `$${(order.totalPrice || 0).toFixed(2)}`,
                type: order.status === 'completed' ? 'background-g' : order.status === 'refunded' ? 'background-b' : 'background-r',
                font: order.status === 'completed' ? 'fontG' : 'fontR'
            };
        });

        // ── Top selling products ──
        const productMap = {};
        completedOrders.forEach(order => {
            (order.items || []).forEach(item => {
                const name = item.product?.name || 'Unknown';
                const id   = String(item.product?._id || name);
                if (!productMap[id]) productMap[id] = { name, qty: 0, revenue: 0, cost: 0 };
                productMap[id].qty     += item.quantity || 1;
                productMap[id].revenue += (item.price || 0) * (item.quantity || 1);
                // cost per unit
                let unitCost = 0;
                if (item.product?.ingredients?.length > 0) {
                    item.product.ingredients.forEach(ing => {
                        unitCost += (ing.inventoryItem?.costPrice || 0) * ing.quantity;
                    });
                } else {
                    unitCost = (item.product?.price || 0) * 0.5;
                }
                productMap[id].cost += unitCost * (item.quantity || 1);
            });
        });
        const topProducts = Object.values(productMap)
            .sort((a, b) => b.revenue - a.revenue)
            .map(p => ({
                ...p,
                profit: p.revenue - p.cost,
                margin: p.revenue > 0 ? ((p.revenue - p.cost) / p.revenue * 100).toFixed(1) + '%' : '0%'
            }));

        // ── Cashier performance ──
        const cashierMap = {};
        completedOrders.forEach(order => {
            const id   = String(order.cashier?._id || 'unknown');
            const name = order.cashier?.userName || 'Unknown';
            if (!cashierMap[id]) cashierMap[id] = { name, email: order.cashier?.email || '', orders: 0, revenue: 0 };
            cashierMap[id].orders++;
            cashierMap[id].revenue += order.totalPrice || 0;
        });
        const cashierPerformance = Object.values(cashierMap).sort((a, b) => b.revenue - a.revenue);

        // ── Daily breakdown (full period) ──
        const dailyMap = {};
        completedOrders.forEach(order => {
            const day = new Date(order.createdAt).toLocaleDateString('en-US');
            if (!dailyMap[day]) dailyMap[day] = { date: day, orders: 0, revenue: 0, expenses: 0 };
            dailyMap[day].orders++;
            dailyMap[day].revenue  += order.totalPrice || 0;
            dailyMap[day].expenses += calculateOrderExpenses(order);
        });
        const dailyBreakdown = Object.values(dailyMap)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(d => ({ ...d, profit: d.revenue - d.expenses }));

        // ── Full order log ──
        const orderLog = orders.map(order => ({
            orderNumber: order.orderNumber ? `#${String(order.orderNumber).padStart(5, '0')}` : String(order._id).substring(18).toUpperCase(),
            date: new Date(order.createdAt).toLocaleDateString('en-US'),
            time: new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            cashier: order.cashier?.userName || 'Unknown',
            items: (order.items || []).map(i => `${i.product?.name || 'Unknown'} x${i.quantity}`).join(', '),
            itemCount: (order.items || []).reduce((s, i) => s + (i.quantity || 1), 0),
            revenue: order.totalPrice || 0,
            expenses: calculateOrderExpenses(order),
            profit: (order.totalPrice || 0) - calculateOrderExpenses(order),
            status: order.status
        }));

        // ── Inventory snapshot ──
        const inventorySnapshot = inventory.map(item => ({
            itemName: item.itemName,
            sku: item.sku,
            category: item.category,
            currentQuantity: item.currentQuantity,
            minimumStock: item.minimumStock,
            unit: item.unit,
            costPrice: item.costPrice,
            sellingPrice: item.sellingPrice,
            stockValue: (item.currentQuantity * item.costPrice).toFixed(2),
            status: item.status,
            expiryDate: item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-US') : 'N/A',
            lastRestocked: item.lastRestockedDate ? new Date(item.lastRestockedDate).toLocaleDateString('en-US') : 'N/A'
        }));

        res.json({
            summary: {
                revenue: totalRevenue.toFixed(2),
                expenses: totalExpenses.toFixed(2),
                profit: totalProfit.toFixed(2),
                revenueChange: pctChange(currentMonthRevenue, lastMonthRevenue),
                expensesChange: pctChange(currentMonthExpenses, lastMonthExpenses),
                profitChange: pctChange(currentMonthProfit, lastMonthProfit),
                lastMonthRevenue: lastMonthRevenue.toFixed(2),
                lastMonthExpenses: lastMonthExpenses.toFixed(2),
                lastMonthProfit: lastMonthProfit.toFixed(2),
                totalOrders: orders.length,
                completedOrders: completedOrders.length,
                refundedOrders: refundedOrders.length,
                cancelledOrders: cancelledOrders.length,
                pendingOrders: pendingOrders.length,
                totalStaffCount: staff.length
            },
            activity,
            salesData: last7Days,
            topProducts,
            cashierPerformance,
            dailyBreakdown,
            orderLog,
            inventorySnapshot,
            staffList: staff.map(s => ({
                name: s.userName,
                email: s.email,
                role: s.role,
                joinedDate: new Date(s.createdAt).toLocaleDateString('en-US')
            }))
        });

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = { getData };
