const mongoose = require("mongoose");

const PartnerSchema = new mongoose.Schema(
  {
    customer_id: { type: String, required: true },
    customer_username: { type: String, required: true },
    code: { type: String, required: true, UUID: true, unique: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    moo: { type: String, required: true },
    soi: { type: String, default: "" },
    road: { type: String, default: "" },
    tambon: { type: String, required: true },
    amphure: { type: String, required: true },
    province: { type: String, required: true },
    zipcode: { type: String, required: true },
    phone: { type: String, required: true },
    map_url: { type: String, default: "" },
    map_lat: { type: String, default: "" },
    map_lon: { type: String, default: "" },
    opendays: { type: Array, default: [] },
    description: { type: String, default: "" },
    status: { type: Number, default: 4, enum: [1, 2, 3, 4] }, // 1=active, 2=inactive, 3=deleted, 4=pending
  },
  {
    timestamps: true
  }
)
PartnerSchema.index({ code: 1 }, { unique: true });
const Partner = mongoose.model("Partner", PartnerSchema);

const PartnerPicetureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    partner_id: { type: String, required: true },
    path: { type: String, required: true },
    description: { type: String, default: "" },
  },
  {
    timestamps: true
  }
)
const PartnerPicture = mongoose.model("PartnerPicture", PartnerPicetureSchema);

const PartnerLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    partner_id: { type: String, required: true },
    description: { type: String, default: "" },
  },
  {
    timestamps: true
  }
)
const PartnerLog = mongoose.model("PartnerLog", PartnerLogSchema);

module.exports = { Partner, PartnerPicture, PartnerLog };