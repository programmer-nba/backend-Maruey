const dayjs = require('dayjs');
const buddhistEra = require("dayjs/plugin/buddhistEra");
dayjs.extend(buddhistEra);
dayjs.locale("th");

const { Order } = require("../../models/order/order.schema");

exports.getShopOrderReports = async (req, res) => {
    const { username } = req.params;
    const { status } = req.query;

    try {
        if (!username) {
            return res.status(400).json({ message: "Invalid request", status: false });
        }

        let findStatus = parseInt(status) || 3;

        const all_orders = await Order.find({ shop_username: username });
        const statuses = all_orders.map((order) => order.status);
        const all = statuses.length;
        const paid = statuses.filter((status) => status === 1).length;
        const pending = statuses.filter((status) => status === 4).length;
        const cancel = statuses.filter((status) => status === -1).length;
        const delivery = statuses.filter((status) => status === 2).length;
        const done = statuses.filter((status) => status === 3).length;
        //console.log(statuses);
        const order_status = { all, paid, pending, cancel, delivery, done };

        const orders = await Order.aggregate([
            { $match: { shop_username: username, status: { $nin: [4, -1] } } },
            { 
                $group: { 
                    _id: null, 
                    total_income: { $sum: "$total_income" }, 
                    total_pv: { $sum: "$total_pv" } 
                } 
            }
        ]);

        if (orders.length === 0) {
            return res.status(404).json({ message: "No orders found", status: false });
        }

        return res.status(200).json({ message: "success", data: {...orders[0], order_status}, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
};