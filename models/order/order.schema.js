const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, UUID: true, unique: true },
        buyer_id: { type: String, required: true },
        buyer_username: { type: String, required: true },
        shop_id: { type: String, required: true },
        shop_username: { type: String, required: true },
        line_product: { type: Array, required: true },
        total_qty: { type: Number, required: true },
        total_product_price: { type: Number, required: true },
        total_discount: { type: Number, default: 0 },
        bill_discount: { type: Number, default: 0 },
        transfer_method: { type: String, default: "" },
        tracking_no: { type: String, default: "" },
        delivery_provider: { type: String, default: "" },
        delivery_price: { type: Number, default: 0 },
        vat_percent: { type: Number, default: 0 },
        vat_price: { type: Number, default: 0 },
        withholding_percent: { type: Number, default: 0 },
        withholding_price: { type: Number, default: 0 },
        net_price: { type: Number, default: 0 },
        status: { type: Number, default: 4 },
        to_address: { type: Object, default: null },
        total_pv: { type: Number, default: 0 },
    },
    {
        timestamps: true
    }
);
orderSchema.index({ code: 1 }, { unique: true });
const Order = mongoose.model("Order", orderSchema);

const deliveryStatusSchema = new mongoose.Schema(
    {
        order_id: { type: String, required: true },
        order_code: { type: String, required: true },
        status: { type: Number, required: true, default: 1 }
    },
    {
        timestamps: true
    }
);
const DeliveryStatus = mongoose.model("DeliveryStatus", deliveryStatusSchema);

module.exports = { Order, DeliveryStatus };