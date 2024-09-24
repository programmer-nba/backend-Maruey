const mongoose = require("mongoose");

const PartnerSchema = new mongoose.Schema(
  {
    business_type: { type: String, required: true, enum: ['บุคคลธรรมดา', 'นิติบุคคล'] },
    customer_id: { type: String, required: true },
    customer_username: { type: String, required: true },
    code: { type: String, unique: true },
    name: { type: String, required: true },
    tax_id: { type: String, default: "" },
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
    map_iframe: { type: String, default: null },
    map_lat: { type: String, default: "" },
    map_lon: { type: String, default: "" },
    open_days: { type: Array, default: [] },
    open_time: { type: String, default: "00:00" },
    close_time: { type: String, default: "00:00" },
    description: { type: String, default: "" },
    introduced_id: { type: String, default: null },
    status: { type: Number, default: 4, enum: [1, 2, 3, 4] }, // 1=active, 2=inactive, 3=deleted, 4=pending
    stars: { type: Number, default: 0 },
  },
  {
    timestamps: true
  }
)
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