const mongoose = require("mongoose");
const Joi = require("joi");

const withdrawmoneySchema = new mongoose.Schema(
  {
    customer_id:{type: mongoose.Schema.Types.ObjectId, ref: 'customer', default:null} ,
    partner_id:{type: mongoose.Schema.Types.ObjectId, ref: 'partner', default:null} ,
    type: { type: String, required: true }, // ถอนเงิน หรือ เติมเงิน
    money: { type: Number, required: true },
    date: { type: Date, default: Date.now() },
    status: { type: Boolean, default: false }, // true: จ่ายเงินสำเร็จ, false: รอดำเนินการ
    statusdetail: { type: [{
        status: { type: String, required: true }, // รอดำเนินการ, สำเร็จ
        date: { type: Date, default: Date.now() },
    }],default:[{
        status: "รอดำเนินการ",
        date: Date.now()
    }]},
    bank:{type:{
        accountname:{type:String,default:""}, //(ชื่อบัญชี)
        accountnumber:{type:String,default:""}, //(เลขบัญชี) 
        name:{type:String,default:""}, //(ชื่อธนาคาร)
        branch:{type:String,default:""}, //(สาขา)
       
    },default:null},
    admin_id:{type: mongoose.Schema.Types.ObjectId, ref: 'admin', default:null} ,
  },
  {timestamps: true}
);

const Withdrawmoney = mongoose.model("withdrawmoney", withdrawmoneySchema);


module.exports = {Withdrawmoney};