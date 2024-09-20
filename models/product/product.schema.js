const mongoose = require("mongoose");

const partnerProductSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    shop_id: { type: String, required: true },
    status: { type: Number, required: true, default: 4 }, // 1=active,2=inactive,3=empty,4=pending
    raw_price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    selling_price: { type: Number, default: 0 },
    category: { type: String, required: true }, // สินค้า, บริการ, อื่นๆ
    tags: { type: Array, default: [] },
    stock: { type: Number, required: true, default: 0 },
    type: { type: String, default: 'partner' }
  },
  {
    timestamps: true
  }
);
partnerProductSchema.index({ code: 1 }, { unique: true });
const PartnerProduct = mongoose.model("PartnerProduct", partnerProductSchema);

module.exports = { PartnerProduct };


