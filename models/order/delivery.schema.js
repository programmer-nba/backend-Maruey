const mongoose = require("mongoose");

const deliveryAddressSchema = new mongoose.Schema(
    {
        label: { type: String, required: true },
        customer_id: { type: String, required: true },
        customer_usernmae: { type: String, required: true },
        address: { type: String, required: true },
        moo: { type: String, required: true },
        soi: { type: String, default: "" },
        road: { type: String, required: "" },
        province: { type: String, required: true },
        amphure: { type: String, required: true },
        tambon: { type: String, required: true },
        zipcode: { type: String, required: true },
        receiver_name: { type: String, required: true },
        receiver_phone: { type: String, required: true },
    },
    {
        timestamps: true
    }
);

const DeliveryAddress = mongoose.model("DeliveryAddress", deliveryAddressSchema);
module.exports = { DeliveryAddress };