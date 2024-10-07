const { Order } = require("../../models/order/order.schema");
const dayjs = require("dayjs");
const buddhistEra = require("dayjs/plugin/buddhistEra");
dayjs.extend(buddhistEra);
dayjs.locale("th");

const generateOrderCode = async () => {
    const orders = await Order.find();
    const prefix = "PM"
    const curdate = dayjs().format("BBMMDD");
    const orderLength = orders.length + 1
    let code = `${prefix}${curdate}${orderLength.toString().padStart(4, "0")}`;
    return code
}

exports.createOrderPartner = async (req, res) => {
    const {
        buyer_id,
        buyer_username,
        shop_id,
        shop_username,
        line_product,
        total_qty,
        total_product_price,
        total_discount,
        bill_discount,
        transfer_method,
        //tracking_no,
        delivery_provider,
        delivery_price,
        vat_percent,
        vat_price,
        //withholding_percent,
        //withholding_price,
        net_price,
        status,
        to_address,
    } = req.body
    try {
        const code = await generateOrderCode();
        const newOrder = new Order({
            code,
            buyer_id,
            buyer_username,
            shop_id,
            shop_username,
            line_product,
            total_qty,
            total_product_price,
            total_discount,
            bill_discount,
            transfer_method,
            //tracking_no,
            delivery_provider,
            delivery_price,
            vat_percent,
            vat_price,
            //withholding_percent,
            //withholding_price,
            net_price,
            status,
            to_address,
        })
        const savedOrder = await newOrder.save();
        return res.status(200).json({ message: "success", data: savedOrder, status: true })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.updateOrderPartner = async (req, res) => {
    const {
        //buyer_id,
        //buyer_username,
        //shop_id,
        //shop_username,
        line_product,
        total_qty,
        total_product_price,
        total_discount,
        bill_discount,
        transfer_method,
        tracking_no,
        delivery_provider,
        delivery_price,
        vat_percent,
        vat_price,
        withholding_percent,
        withholding_price,
        net_price,
        status,
        to_address,
    } = req.body
    const { id } = req.params
    try {
        const existOrder = await Order.findById(id)
        if(!existOrder) return res.status(404).json({ message: "Order not found", status: false })
        const updatedOrder = await Order.findByIdAndUpdate( id, {
            //code,
            //buyer_id,
            //buyer_username,
            //shop_id,
            //shop_username,
            line_product: line_product || existOrder.line_product,
            total_qty: total_qty || existOrder.total_qty,
            total_product_price: total_product_price || existOrder.total_product_price,
            total_discount: total_discount || existOrder.total_discount,
            bill_discount: bill_discount || existOrder.bill_discount,
            transfer_method: transfer_method || existOrder.transfer_method,
            tracking_no: tracking_no || existOrder.tracking_no,
            delivery_provider: delivery_provider || existOrder.delivery_provider,
            delivery_price: delivery_price || existOrder.delivery_price,
            vat_percent: vat_percent || existOrder.vat_percent,
            vat_price: vat_price || existOrder.vat_price,
            withholding_percent: withholding_percent || existOrder.withholding_percent,
            withholding_price: withholding_price || existOrder.withholding_price,
            net_price: net_price || existOrder.net_price,
            status: status || existOrder.status,
            to_address: to_address || existOrder.to_address,
        }, { new: true })
        return res.status(200).json({ message: "success", data: updatedOrder, status: true })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.getUserOrdersPartner = async (req, res) => {
    const { username } = req.body
    try {
        const orders = await Order.find({ buyer_username: username });
        return res.status(200).json({ message: "success", data: orders, status: true })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.getUserOrderPartner = async (req, res) => {
    const { id } = req.params
    try {
        const order = await Order.findById(id);
        return res.status(200).json({ message: "success", data: order, status: true })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}
